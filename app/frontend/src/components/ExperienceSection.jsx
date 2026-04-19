import React from "react";
import { experienceIntro, experience } from "../content";

export default function ExperienceSection() {
  return (
    <section id="experience" className="section border-b border-[#141414]">
      <div className="container-x">
        <p className="mono text-xs uppercase tracking-wider text-zinc-500">{experienceIntro.label}</p>
        <h2 className="mt-4 max-w-3xl text-3xl font-semibold leading-tight tracking-tight text-white sm:text-4xl md:text-5xl">
          {experienceIntro.titleBefore}{" "}
          <span className="serif accent-text">{experienceIntro.titleAccent}</span>{" "}
          {experienceIntro.titleAfter}
        </h2>
        <p className="mt-6 max-w-2xl text-sm leading-relaxed text-zinc-500 sm:text-base">{experienceIntro.sub}</p>

        <div className="relative mt-16 max-w-4xl pl-0 sm:pl-6 md:pl-8">
          <div className="absolute left-[15px] top-2 bottom-6 hidden w-px bg-[#222] sm:block md:left-[19px]" aria-hidden />

          <ul className="space-y-14 sm:space-y-16">
            {experience.map((job) => (
              <li key={job.id} className="relative grid gap-8 sm:grid-cols-[minmax(0,200px)_1fr] sm:gap-10 md:grid-cols-[220px_1fr]">
                <div className="flex gap-4 sm:block sm:pl-0">
                  <div className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-[#2a2a2a] bg-[#111] mono text-xs font-semibold text-lime-300 sm:absolute sm:-left-2 sm:top-0 md:left-0">
                    {job.initials}
                  </div>
                  <div className="min-w-0 sm:mt-14 sm:pl-2">
                    <div className="mono text-[10px] uppercase tracking-wider text-zinc-500">{job.range}</div>
                    <div className="mt-1 text-base font-semibold text-zinc-100">{job.company}</div>
                    <div className="mt-1 text-sm text-zinc-500">{job.title}</div>
                  </div>
                </div>

                <div className="min-w-0 border-t border-[#1a1a1a] pt-6 sm:border-0 sm:pt-0">
                  <ul className="space-y-3">
                    {job.bullets.map((b) => (
                      <li key={b} className="text-sm leading-relaxed text-zinc-300">
                        {b}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-5 flex flex-wrap gap-2">
                    {job.tags.map((t) => (
                      <span
                        key={t}
                        className="rounded-full border border-[#2a2a2a] bg-[#111] px-2.5 py-1 mono text-[10px] text-zinc-400"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
