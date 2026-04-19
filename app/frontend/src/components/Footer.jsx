import React from "react";
import { profile, navLinks } from "../content";
import { Mail, Linkedin, ArrowUpRight } from "lucide-react";

const Footer = () => {
  return (
    <footer className="relative border-t border-[#1a1a1a] bg-black pt-16 pb-10">
      <div className="container-x">
        <div className="grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-6">
            <div className="flex items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-md bg-lime-300 text-xs font-bold text-[#0a0a0b] mono">
                nj
              </span>
              <span className="text-sm font-medium text-zinc-200">
                {profile.name} <span className="text-zinc-500 font-normal">/ {profile.subtitle}</span>
              </span>
            </div>
            <h3 className="mt-6 max-w-xl text-3xl font-semibold leading-tight tracking-tight text-white sm:text-4xl">
              Need a steady set of hands on your platform?{" "}
              <span className="serif accent-text">Let&apos;s talk.</span>
            </h3>
            <a
              href="#contact"
              className="btn-accent mt-6 inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-semibold"
            >
              Start a project <ArrowUpRight className="h-4 w-4" />
            </a>
          </div>

          <div className="lg:col-span-3">
            <div className="mono text-[11px] uppercase tracking-wider text-zinc-500">Navigate</div>
            <ul className="mt-5 space-y-2">
              {navLinks.map((n) => (
                <li key={n.href}>
                  <a href={n.href} className="text-sm text-zinc-400 transition-colors hover:text-lime-300">
                    {n.label}
                  </a>
                </li>
              ))}
              <li>
                <a href="#about" className="text-sm text-zinc-400 transition-colors hover:text-lime-300">
                  About
                </a>
              </li>
            </ul>
          </div>

          <div className="lg:col-span-3">
            <div className="mono text-[11px] uppercase tracking-wider text-zinc-500">Elsewhere</div>
            <ul className="mt-5 space-y-2">
              <li>
                <a
                  href={`mailto:${profile.email}`}
                  className="inline-flex items-center gap-2 text-sm text-zinc-400 transition-colors hover:text-lime-300"
                >
                  <Mail className="h-4 w-4" /> {profile.email}
                </a>
              </li>
              <li>
                <a
                  href={profile.linkedin}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 text-sm text-zinc-400 transition-colors hover:text-lime-300"
                >
                  <Linkedin className="h-4 w-4" /> LinkedIn
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-14 flex flex-col items-start justify-between gap-3 border-t border-[#1a1a1a] pt-6 sm:flex-row sm:items-center">
          <p className="text-xs text-zinc-600 mono">
            © {new Date().getFullYear()} {profile.name}. Crafted with care — and a lot of Terraform.
          </p>
          <p className="text-xs text-zinc-600 mono">
            {profile.location} · open to remote
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
