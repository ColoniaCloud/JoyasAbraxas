"use client";

import Image from "next/image";
import { useState } from "react";
import { MotionConfig } from "motion/react";
import { Lens } from "@/components/ui/lens";
import type { WPImage } from "@/lib/types";

interface ProductGalleryProps {
	images: WPImage[];
	productName: string;
}

export default function ProductGallery({ images, productName }: ProductGalleryProps) {
	const [selectedIndex, setSelectedIndex] = useState(0);
	const [hovering, setHovering] = useState(false);

	// En pantallas táctiles el "hover" emulado dejaría la lupa pegada tras un toque.
	const handleHovering = (value: boolean) => {
		if (value && !window.matchMedia("(hover: hover)").matches) return;
		setHovering(value);
	};

	if (!images.length) {
		return (
			<div className="flex aspect-square items-center justify-center rounded-2xl bg-[#1c1a18] text-[var(--color-muted)]">
				Sin imagen
			</div>
		);
	}

	const mainImage = images[selectedIndex];

	return (
		<div className="flex flex-col gap-3">
			<div className="overflow-hidden rounded-2xl bg-[#1c1a18]">
				<MotionConfig reducedMotion="user">
					<Lens zoomFactor={2} hovering={hovering} setHovering={handleHovering}>
						{/* Lens renderiza los hijos dos veces (base + copia ampliada): el hijo debe ser autocontenido */}
						<div className="relative aspect-square">
							<Image
								src={mainImage.src}
								alt={mainImage.alt || productName}
								fill
								className="object-cover"
								priority
								sizes="(max-width: 768px) 100vw, 50vw"
							/>
						</div>
					</Lens>
				</MotionConfig>
			</div>

			{images.length > 1 && (
				<div className="flex gap-2 overflow-x-auto pb-1">
					{images.map((img, i) => (
						<button
							key={img.id}
							type="button"
							onClick={() => setSelectedIndex(i)}
							className={`relative size-20 shrink-0 cursor-pointer overflow-hidden rounded-lg bg-[#1c1a18] transition-all ${
								i === selectedIndex
									? "ring-2 ring-[var(--color-brand)] ring-offset-2 ring-offset-[var(--color-background)]"
									: "opacity-60 hover:opacity-100"
							}`}
						>
							<Image
								src={img.src}
								alt={img.alt || productName}
								fill
								className="object-cover"
								sizes="80px"
							/>
						</button>
					))}
				</div>
			)}
		</div>
	);
}
