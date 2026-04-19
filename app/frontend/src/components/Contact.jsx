import React, { useState } from "react";
import { profile, services } from "../content";
import { Mail, Phone, Linkedin, Send, Check, Loader2 } from "lucide-react";
import { useToast } from "../hooks/use-toast";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

// API endpoint for contact form - replace with your API Gateway URL after terraform apply
// Get this from: cd infrastructure/terraform && terraform output contact_form_api_endpoint
const CONTACT_API_URL = import.meta.env.VITE_CONTACT_API_URL || "";

const Contact = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    company: "",
    service: "",
    budget: "",
    message: "",
  });
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const update = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      toast({
        title: "Missing details",
        description: "Name, email and a short message are required.",
      });
      return;
    }

    setLoading(true);

    try {
      // Option 1: Use AWS API Gateway (recommended with terraform setup)
      if (CONTACT_API_URL) {
        const response = await fetch(CONTACT_API_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });

        const data = await response.json();

        if (response.ok) {
          setSent(true);
          toast({
            title: "Message sent",
            description: "I'll get back to you within 24 hours.",
          });
        } else {
          throw new Error(data.error || "Failed to send message");
        }
      }
      // Option 2: Use Formspree (simple, no AWS setup needed)
      // Replace with your Formspree endpoint: https://formspree.io/f/YOUR_FORM_ID
      else if (false) {
        const response = await fetch("https://formspree.io/f/YOUR_FORM_ID", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });

        if (response.ok) {
          setSent(true);
          toast({
            title: "Message sent",
            description: "I'll get back to you within 24 hours.",
          });
        } else {
          throw new Error("Failed to send message");
        }
      }
      // Option 3: Fallback to localStorage (demo only)
      else {
        const entry = { ...form, at: new Date().toISOString() };
        const existing = JSON.parse(localStorage.getItem("nj_contact_submissions") || "[]");
        localStorage.setItem("nj_contact_submissions", JSON.stringify([entry, ...existing]));
        setSent(true);
        toast({
          title: "Message saved locally",
          description: "Note: This demo saves to localStorage only. Configure CONTACT_API_URL for production.",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to send message. Please try again.",
      });
    } finally {
      setLoading(false);
      setTimeout(() => setSent(false), 3500);
      setForm({
        name: "",
        email: "",
        company: "",
        service: "",
        budget: "",
        message: "",
      });
    }
  };

  return (
    <section id="contact" className="section border-b border-[#141414]">
      <div className="container-x">
        <div className="grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <div className="mono text-xs uppercase tracking-wider text-zinc-500">/contact</div>
            <h2 className="mt-4 text-3xl font-semibold leading-tight tracking-tight text-white sm:text-4xl md:text-5xl">
              Let&apos;s <span className="serif accent-text">build</span> something that boots cleanly.
            </h2>
            <p className="mt-5 text-sm leading-relaxed text-zinc-500 sm:text-base">
              Tell me a little about your stack, your timeline, and what's
              breaking (or about to). I respond within 24 hours on weekdays.
            </p>

            <div className="mt-8 space-y-3">
              <a
                href={`mailto:${profile.email}`}
                className="card-surface p-4 flex items-center gap-4 hover:border-lime-300/40"
              >
                <div className="h-10 w-10 rounded-xl bg-[#161619] border border-[#24242a] flex items-center justify-center">
                  <Mail className="h-4 w-4 text-lime-300" />
                </div>
                <div>
                  <div className="text-xs mono text-zinc-500">Email</div>
                  <div className="text-sm text-zinc-200">{profile.email}</div>
                </div>
              </a>
              <a
                href={`tel:${profile.phone.replace(/\s/g, "")}`}
                className="card-surface p-4 flex items-center gap-4 hover:border-lime-300/40"
              >
                <div className="h-10 w-10 rounded-xl bg-[#161619] border border-[#24242a] flex items-center justify-center">
                  <Phone className="h-4 w-4 text-lime-300" />
                </div>
                <div>
                  <div className="text-xs mono text-zinc-500">Phone</div>
                  <div className="text-sm text-zinc-200">{profile.phone}</div>
                </div>
              </a>
              <a
                href={profile.linkedin}
                target="_blank"
                rel="noreferrer"
                className="card-surface p-4 flex items-center gap-4 hover:border-lime-300/40"
              >
                <div className="h-10 w-10 rounded-xl bg-[#161619] border border-[#24242a] flex items-center justify-center">
                  <Linkedin className="h-4 w-4 text-lime-300" />
                </div>
                <div>
                  <div className="text-xs mono text-zinc-500">LinkedIn</div>
                  <div className="text-sm text-zinc-200">linkedin.com/in/nj8055</div>
                </div>
              </a>
            </div>
          </div>

          <form
            onSubmit={onSubmit}
            className="lg:col-span-7 card-surface p-7 sm:p-9"
          >
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="mono text-[11px] uppercase tracking-wider text-zinc-500">
                  Name
                </label>
                <Input
                  value={form.name}
                  onChange={(e) => update("name", e.target.value)}
                  placeholder="Your name"
                  className="mt-2 bg-[#0f0f11] border-[#1c1c1f] text-zinc-100 h-11"
                />
              </div>
              <div>
                <label className="mono text-[11px] uppercase tracking-wider text-zinc-500">
                  Email
                </label>
                <Input
                  type="email"
                  value={form.email}
                  onChange={(e) => update("email", e.target.value)}
                  placeholder="you@company.com"
                  className="mt-2 bg-[#0f0f11] border-[#1c1c1f] text-zinc-100 h-11"
                />
              </div>
              <div>
                <label className="mono text-[11px] uppercase tracking-wider text-zinc-500">
                  Company
                </label>
                <Input
                  value={form.company}
                  onChange={(e) => update("company", e.target.value)}
                  placeholder="Optional"
                  className="mt-2 bg-[#0f0f11] border-[#1c1c1f] text-zinc-100 h-11"
                />
              </div>
              <div>
                <label className="mono text-[11px] uppercase tracking-wider text-zinc-500">
                  Service needed
                </label>
                <Select
                  value={form.service}
                  onValueChange={(v) => update("service", v)}
                >
                  <SelectTrigger className="mt-2 bg-[#0f0f11] border-[#1c1c1f] text-zinc-100 h-11">
                    <SelectValue placeholder="Pick a focus area" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#0f0f11] border-[#1c1c1f] text-zinc-100">
                    {services.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.title}
                      </SelectItem>
                    ))}
                    <SelectItem value="other">Something else</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="sm:col-span-2">
                <label className="mono text-[11px] uppercase tracking-wider text-zinc-500">
                  Budget range
                </label>
                <Select
                  value={form.budget}
                  onValueChange={(v) => update("budget", v)}
                >
                  <SelectTrigger className="mt-2 bg-[#0f0f11] border-[#1c1c1f] text-zinc-100 h-11">
                    <SelectValue placeholder="Rough budget (optional)" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#0f0f11] border-[#1c1c1f] text-zinc-100">
                    <SelectItem value="<5k">Under $5k</SelectItem>
                    <SelectItem value="5-15k">$5k – $15k</SelectItem>
                    <SelectItem value="15-40k">$15k – $40k</SelectItem>
                    <SelectItem value="40k+">$40k+</SelectItem>
                    <SelectItem value="retainer">Monthly retainer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="sm:col-span-2">
                <label className="mono text-[11px] uppercase tracking-wider text-zinc-500">
                  What are we solving?
                </label>
                <Textarea
                  value={form.message}
                  onChange={(e) => update("message", e.target.value)}
                  placeholder="A few lines on your current stack, timeline, and what good looks like."
                  className="mt-2 bg-[#0f0f11] border-[#1c1c1f] text-zinc-100 min-h-[130px]"
                />
              </div>
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
              <p className="text-xs text-zinc-500">
                {CONTACT_API_URL
                  ? "Messages are sent securely via API."
                  : "Configure CONTACT_API_URL for production. Currently saves locally."}
              </p>
              <button
                type="submit"
                disabled={loading}
                className="btn-accent inline-flex items-center gap-2 px-5 py-3 rounded-full font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Sending...
                  </>
                ) : sent ? (
                  <>
                    <Check className="h-4 w-4" /> Sent
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" /> Send enquiry
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
};

export default Contact;
