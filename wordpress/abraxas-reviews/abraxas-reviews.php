<?php
/**
 * Plugin Name:       Abraxas Reviews
 * Description:       Reseñas de WooCommerce con fotos para el frontend headless: endpoint para crear reseñas (moderadas), endpoint de importación idempotente y fotos expuestas en la API de reseñas.
 * Version:           1.0.0
 * Requires at least: 6.0
 * Requires PHP:      7.4
 * Requires Plugins:  woocommerce
 * Author:            Colonia Cloud
 * License:           GPL-2.0-or-later
 * Text Domain:       abraxas-reviews
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Las rutas se registran bajo el namespace `wc/v3` a propósito: WooCommerce solo
 * autentica con consumer_key/consumer_secret las rutas `wp-json/wc/...`, así el
 * frontend reutiliza las mismas claves que ya usa para leer productos y no hace
 * falta crear ningún secreto nuevo.
 */
final class Abraxas_Reviews {

	const META_PHOTOS = 'abraxas_photo_ids';
	const META_SOURCE = 'abraxas_source_id';
	const MAX_PHOTOS  = 3;
	const MAX_BYTES   = 8388608; // 8 MB por foto, antes de reprocesarla.
	const MAX_EDGE    = 1600;    // Lado mayor de la foto guardada, en px.
	const DUP_DAYS    = 30;      // Una reseña por email y producto cada 30 días.

	public static function init() {
		add_action( 'rest_api_init', array( __CLASS__, 'register_routes' ) );
		add_filter( 'woocommerce_rest_prepare_product_review', array( __CLASS__, 'add_photos_to_response' ), 10, 2 );
		add_action( 'delete_comment', array( __CLASS__, 'delete_photos' ) );
		add_action( 'add_meta_boxes_comment', array( __CLASS__, 'add_metabox' ) );
	}

	public static function register_routes() {
		register_rest_route(
			'wc/v3',
			'/abraxas-reviews',
			array(
				'methods'             => WP_REST_Server::CREATABLE,
				'callback'            => array( __CLASS__, 'create_review' ),
				'permission_callback' => array( __CLASS__, 'can_manage' ),
			)
		);
		register_rest_route(
			'wc/v3',
			'/abraxas-reviews/import',
			array(
				'methods'             => WP_REST_Server::CREATABLE,
				'callback'            => array( __CLASS__, 'import_review' ),
				'permission_callback' => array( __CLASS__, 'can_manage' ),
			)
		);
		register_rest_route(
			'wc/v3',
			'/abraxas-reviews/recount',
			array(
				'methods'             => WP_REST_Server::CREATABLE,
				'callback'            => array( __CLASS__, 'recount_products' ),
				'permission_callback' => array( __CLASS__, 'can_manage' ),
			)
		);
	}

	/**
	 * Recalcula rating_count, average_rating y review_count de todos los productos a
	 * partir de las reseñas reales. Corrige contadores en caché que quedaron viejos.
	 */
	public static function recount_products() {
		$ids = get_posts(
			array(
				'post_type'      => 'product',
				'post_status'    => 'any',
				'posts_per_page' => -1,
				'fields'         => 'ids',
			)
		);
		foreach ( $ids as $id ) {
			self::refresh_product( (int) $id );
		}
		return new WP_REST_Response( array( 'recounted' => count( $ids ) ), 200 );
	}

	public static function can_manage() {
		return current_user_can( 'moderate_comments' ) || current_user_can( 'manage_woocommerce' );
	}

	/* ------------------------------------------------------------------
	 * Crear reseña (formulario público, llamado desde el servidor de Next)
	 * ---------------------------------------------------------------- */

