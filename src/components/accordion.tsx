"use client";

import { useState } from "react";
import { Check, ChevronDown, X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface AccordionCase {
  title: string;
  detail: string;
}

interface AccordionProps {
  items: AccordionCase[];
  variant: "positive" | "negative";
}

export default function Accordion({ items, variant }: AccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const isPositive = variant === "positive";

  return (
    <div className="flex flex-col gap-2">
      {items.map((item, i) => {
        const isOpen = openIndex === i;
        return (
          <div
            key={item.title}
            className="overflow-hidden rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)]"
          >
            <button
              type="button"
              onClick={() => setOpenIndex(isOpen ? null : i)}
              aria-expanded={isOpen}
              className="flex w-full cursor-pointer items-center justify-between gap-3 border-0 bg-transparent px-4 py-3.5 text-left"
            >
              <span className="flex items-center gap-2.5">
                <span
                  className={cn(
                    "flex size-5 shrink-0 items-center justify-center rounded-full",
                    isPositive ? "bg-green-500/15 text-green-500" : "bg-red-500/15 text-red-500"
                  )}
                >
                  {isPositive ? <Check size={12} strokeWidth={3} /> : <X size={12} strokeWidth={3} />}
                </span>
                <span className="text-sm font-semibold text-[var(--color-ink)]">{item.title}</span>
              </span>
              <ChevronDown
                size={16}
                className={cn(
                  "shrink-0 text-[var(--color-muted)] transition-transform duration-300",
                  isOpen && "rotate-180"
                )}
              />
            </button>
            <div
              className={cn(
                "grid transition-all duration-300 ease-out",
                isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
              )}
            >
              <div className="overflow-hidden">
                <p className="m-0 px-4 pb-4 pl-[42px] text-sm leading-relaxed text-[var(--color-muted)]">
                  {item.detail}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
