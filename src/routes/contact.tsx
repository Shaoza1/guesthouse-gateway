import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Suspense, useState } from "react";
import { Mail, MapPin, Phone, Clock, CheckCircle2, AlertCircle } from "lucide-react";
import { z } from "zod";

import { SiteLayout } from "@/components/SiteLayout";
import { Section, SectionHeading } from "@/components/Section";
import { siteContentQuery, pickString } from "@/lib/content";
import { supabase } from "@/integrations/supabase/client";

const inquirySchema = z.object({
  name: z.string().trim().min(1, "Please enter your name").max(120),
  email: z.string().trim().email("Enter a valid email").max(255),
  phone: z.string().trim().max(40).optional().or(z.literal("")),
  message: z.string().trim().min(1, "Tell us a little about your stay").max(2000),
});

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — Woodpecker Guesthouse, Ficksburg" },
      {
        name: "description",
        content:
          "Get in touch with Woodpecker Guesthouse in Ficksburg — address, phone, email, and an enquiry form.",
      },
      { property: "og:title", content: "Contact — Woodpecker Guesthouse" },
      {
        property: "og:description",
        content: "Address, phone, email, and an enquiry form for Woodpecker Guesthouse.",
      },
    ],
    links: [{ rel: "canonical", href: "/contact" }],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(siteContentQuery()),
  component: ContactPage,
});

function ContactPage() {
  return (
    <SiteLayout>
      <Suspense fallback={<Section><p className="text-muted-foreground">Loading…</p></Section>}>
        <Content />
      </Suspense>
    </SiteLayout>
  );
}

function Content() {
  const { data: content } = useSuspenseQuery(siteContentQuery());
  const address1 = pickString(content, "contact", "address_line1", "Kort Street 4");
  const address2 = pickString(
    content,
    "contact",
    "address_line2",
    "Ficksburg, Free State, South Africa",
  );
  const phone = pickString(content, "contact", "phone", "");
  const email = pickString(content, "contact", "email", "");
  const checkIn = pickString(content, "contact", "check_in", "14h00 – 19h00");
  const checkOut = pickString(content, "contact", "check_out", "by 10h00");
  const mapQuery = pickString(
    content,
    "contact",
    "map_query",
    "Kort Street 4, Ficksburg, South Africa",
  );

  return (
    <Section>
      <SectionHeading
        eyebrow="Get in touch"
        title="We’d love to hear from you"
        body="Send us an enquiry, or reach out by phone or email. Eureka and the team will get back to you as soon as possible."
      />

      <div className="mt-10 grid gap-10 lg:grid-cols-[1.1fr_1fr]">
        <ContactForm />

        <aside className="space-y-6">
          <InfoItem icon={<MapPin size={18} aria-hidden />} title="Address">
            <p>{address1}</p>
            <p>{address2}</p>
          </InfoItem>
          {phone && (
            <InfoItem icon={<Phone size={18} aria-hidden />} title="Phone">
              <a href={`tel:${phone.replace(/\s+/g, "")}`} className="hover:underline">
                {phone}
              </a>
            </InfoItem>
          )}
          {email && (
            <InfoItem icon={<Mail size={18} aria-hidden />} title="Email">
              <a href={`mailto:${email}`} className="hover:underline">
                {email}
              </a>
            </InfoItem>
          )}
          <InfoItem icon={<Clock size={18} aria-hidden />} title="Check-in / Check-out">
            <p>Check-in: {checkIn}</p>
            <p>Check-out: {checkOut}</p>
          </InfoItem>

          <div className="overflow-hidden rounded-xl border border-border shadow-[var(--shadow-soft)]">
            <iframe
              title="Map showing Woodpecker Guesthouse, Ficksburg"
              src={`https://www.google.com/maps?q=${encodeURIComponent(mapQuery)}&output=embed`}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="h-72 w-full border-0"
            />
          </div>
        </aside>
      </div>
    </Section>
  );
}

