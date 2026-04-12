import sanitizeHtml from "sanitize-html";

const defaultOptions: sanitizeHtml.IOptions = {
	allowedTags: sanitizeHtml.defaults.allowedTags.concat([
		"img",
		"figure",
		"figcaption",
		"picture",
		"source",
	]),
	allowedAttributes: {
		...sanitizeHtml.defaults.allowedAttributes,
		img: ["src", "alt", "width", "height", "loading", "class"],
		a: ["href", "title", "target", "rel"],
	},
	allowedSchemes: ["https", "http", "mailto"],
};

export function sanitize(dirty: string): string {
	return sanitizeHtml(dirty, defaultOptions);
}
