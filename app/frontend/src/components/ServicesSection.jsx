import React from "react";
import { ArrowUpRight, Workflow, Boxes, Layers, Cloud, RefreshCw, Shield } from "lucide-react";
import { serviceCards } from "../content";

const icons = {
  Workflow,
  Boxes,
  Layers,
  Cloud,
  RefreshCw,
  Shield,
};

export default function ServicesSection() {
  return (
    <section id="services" className="section border-b border-[#141414]">
      <div className="container-x">
        <div className="grid gap-10 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-7">
            <p className="mono text-xs uppercase tracking-wider text-zinc-500">/services</p>
            <h2 className="mt-4 text-3xl font-semibold leading-tight tracking-tight text-white sm:text-4xl md:text-5xl">
              Everything your platform needs,{" "}
              <span className="serif accent-text">delivered end-to-end.</span>
            </h2>
          </div>
          <p className="text-sm leading-relaxed text-zinc-500 lg:col-span-5 lg:text-right lg:text-[15px]">
            Seven focused engagements across CI/CD, Kubernetes, IaC, multi-cloud migration, DR, PKI and
            observability — pick one or stack them.
          </p>
        </div>

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {serviceCards.map((card) => {
            const Icon = icons[card.icon] || Workflow;
            return (
              <article
                key={card.id}
                className="group flex flex-col rounded-2xl border border-[#1c1c1c] bg-[#0d0d0d] p-6 transition-colors hover:border-zinc-700"
              >
                <div className="flex items-start justify-between">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-lime-300/10 text-lime-300">
                    <Icon className="h-5 w-5" strokeWidth={1.75} />
                  </span>
                  <span className="mono text-xs text-zinc-600">{card.id}</span>
                </div>
                <h3 className="mt-5 text-lg font-semibold text-zinc-100">{card.title}</h3>
                <p className="mt-3 flex-1 text-sm leading-relaxed text-zinc-500">{card.description}</p>
                <ul className="mt-5 space-y-2">
                  {card.bullets.map((b) => (
                    <li key={b} className="flex items-start gap-2 text-sm text-zinc-400">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-lime-300" />
                      {b}
                    </li>
                  ))}
                </ul>
                <a
                  href="#contact"
                  className="mt-6 inline-flex items-center gap-1 text-xs font-medium text-zinc-500 transition-colors group-hover:text-lime-300"
                >
                  Scope this <ArrowUpRight className="h-3.5 w-3.5" />
                </a>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