	public static function create_review( WP_REST_Request $req ) {
		$fields = self::clean_fields( $req );
		if ( is_wp_error( $fields ) ) {
			return $fields;
		}

		if ( ! in_array( (string) $req->get_param( 'consent' ), array( '1', 'true', 'on' ), true ) ) {
			return new WP_Error( 'abraxas_consent', 'Falta aceptar la publicación de la reseña.', array( 'status' => 400 ) );
		}

		$duplicates = get_comments(
			array(
				'post_id'      => $fields['product_id'],
				'author_email' => $fields['email'],
				'type'         => 'review',
				'status'       => 'all',
				'count'        => true,
				'date_query'   => array( array( 'after' => self::DUP_DAYS . ' days ago' ) ),
			)
		);
		if ( $duplicates > 0 ) {
			return new WP_Error( 'abraxas_duplicate', 'Ya recibimos tu reseña de este producto. ¡Gracias!', array( 'status' => 409 ) );
		}

		$uploads = self::uploaded_photos( $req );
		if ( count( $uploads ) > self::MAX_PHOTOS ) {
			return new WP_Error( 'abraxas_photos', 'Podés subir hasta ' . self::MAX_PHOTOS . ' fotos.', array( 'status' => 400 ) );
		}
		foreach ( $uploads as $upload ) {
			$check = self::validate_photo( $upload );
			if ( is_wp_error( $check ) ) {
				return $check;
			}
		}

		$ip = (string) $req->get_param( 'client_ip' );
		if ( ! filter_var( $ip, FILTER_VALIDATE_IP ) ) {
			$ip = '';
		}

		$comment_id = wp_insert_comment(
			array(
				'comment_post_ID'      => $fields['product_id'],
				'comment_author'       => $fields['reviewer'],
				'comment_author_email' => $fields['email'],
				'comment_author_IP'    => $ip,
				'comment_agent'        => 'abraxas-headless',
				'comment_content'      => $fields['text'],
				'comment_type'         => 'review',
				'comment_approved'     => 0, // Siempre moderada: se publica desde wp-admin.
			)
		);
		if ( ! $comment_id ) {
			return new WP_Error( 'abraxas_insert', 'No pudimos guardar tu reseña.', array( 'status' => 500 ) );
		}

		add_comment_meta( $comment_id, 'rating', $fields['rating'], true );
		add_comment_meta( $comment_id, 'verified', self::is_verified( $fields['email'], $fields['product_id'] ) ? 1 : 0, true );

		$photo_ids = array();
		foreach ( $uploads as $upload ) {
			$attachment_id = self::save_photo( $upload );
			if ( is_wp_error( $attachment_id ) ) {
				foreach ( $photo_ids as $id ) {
					wp_delete_attachment( $id, true );
				}
				wp_delete_comment( $comment_id, true );
				return $attachment_id;
			}
			$photo_ids[] = $attachment_id;
		}
		if ( $photo_ids ) {
			add_comment_meta( $comment_id, self::META_PHOTOS, $photo_ids, true );
		}

		if ( function_exists( 'wp_notify_moderator' ) ) {
			wp_notify_moderator( $comment_id );
		}

		return new WP_REST_Response(
			array(
				'id'     => (int) $comment_id,
				'status' => 'hold',
				'photos' => count( $photo_ids ),
			),
			201
		);
	}

	/* ------------------------------------------------------------------
	 * Importar reseñas históricas (idempotente por source_id)
	 * ---------------------------------------------------------------- */

