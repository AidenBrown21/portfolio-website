'use client';

import { useState } from "react";
import { sendContactEmail } from "@/lib/sendContactEmail";

export default function ContactWindowContent() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">(
    "idle",
  );

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus("idle");

    try {
      await sendContactEmail({
        name: formData.name,
        email: formData.email,
        message: formData.message,
      });
      setSubmitStatus("success");
      setFormData({ name: "", email: "", message: "" });
    } catch (error) {
      console.error("Email send error:", error);
      setSubmitStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <p className="rounded-lg border border-black/10 bg-white/60 p-2 text-[11px] font-semibold uppercase tracking-[0.1em] text-black/50">
        Contact / Message
      </p>
      <div className="grid gap-3 text-sm md:grid-cols-2">
        <a
          href="mailto:brow2423@purdue.edu"
          className="desktop-soft-btn rounded-md px-3 py-2"
        >
          Email: brow2423@purdue.edu
        </a>
        <a
          href="https://linkedin.com/in/aidenbrown21"
          target="_blank"
          rel="noopener noreferrer"
          className="desktop-soft-btn rounded-md px-3 py-2"
        >
          LinkedIn: /in/aidenbrown21
        </a>
      </div>
      <form onSubmit={handleSubmit} className="space-y-3">
        <label className="block text-xs uppercase tracking-wide" htmlFor="name">
          Name
        </label>
        <input
          id="name"
          name="name"
          value={formData.name}
          onChange={(event) =>
            setFormData((previous) => ({
              ...previous,
              [event.target.name]: event.target.value,
            }))
          }
          required
          className="w-full rounded-md border border-black/15 bg-white/70 px-2 py-2 text-sm"
          placeholder="John Doe"
        />

        <label className="block text-xs uppercase tracking-wide" htmlFor="email">
          Email
        </label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={(event) =>
            setFormData((previous) => ({
              ...previous,
              [event.target.name]: event.target.value,
            }))
          }
          required
          className="w-full rounded-md border border-black/15 bg-white/70 px-2 py-2 text-sm"
          placeholder="john@example.com"
        />

        <label className="block text-xs uppercase tracking-wide" htmlFor="message">
          Message
        </label>
        <textarea
          id="message"
          name="message"
          value={formData.message}
          onChange={(event) =>
            setFormData((previous) => ({
              ...previous,
              [event.target.name]: event.target.value,
            }))
          }
          required
          rows={5}
          className="w-full resize-none rounded-md border border-black/15 bg-white/70 px-2 py-2 text-sm"
          placeholder="Tell me about your project..."
        />

        <button
          type="submit"
          disabled={isSubmitting}
          className="desktop-soft-btn w-full rounded-md px-4 py-2 text-xs uppercase tracking-wide disabled:opacity-50"
        >
          {isSubmitting ? "Sending..." : "Send Message"}
        </button>
      </form>

      {submitStatus === "success" && (
        <p className="rounded-md border border-black/10 bg-white/60 p-2 text-xs uppercase tracking-wide">
          Message sent successfully! I&apos;ll get back to you soon.
        </p>
      )}
      {submitStatus === "error" && (
        <p className="rounded-md border border-black/10 bg-white/60 p-2 text-xs uppercase tracking-wide">
          Failed to send message. Please try again or email me directly.
        </p>
      )}
    </div>
  );
}
