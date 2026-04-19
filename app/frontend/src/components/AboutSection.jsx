import React from "react";
import { Mail, Linkedin, MapPin } from "lucide-react";
import { profile, about } from "../content";

export default function AboutSection() {
  return (
    <section id="about" className="section border-b border-[#141414]">
      <div className="container-x">
        <div className="grid items-start gap-12 lg:grid-cols-12 lg:gap-14">
          <div className="lg:col-span-5">
            <div className="overflow-hidden rounded-2xl border border-[#1c1c1c] bg-[#0a0a0a]">
              <img
                src={profile.photo}
                alt={profile.name}
                className="aspect-[4/5] w-full object-cover object-[center_10%]"
                loading="lazy"
              />
            </div>
          </div>

          <div className="lg:col-span-7">
            <p className="mono text-xs uppercase tracking-wider text-zinc-500">/about</p>
            <h2 className="mt-4 text-3xl font-semibold leading-tight tracking-tight text-white sm:text-4xl md:text-5xl">
              {about.titleBefore}{" "}
              <span className="serif accent-text">{about.titleAccent}</span> {about.titleAfter}
            </h2>
            <div className="mt-8 space-y-4 text-zinc-500 leading-relaxed">
              {about.bio.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href={`mailto:${profile.email}`}
                className="card-surface inline-flex items-center gap-2 rounded-full border border-[#2a2a2a] bg-[#111] px-5 py-3 text-sm text-zinc-200 transition-colors hover:border-lime-300/30"
              >
                <Mail className="h-4 w-4 text-lime-300" />
                {profile.email}
              </a>
              <a
                href={profile.linkedin}
                target="_blank"
                rel="noreferrer"
                className="card-surface inline-flex items-center gap-2 rounded-full border border-[#2a2a2a] bg-[#111] px-5 py-3 text-sm text-zinc-200 transition-colors hover:border-lime-300/30"
              >
                <Linkedin className="h-4 w-4 text-lime-300" />
                LinkedIn
              </a>
            </div>

            <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-12 lg:gap-5">
              <div className="card-surface rounded-2xl border border-[#1c1c1c] bg-[#0d0d0d] p-5 sm:col-span-1 lg:col-span-4">
                <div className="mono text-[10px] uppercase tracking-widest text-zinc-500">Based in</div>
                <div className="mt-3 flex items-center gap-2 text-sm font-medium text-zinc-100">
                  <MapPin className="h-4 w-4 text-lime-300" />
                  {profile.location}
                </div>
              </div>

              <div className="card-surface rounded-2xl border border-[#1c1c1c] bg-[#0d0d0d] p-6 sm:col-span-1 lg:col-span-8">
                <div className="mono text-[10px] uppercase tracking-widest text-zinc-500">How I work</div>
                <ul className="mt-6 space-y-6">
                  {about.process.map((step) => (
                    <li key={step.step}>
                      <div className="mono text-[11px] font-medium uppercase tracking-wider text-lime-300/90">
                        {step.step}
                      </div>
                      <p className="mt-2 text-sm leading-relaxed text-zinc-400">{step.text}</p>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