	public static function import_review( WP_REST_Request $req ) {
		$source = sanitize_text_field( (string) $req->get_param( 'source_id' ) );
		if ( '' === $source ) {
			return new WP_Error( 'abraxas_source', 'Falta source_id.', array( 'status' => 400 ) );
		}

		$existing = get_comments(
			array(
				'meta_key'   => self::META_SOURCE,
				'meta_value' => $source,
				'type'       => 'review',
				'status'     => 'all',
				'number'     => 1,
				'fields'     => 'ids',
			)
		);
		if ( $existing ) {
			return new WP_REST_Response( array( 'id' => (int) $existing[0], 'skipped' => true ), 200 );
		}

		$fields = self::clean_fields( $req );
		if ( is_wp_error( $fields ) ) {
			return $fields;
		}

		$approved = 'hold' === $req->get_param( 'status' ) ? 0 : 1;
		$args     = array(
			'comment_post_ID'      => $fields['product_id'],
			'comment_author'       => $fields['reviewer'],
			'comment_author_email' => $fields['email'],
			'comment_agent'        => 'abraxas-import',
			'comment_content'      => $fields['text'],
			'comment_type'         => 'review',
			'comment_approved'     => $approved,
		);

		$date_pattern = '/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/';
		$date         = (string) $req->get_param( 'date_created' );
		$date_gmt     = (string) $req->get_param( 'date_created_gmt' );
		if ( preg_match( $date_pattern, $date ) && preg_match( $date_pattern, $date_gmt ) ) {
			$args['comment_date']     = $date;
			$args['comment_date_gmt'] = $date_gmt;
		}

		$comment_id = wp_insert_comment( $args );
		if ( ! $comment_id ) {
			return new WP_Error( 'abraxas_insert', 'No se pudo importar la reseña.', array( 'status' => 500 ) );
		}

		add_comment_meta( $comment_id, 'rating', $fields['rating'], true );
		add_comment_meta( $comment_id, self::META_SOURCE, $source, true );
		add_comment_meta( $comment_id, 'verified', self::is_verified( $fields['email'], $fields['product_id'] ) ? 1 : 0, true );

		// El rating se guarda DESPUÉS de insertar el comentario, así que hay que
		// recalcular los contadores del producto (rating_count, average_rating).
		if ( $approved ) {
			self::refresh_product( $fields['product_id'] );
		}

		return new WP_REST_Response( array( 'id' => (int) $comment_id, 'skipped' => false ), 201 );
	}

	/* ------------------------------------------------------------------
	 * Validación y utilidades comunes
	 * ---------------------------------------------------------------- */

	private static function clean_fields( WP_REST_Request $req ) {
		$product_id = (int) $req->get_param( 'product_id' );
		$reviewer   = trim( sanitize_text_field( (string) $req->get_param( 'reviewer' ) ) );
		$email      = sanitize_email( (string) $req->get_param( 'reviewer_email' ) );
		$rating     = (int) $req->get_param( 'rating' );
		$text       = trim( sanitize_textarea_field( (string) $req->get_param( 'review' ) ) );

		if ( $product_id < 1 || 'product' !== get_post_type( $product_id ) || 'publish' !== get_post_status( $product_id ) ) {
			return new WP_Error( 'abraxas_product', 'El producto no existe.', array( 'status' => 404 ) );
		}
		$name_len = mb_strlen( $reviewer );
		if ( $name_len < 2 || $name_len > 60 ) {
			return new WP_Error( 'abraxas_name', 'Ingresá tu nombre (entre 2 y 60 caracteres).', array( 'status' => 400 ) );
		}
		if ( ! is_email( $email ) ) {
			return new WP_Error( 'abraxas_email', 'Ingresá un email válido.', array( 'status' => 400 ) );
		}
		if ( $rating < 1 || $rating > 5 ) {
			return new WP_Error( 'abraxas_rating', 'La valoración debe ser de 1 a 5 estrellas.', array( 'status' => 400 ) );
		}
		$text_len = mb_strlen( $text );
		if ( $text_len < 10 || $text_len > 2000 ) {
			return new WP_Error( 'abraxas_text', 'Contanos tu experiencia (entre 10 y 2000 caracteres).', array( 'status' => 400 ) );
		}

		return array(
			'product_id' => $product_id,
			'reviewer'   => $reviewer,
			'email'      => $email,
			'rating'     => $rating,
			'text'       => $text,
		);
	}

	private static function is_verified( $email, $product_id ) {
		return function_exists( 'wc_customer_bought_product' ) && wc_customer_bought_product( $email, 0, $product_id );
	}

	private static function refresh_product( $product_id ) {
		wp_update_comment_count( $product_id );
		if ( class_exists( 'WC_Comments' ) && method_exists( 'WC_Comments', 'clear_transients' ) ) {
			WC_Comments::clear_transients( $product_id );
		}
	}

	/* ------------------------------------------------------------------
	 * Fotos
	 * ---------------------------------------------------------------- */

