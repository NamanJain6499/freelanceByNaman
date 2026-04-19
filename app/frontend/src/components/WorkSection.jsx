import React, { useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { workIntro, caseStudies } from "../content";

export default function WorkSection() {
  const [activeId, setActiveId] = useState(caseStudies[0].id);
  const active = caseStudies.find((c) => c.id === activeId) || caseStudies[0];

  return (
    <section id="work" className="section border-b border-[#141414]">
      <div className="container-x">
        <div className="grid gap-8 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-7">
            <p className="mono text-xs uppercase tracking-wider text-zinc-500">{workIntro.label}</p>
            <h2 className="mt-4 text-3xl font-semibold leading-tight tracking-tight text-white sm:text-4xl md:text-5xl">
              {workIntro.titleBefore}{" "}
              <span className="serif accent-text">{workIntro.titleAccent}</span>
            </h2>
          </div>
          <p className="text-sm leading-relaxed text-zinc-500 lg:col-span-5 lg:text-right lg:text-[15px]">
            {workIntro.sub}
          </p>
        </div>

        <div className="mt-14 grid gap-6 lg:grid-cols-12 lg:gap-8">
          <div className="flex flex-col gap-3 lg:col-span-5">
            {caseStudies.map((c) => {
              const isOn = c.id === activeId;
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setActiveId(c.id)}
                  className={`rounded-2xl border p-5 text-left transition-colors ${
                    isOn
                      ? "border-lime-300/40 bg-[#101010] ring-1 ring-lime-300/20"
                      : "border-[#1c1c1c] bg-[#0a0a0a] hover:border-zinc-700"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="mono text-[10px] uppercase tracking-wider text-zinc-500">{c.company}</span>
                    <span className="shrink-0 mono text-[10px] font-medium text-lime-300">{c.metric}</span>
                  </div>
                  <div className="mt-3 text-base font-semibold text-zinc-100">{c.title}</div>
                </button>
              );
            })}
          </div>

          <div className="rounded-2xl border border-[#1c1c1c] bg-[#0d0d0d] p-6 sm:p-8 lg:col-span-7">
            <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[#1a1a1a] pb-5">
              <span className="mono text-[10px] uppercase tracking-wider text-zinc-500">
                {active.company} · case study
              </span>
              <span className="mono text-[11px] font-medium text-lime-300">{active.metric}</span>
            </div>
            <h3 className="mt-6 text-2xl font-semibold tracking-tight text-white sm:text-3xl">{active.title}</h3>
            <p className="mt-4 text-sm leading-relaxed text-zinc-500 sm:text-base">{active.summary}</p>

            <div className="mt-8 grid gap-6 sm:grid-cols-3">
              {[
                { k: "Problem", v: active.problem },
                { k: "Approach", v: active.approach },
                { k: "Outcome", v: active.outcome },
              ].map((col) => (
                <div key={col.k}>
                  <div className="mono text-[10px] uppercase tracking-widest text-zinc-500">{col.k}</div>
                  <p className="mt-2 text-sm leading-relaxed text-zinc-300">{col.v}</p>
                </div>
              ))}
            </div>

            <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-[#1a1a1a] pt-6">
              <div className="flex flex-wrap gap-2">
                {active.tags.map((t) => (
                  <span
                    key={t}
                    className="rounded-full border border-[#2a2a2a] bg-[#111] px-2.5 py-1 mono text-[10px] text-zinc-400"
                  >
                    {t}
                  </span>
                ))}
              </div>
              <a
                href="#contact"
                className="inline-flex items-center gap-1 text-sm font-medium text-zinc-400 transition-colors hover:text-lime-300"
              >
                Request full case study <ArrowUpRight className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
