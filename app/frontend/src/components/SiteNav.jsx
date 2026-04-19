import React from "react";
import { ArrowUpRight } from "lucide-react";
import { profile, navLinks } from "../content";

export default function SiteNav() {
  return (
    <header className="sticky top-0 z-50 border-b border-[#1a1a1a] bg-black/85 backdrop-blur-md">
      <div className="container-x flex h-14 md:h-16 items-center justify-between gap-4">
        <a href="#top" className="flex shrink-0 items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-md bg-lime-300 text-xs font-bold text-[#0a0a0b] mono md:h-9 md:w-9 md:text-sm">
            nj
          </span>
          <span className="text-sm font-medium text-zinc-100 md:text-[15px]">
            {profile.name}{" "}
            <span className="text-zinc-500 font-normal">/ {profile.subtitle}</span>
          </span>
        </a>

        <nav className="mx-1 hidden max-w-[min(56vw,24rem)] items-center gap-3 overflow-x-auto whitespace-nowrap sm:flex sm:max-w-none sm:gap-5 md:gap-6 lg:gap-7">
          {navLinks.map((n) => (
            <a
              key={n.href}
              href={n.href}
              className="shrink-0 text-[11px] text-zinc-400 transition-colors hover:text-zinc-100 sm:text-[12px] md:text-[13px]"
            >
              {n.label}
            </a>
          ))}
        </nav>

        <a
          href="#contact"
          className="btn-accent inline-flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-semibold md:px-4 md:text-sm"
        >
          Hire me <ArrowUpRight className="h-3.5 w-3.5 md:h-4 md:w-4" />
        </a>
      </div>
    </header>
  );
}