	/**
	 * Lee $_FILES['photos']. El frontend debe enviar los archivos como `photos[]`.
	 */
	private static function uploaded_photos( WP_REST_Request $req ) {
		$files = $req->get_file_params();
		if ( empty( $files['photos'] ) ) {
			return array();
		}

		$raw = $files['photos'];
		$out = array();
		if ( is_array( $raw['name'] ) ) {
			foreach ( $raw['name'] as $i => $name ) {
				if ( UPLOAD_ERR_NO_FILE === (int) $raw['error'][ $i ] ) {
					continue;
				}
				$out[] = array(
					'name'     => $name,
					'tmp_name' => $raw['tmp_name'][ $i ],
					'error'    => (int) $raw['error'][ $i ],
					'size'     => (int) $raw['size'][ $i ],
				);
			}
		} elseif ( UPLOAD_ERR_NO_FILE !== (int) $raw['error'] ) {
			$out[] = $raw;
		}
		return $out;
	}

	private static function validate_photo( array $file ) {
		if ( UPLOAD_ERR_OK !== (int) $file['error'] || ! is_uploaded_file( $file['tmp_name'] ) ) {
			return new WP_Error( 'abraxas_photo_upload', 'No pudimos recibir una de las fotos. Probá con otra.', array( 'status' => 400 ) );
		}
		if ( (int) $file['size'] > self::MAX_BYTES ) {
			return new WP_Error( 'abraxas_photo_size', 'Cada foto puede pesar hasta 8 MB.', array( 'status' => 413 ) );
		}
		// Se mira el contenido real, no la extensión ni el tipo declarado por el navegador.
		$info = @getimagesize( $file['tmp_name'] );
		if ( ! $info || ! in_array( $info[2], array( IMAGETYPE_JPEG, IMAGETYPE_PNG, IMAGETYPE_WEBP ), true ) ) {
			return new WP_Error( 'abraxas_photo_type', 'Las fotos deben ser JPG, PNG o WebP.', array( 'status' => 415 ) );
		}
		return true;
	}

	/**
	 * Reprocesa la foto con GD (la reencodea como JPEG): elimina EXIF/GPS, corrige la
	 * orientación, limita el tamaño y descarta cualquier payload ajeno a la imagen.
	 * Devuelve el ID del adjunto o un WP_Error.
	 */
	private static function save_photo( array $file ) {
		if ( ! function_exists( 'imagecreatefromstring' ) ) {
			return new WP_Error( 'abraxas_photo_gd', 'El servidor no puede procesar imágenes.', array( 'status' => 500 ) );
		}

		$info = @getimagesize( $file['tmp_name'] );
		$data = @file_get_contents( $file['tmp_name'] );
		$img  = $data ? @imagecreatefromstring( $data ) : false;
		if ( ! $info || ! $img ) {
			return new WP_Error( 'abraxas_photo_type', 'Una de las fotos no se pudo leer.', array( 'status' => 415 ) );
		}

		if ( IMAGETYPE_JPEG === $info[2] && function_exists( 'exif_read_data' ) ) {
			$exif        = @exif_read_data( $file['tmp_name'] );
			$orientation = isset( $exif['Orientation'] ) ? (int) $exif['Orientation'] : 1;
			$angles      = array( 3 => 180, 6 => -90, 8 => 90 );
			if ( isset( $angles[ $orientation ] ) ) {
				$rotated = imagerotate( $img, $angles[ $orientation ], 0 );
				if ( $rotated ) {
					$img = $rotated;
				}
			}
		}

		$w = imagesx( $img );
		$h = imagesy( $img );
		if ( max( $w, $h ) > self::MAX_EDGE ) {
			$scaled = $w >= $h ? imagescale( $img, self::MAX_EDGE, -1, IMG_BICUBIC ) : imagescale( $img, (int) round( $w * self::MAX_EDGE / $h ), self::MAX_EDGE, IMG_BICUBIC );
			if ( $scaled ) {
				$img = $scaled;
				$w   = imagesx( $img );
				$h   = imagesy( $img );
			}
		}

		// Aplana sobre blanco (los PNG/WebP con transparencia no existen en JPEG).
		$canvas = imagecreatetruecolor( $w, $h );
		imagefill( $canvas, 0, 0, imagecolorallocate( $canvas, 255, 255, 255 ) );
		imagecopy( $canvas, $img, 0, 0, 0, 0, $w, $h );

		$uploads = wp_upload_dir();
		$subdir  = 'abraxas-reviews/' . gmdate( 'Y/m' );
		if ( ! wp_mkdir_p( $uploads['basedir'] . '/' . $subdir ) ) {
			return new WP_Error( 'abraxas_photo_dir', 'No pudimos guardar la foto.', array( 'status' => 500 ) );
		}

		// Nombre aleatorio e impredecible: las fotos no son públicas hasta aprobar la reseña.
		$filename = wp_generate_password( 24, false, false ) . '.jpg';
		$path     = $uploads['basedir'] . '/' . $subdir . '/' . $filename;
		if ( ! imagejpeg( $canvas, $path, 85 ) ) {
			return new WP_Error( 'abraxas_photo_write', 'No pudimos guardar la foto.', array( 'status' => 500 ) );
		}

		$attachment_id = wp_insert_attachment(
			array(
				'post_mime_type' => 'image/jpeg',
				'post_title'     => 'Foto de reseña',
				'post_status'    => 'inherit',
				'guid'           => $uploads['baseurl'] . '/' . $subdir . '/' . $filename,
			),
			$path
		);
		if ( is_wp_error( $attachment_id ) || ! $attachment_id ) {
			@unlink( $path );
			return new WP_Error( 'abraxas_photo_attach', 'No pudimos guardar la foto.', array( 'status' => 500 ) );
		}

		require_once ABSPATH . 'wp-admin/includes/image.php';
		wp_update_attachment_metadata( $attachment_id, wp_generate_attachment_metadata( $attachment_id, $path ) );

		return (int) $attachment_id;
	}

