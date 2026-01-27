'use client';

import { useState } from 'react';
import emailjs from '@emailjs/browser';

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      const result = await emailjs.send(
        process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID!,
        process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID!,
        {
          from_name: formData.name,
          from_email: formData.email,
          message: formData.message,
          to_name: 'Aiden Brown',
        },
        process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY!
      );

      if (result.status === 200) {
        setSubmitStatus('success');
        setFormData({ name: '', email: '', message: '' });
      } else {
        setSubmitStatus('error');
      }
    } catch (error) {
      console.error('Email send error:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <section id="contact" className="min-h-screen py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <div className="border-2 border-black p-6 sm:p-10 bg-[#f9f4ec]">
          {/* Section Header */}
          <div className="text-left mb-12">
            <p className="text-xs uppercase font-bold tracking-[0.2em]">Contact</p>
            <h2 className="text-3xl sm:text-4xl font-black text-black mt-3">
              Get In Touch
            </h2>
            <p className="text-base sm:text-lg font-medium mt-4">
              Have a project in mind or want to collaborate? Feel free to reach out!
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-10">
            {/* Contact Information */}
            <div className="space-y-8">
              <div>
                <h3 className="text-xl font-black mb-6">Contact Information</h3>
                <div className="space-y-4 text-sm font-bold">
                  <div>
                    <p className="uppercase tracking-wide">Email</p>
                    <a href="mailto:brow2423@purdue.edu" className="underline underline-offset-4 hover:no-underline">
                      brow2423@purdue.edu
                    </a>
                  </div>
                  <div>
                    <p className="uppercase tracking-wide">LinkedIn</p>
                    <a href="https://linkedin.com/in/aidenbrown21" target="_blank" rel="noopener noreferrer" className="underline underline-offset-4 hover:no-underline">
                      linkedin.com/in/aidenbrown21
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-xs uppercase font-bold tracking-wide mb-2">
                    Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border-2 border-black bg-[#f6f1e7] text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-black/50"
                    placeholder="John Doe"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-xs uppercase font-bold tracking-wide mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border-2 border-black bg-[#f6f1e7] text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-black/50"
                    placeholder="john@example.com"
                  />
                </div>

                <div>
                  <label htmlFor="message" className="block text-xs uppercase font-bold tracking-wide mb-2">
                    Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={5}
                    className="w-full px-3 py-2 border-2 border-black bg-[#f6f1e7] text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-black/50 resize-none"
                    placeholder="Tell me about your project..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full px-6 py-2 bg-black text-[#f6f1e7] font-bold uppercase tracking-wide border-2 border-black disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Sending...' : 'Send Message'}
                </button>

                {/* Status Messages */}
                {submitStatus === 'success' && (
                  <div className="mt-4 p-4 border-2 border-black bg-[#efe7da] text-black text-center font-bold">
                    Message sent successfully! I&apos;ll get back to you soon.
                  </div>
                )}
                {submitStatus === 'error' && (
                  <div className="mt-4 p-4 border-2 border-black bg-[#efe7da] text-black text-center font-bold">
                    Failed to send message. Please try again or email me directly.
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
