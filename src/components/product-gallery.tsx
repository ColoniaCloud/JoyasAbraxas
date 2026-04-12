"use client";

import Image from "next/image";
import { useState } from "react";
import type { WPImage } from "@/lib/types";

interface ProductGalleryProps {
	images: WPImage[];
	productName: string;
}

export default function ProductGallery({ images, productName }: ProductGalleryProps) {
	const [selectedIndex, setSelectedIndex] = useState(0);

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
			<div className="relative aspect-square overflow-hidden rounded-2xl bg-[#1c1a18]">
				<Image
					src={mainImage.src}
					alt={mainImage.alt || productName}
					fill
					className="object-cover transition-opacity duration-300"
					priority
					sizes="(max-width: 768px) 100vw, 50vw"
				/>
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