function InfoItem({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex gap-3">
      <span className="mt-0.5 inline-flex h-9 w-9 flex-none items-center justify-center rounded-lg bg-secondary text-primary">
        {icon}
      </span>
      <div>
        <h3 className="font-serif text-base font-semibold text-foreground">{title}</h3>
        <div className="mt-1 text-sm text-muted-foreground">{children}</div>
      </div>
    </div>
  );
}

type FormState =
  | { kind: "idle" }
  | { kind: "submitting" }
  | { kind: "success" }
  | { kind: "error"; message: string };

function ContactForm() {
  const [state, setState] = useState<FormState>({ kind: "idle" });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFieldErrors({});
    const fd = new FormData(e.currentTarget);
    const parsed = inquirySchema.safeParse({
      name: fd.get("name") ?? "",
      email: fd.get("email") ?? "",
      phone: fd.get("phone") ?? "",
      message: fd.get("message") ?? "",
    });
    if (!parsed.success) {
      const errors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const k = issue.path[0]?.toString();
        if (k && !errors[k]) errors[k] = issue.message;
      }
      setFieldErrors(errors);
      return;
    }
    setState({ kind: "submitting" });
    const { error } = await supabase.from("inquiries").insert({
      name: parsed.data.name,
      email: parsed.data.email,
      phone: parsed.data.phone || null,
      message: parsed.data.message,
    });
    if (error) {
      setState({ kind: "error", message: "Couldn’t send your message. Please try again." });
      return;
    }
    setState({ kind: "success" });
    (e.target as HTMLFormElement).reset();
  }

  if (state.kind === "success") {
    return (
      <div
        role="status"
        className="flex items-start gap-3 rounded-xl border border-primary/30 bg-primary/5 p-6"
      >
        <CheckCircle2 className="mt-0.5 flex-none text-primary" aria-hidden />
        <div>
          <h3 className="font-serif text-lg text-foreground">Message sent</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Thank you — we’ll be in touch shortly.
          </p>
          <button
            type="button"
            onClick={() => setState({ kind: "idle" })}
            className="mt-4 text-sm font-semibold text-primary hover:underline"
          >
            Send another message
          </button>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="space-y-4 rounded-xl border border-border bg-card p-6 shadow-[var(--shadow-soft)]"
    >
      <Field label="Name" name="name" required autoComplete="name" error={fieldErrors.name} />
      <Field
        label="Email"
        name="email"
        type="email"
        required
        autoComplete="email"
        error={fieldErrors.email}
      />
      <Field
        label="Phone (optional)"
        name="phone"
        type="tel"
        autoComplete="tel"
        error={fieldErrors.phone}
      />
      <div>
        <label htmlFor="message" className="block text-sm font-medium text-foreground">
          Message
        </label>
        <textarea
          id="message"
          name="message"
          rows={5}
          required
          aria-invalid={!!fieldErrors.message}
          aria-describedby={fieldErrors.message ? "message-error" : undefined}
          className="mt-1.5 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/40"
        />
        {fieldErrors.message && (
          <p id="message-error" className="mt-1 text-sm text-destructive">
            {fieldErrors.message}
          </p>
        )}
      </div>

      {state.kind === "error" && (
        <div
          role="alert"
          className="flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive"
        >
          <AlertCircle size={18} className="mt-0.5 flex-none" aria-hidden />
          <p>{state.message}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={state.kind === "submitting"}
        className="inline-flex min-h-11 w-full items-center justify-center rounded-md bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow transition hover:opacity-95 disabled:opacity-60 sm:w-auto"
      >
        {state.kind === "submitting" ? "Sending…" : "Send message"}
      </button>
    </form>
  );
}

function Field({
  label,
  name,
  type = "text",
  required,
  autoComplete,
  error,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  autoComplete?: string;
  error?: string;
}) {
  const id = `field-${name}`;
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-foreground">
        {label}
        {required && <span aria-hidden className="text-destructive"> *</span>}
      </label>
      <input
        id={id}
        name={name}
        type={type}
        required={required}
        autoComplete={autoComplete}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : undefined}
        className="mt-1.5 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/40"
      />
      {error && (
        <p id={`${id}-error`} className="mt-1 text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
