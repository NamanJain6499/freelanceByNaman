import React from "react";
import { stackIntro, stackGroups } from "../content";

export default function StackSection() {
  return (
    <section id="stack" className="section border-b border-[#141414]">
      <div className="container-x">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-4">
            <p className="mono text-xs uppercase tracking-wider text-zinc-500">{stackIntro.label}</p>
            <h2 className="mt-4 text-3xl font-semibold leading-tight tracking-tight text-white sm:text-4xl md:text-5xl">
              The <span className="serif accent-text">{stackIntro.titleAccent}</span> {stackIntro.titleAfter}
            </h2>
            <p className="mt-6 text-sm leading-relaxed text-zinc-500 sm:text-[15px]">{stackIntro.sub}</p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:col-span-8">
            {stackGroups.map((g) => (
              <div
                key={g.title}
                className="rounded-2xl border border-[#1c1c1c] bg-[#0d0d0d] p-5 sm:p-6"
              >
                <div className="flex items-center justify-between">
                  <span className="mono text-[10px] font-medium uppercase tracking-widest text-zinc-500">
                    {g.title}
                  </span>
                  <span className="mono text-xs text-zinc-600">{g.count}</span>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {g.tags.map((t) => (
                    <span
                      key={t}
                      className="rounded-full border border-[#2a2a2a] bg-[#141414] px-3 py-1.5 text-xs font-medium text-zinc-200"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
