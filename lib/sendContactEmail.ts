"use client";

import emailjs from "@emailjs/browser";

export type ContactFormPayload = {
  name: string;
  email: string;
  message: string;
};

function readEmailJsEnv() {
  return {
    serviceId: process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID?.trim() ?? "",
    templateId: process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID?.trim() ?? "",
    publicKey: process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY?.trim() ?? "",
  };
}

/**
 * Sends the contact form via EmailJS. Uses the same env vars and template
 * fields as both the main Contact section and the desktop Contact window.
 */
export async function sendContactEmail(payload: ContactFormPayload): Promise<void> {
  const { serviceId, templateId, publicKey } = readEmailJsEnv();
  const options = { publicKey };

  emailjs.init(options);

  const templateParams = {
    from_name: payload.name,
    from_email: payload.email,
    message: payload.message,
    to_name: "Aiden Brown",
    // Aliases for templates that use {{name}}, {{email}}, {{reply_to}}, etc.
    name: payload.name,
    email: payload.email,
    time: new Date().toLocaleString(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    }),
    title: `Portfolio contact from ${payload.name}`,
  };

  const result = await emailjs.send(
    serviceId,
    templateId,
    templateParams,
    options,
  );

  if (!Number.isFinite(result.status) || result.status < 200 || result.status >= 300) {
    throw new Error(result.text || `EmailJS returned status ${result.status}`);
  }
}
