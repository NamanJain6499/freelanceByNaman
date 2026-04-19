import React from "react";
import { engagements } from "../content";
import { Check, ArrowUpRight } from "lucide-react";

const Engagement = () => {
  return (
    <section id="engagement" className="section border-b border-[#141414]">
      <div className="container-x">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="mono text-xs uppercase tracking-wider text-zinc-500">/engagement</div>
            <h2 className="mt-4 text-3xl font-semibold leading-tight tracking-tight text-white sm:text-4xl md:text-5xl">
              Three ways to <span className="serif accent-text">work together.</span>
            </h2>
          </div>
          <p className="max-w-md text-sm leading-relaxed text-zinc-500 sm:text-base">
            Scoped engagements with clear deliverables. Custom shapes welcome —
            most clients start with an advisory sprint.
          </p>
        </div>

        <div className="mt-12 grid md:grid-cols-3 gap-5">
          {engagements.map((e) => (
            <div
              key={e.name}
              className={`relative flex flex-col rounded-2xl border border-[#1c1c1c] bg-[#0d0d0d] p-7 transition-colors ${
                e.featured ? "border-lime-300/45 shadow-[0_0_0_1px_rgba(190,242,100,0.12)]" : "hover:border-zinc-700"
              }`}
            >
              {e.featured && (
                <div className="absolute -top-3 left-7 mono text-[11px] px-2.5 py-1 rounded-full bg-lime-300 text-[#0a0a0b] font-medium uppercase tracking-wider">
                  Most popular
                </div>
              )}
              <div className="mono text-[11px] uppercase tracking-wider text-zinc-500">
                {e.price}
              </div>
              <div className="mt-2 text-2xl font-semibold text-zinc-100 tracking-tight">
                {e.name}
              </div>
              <p className="mt-3 text-sm text-zinc-400 leading-relaxed">
                {e.blurb}
              </p>
              <ul className="mt-6 space-y-2.5 flex-1">
                {e.features.map((f) => (
                  <li key={f} className="text-sm text-zinc-300 flex items-start gap-2">
                    <Check className="h-4 w-4 text-lime-300 mt-0.5 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <a
                href="#contact"
                className={`mt-7 inline-flex items-center justify-center gap-2 rounded-full px-4 py-2.5 text-sm font-medium ${
                  e.featured ? "btn-accent" : "btn-ghost"
                }`}
              >
                {e.cta} <ArrowUpRight className="h-4 w-4" />
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Engagement;
