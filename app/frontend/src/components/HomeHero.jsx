import React from "react";
import { ArrowUpRight, Download } from "lucide-react";
import { profile, hero, terminalBlocks, heroStats, marqueeTags } from "../content";

function TerminalWindow() {
  return (
    <div className="overflow-hidden rounded-2xl border border-[#1f1f1f] bg-[#0a0a0a] shadow-[0_0_0_1px_rgba(255,255,255,0.03)]">
      <div className="flex items-center gap-2 border-b border-[#1a1a1a] bg-[#111] px-3 py-2.5">
        <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
        <span className="ml-2 mono text-[11px] text-zinc-500">~/naman/portfolio — zsh</span>
      </div>
      <div className="mono space-y-5 p-4 text-[12px] leading-relaxed text-zinc-400 sm:p-5 sm:text-[13px]">
        {terminalBlocks.map((block) => (
          <div key={block.command}>
            <div className="text-lime-300/90">
              <span className="text-zinc-500">$</span> {block.command}
            </div>
            {block.lines.map((line) => (
              <div key={line} className="mt-1 pl-0 text-zinc-300">
                {line}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function StatCard({ value, label }) {
  return (
    <div className="card-surface flex flex-col justify-between rounded-2xl border border-[#1c1c1c] bg-[#0d0d0d] p-5 sm:p-6">
      <div className="text-xl font-semibold tracking-tight text-zinc-50 sm:text-2xl">{value}</div>
      <div className="mono mt-4 text-[10px] font-medium uppercase tracking-widest text-zinc-500">{label}</div>
    </div>
  );
}

function ProductionCard() {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-[#1c1c1c] bg-[#0d0d0d] p-5 sm:flex-row sm:items-start sm:gap-4 sm:p-6">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-lime-300/15 text-lime-300">
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      </span>
      <div>
        <h3 className="text-base font-semibold text-zinc-100">Production-grade by default</h3>
        <p className="mt-2 text-sm leading-relaxed text-zinc-500">
          Everything I ship is code-reviewed, monitored, documented and handed over with runbooks.
        </p>
      </div>
    </div>
  );
}

function Marquee() {
  const doubled = [...marqueeTags, ...marqueeTags];
  return (
    <div className="relative mt-14 overflow-hidden border-y border-[#141414] bg-black py-4">
      <div className="marquee-track mono flex w-max gap-10 text-[11px] font-medium uppercase tracking-[0.2em] text-zinc-500">
        {doubled.map((tag, i) => (
          <span key={`${tag}-${i}`}>{tag}</span>
        ))}
      </div>
    </div>
  );
}

export default function HomeHero() {
  return (
    <>
      <section id="top" className="border-b border-[#141414] pb-16 pt-10 md:pb-20 md:pt-14">
        <div className="container-x">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#242424] bg-[#0d0d0d] px-3 py-1.5 mono text-[11px] text-zinc-400">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-lime-300/60 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-lime-300" />
            </span>
            {hero.availability}
          </div>

          <h1 className="mt-8 max-w-4xl text-4xl font-semibold leading-[1.08] tracking-tight text-white sm:text-5xl md:text-6xl lg:text-[3.35rem]">
            {hero.titleBefore}{" "}
            <span className="serif accent-text">{hero.titleAccent}</span>
          </h1>

          <p className="mt-8 max-w-2xl text-base leading-relaxed text-zinc-500 sm:text-lg">{hero.bio}</p>

          <div className="mt-10 flex flex-wrap items-center gap-3">
            <a
              href="#contact"
              className="btn-accent inline-flex items-center gap-2 rounded-full px-6 py-3.5 text-sm font-semibold"
            >
              Start a project <ArrowUpRight className="h-4 w-4" />
            </a>
            <a
              href={profile.resumeUrl}
              className="inline-flex items-center gap-2 rounded-full border border-zinc-600 bg-transparent px-6 py-3.5 text-sm font-medium text-zinc-200 transition-colors hover:border-zinc-400"
            >
              <Download className="h-4 w-4" /> Download resume
            </a>
            <a
              href="#work"
              className="inline-flex items-center gap-1.5 px-3 py-2 text-sm text-zinc-400 transition-colors hover:text-lime-300"
            >
              See case studies <ArrowUpRight className="h-4 w-4" />
            </a>
          </div>
        </div>
      </section>

      <section className="section !py-16 md:!py-20">
        <div className="container-x">
          <div className="grid gap-6 lg:grid-cols-2 lg:gap-8">
            <TerminalWindow />
            <div className="grid gap-4 sm:grid-cols-2 sm:gap-4">
              {heroStats.slice(0, 2).map((s) => (
                <StatCard key={s.label} {...s} />
              ))}
              {heroStats.slice(2, 4).map((s) => (
                <StatCard key={s.label} {...s} />
              ))}
              <div className="sm:col-span-2">
                <ProductionCard />
              </div>
            </div>
          </div>
        </div>
      </section>

      <Marquee />
    </>
  );
}