	/* ------------------------------------------------------------------
	 * Exponer las fotos en GET wc/v3/products/reviews
	 * ---------------------------------------------------------------- */

	public static function add_photos_to_response( $response, $comment ) {
		$ids    = get_comment_meta( $comment->comment_ID, self::META_PHOTOS, true );
		$photos = array();

		if ( is_array( $ids ) ) {
			foreach ( $ids as $id ) {
				$full = wp_get_attachment_image_src( (int) $id, 'full' );
				if ( ! $full ) {
					continue;
				}
				$thumb    = wp_get_attachment_image_src( (int) $id, 'medium_large' );
				$photos[] = array(
					'id'     => (int) $id,
					'url'    => $full[0],
					'width'  => (int) $full[1],
					'height' => (int) $full[2],
					'thumb'  => $thumb ? $thumb[0] : $full[0],
				);
			}
		}

		$data           = $response->get_data();
		$data['photos'] = $photos;
		$response->set_data( $data );
		return $response;
	}

	/** Borra las fotos al eliminar definitivamente una reseña. */
	public static function delete_photos( $comment_id ) {
		$ids = get_comment_meta( $comment_id, self::META_PHOTOS, true );
		if ( is_array( $ids ) ) {
			foreach ( $ids as $id ) {
				wp_delete_attachment( (int) $id, true );
			}
		}
	}

	/* ------------------------------------------------------------------
	 * Admin: ver las fotos al moderar la reseña
	 * ---------------------------------------------------------------- */

	public static function add_metabox( $comment ) {
		$ids = get_comment_meta( $comment->comment_ID, self::META_PHOTOS, true );
		if ( empty( $ids ) || ! is_array( $ids ) ) {
			return;
		}
		add_meta_box(
			'abraxas_review_photos',
			'Fotos de la reseña',
			array( __CLASS__, 'render_metabox' ),
			'comment',
			'normal'
		);
	}

	public static function render_metabox( $comment ) {
		$ids = get_comment_meta( $comment->comment_ID, self::META_PHOTOS, true );
		echo '<div style="display:flex;gap:12px;flex-wrap:wrap">';
		foreach ( (array) $ids as $id ) {
			$full = wp_get_attachment_image_src( (int) $id, 'full' );
			$med  = wp_get_attachment_image_src( (int) $id, 'medium' );
			if ( ! $full ) {
				continue;
			}
			printf(
				'<a href="%1$s" target="_blank" rel="noopener"><img src="%2$s" alt="" style="max-width:220px;height:auto;border-radius:6px"></a>',
				esc_url( $full[0] ),
				esc_url( $med ? $med[0] : $full[0] )
			);
		}
		echo '</div>';
	}
}

Abraxas_Reviews::init();
