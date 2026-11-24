'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Mail, MapPin, Clock, Phone, Send, CheckCircle2, AlertCircle } from 'lucide-react';

interface StoreContactInfo {
  email?: string;
  showroom?: string;
  businessHours?: string;
  hotline?: string;
  whatsapp?: string;
}

// Configuration placeholder: replace with actual verified business WhatsApp number
// (Sri Lanka international format without +, spaces or dashes, e.g. 94771234567)
const CONFIG_WHATSAPP_PLACEHOLDER = '94770000000';

function WhatsAppIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="18"
      height="18"
      fill="currentColor"
      aria-hidden="true"
      className={className}
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export default function ContactPage() {
  const [contactInfo, setContactInfo] = useState<StoreContactInfo>({
    email: 'concierge@auraluxe.lk',
    showroom: 'Colombo, Sri Lanka (Showroom visits by appointment)',
    businessHours: 'Monday – Saturday: 9:00 AM – 6:00 PM (Sri Lanka Time)',
  });

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const submitLockRef = useRef(false);

  useEffect(() => {
    fetch('/api/settings')
      .then((res) => res.json())
      .then((data) => {
        if (data?.contact) {
          const c = data.contact;
          const cleanHotline =
            c.hotline && !String(c.hotline).toLowerCase().includes('pending') ? c.hotline : '';
          const cleanShowroom =
            c.showroom && !String(c.showroom).toLowerCase().includes('to be announced')
              ? c.showroom
              : 'Colombo, Sri Lanka (Showroom visits by appointment)';
          const cleanWhatsApp =
            c.whatsapp && !String(c.whatsapp).toLowerCase().includes('pending')
              ? String(c.whatsapp).replace(/[^0-9]/g, '')
              : '';

          setContactInfo({
            email: c.email || 'concierge@auraluxe.lk',
            showroom: cleanShowroom,
            businessHours:
              c.businessHours || 'Monday – Saturday: 9:00 AM – 6:00 PM (Sri Lanka Time)',
            hotline: cleanHotline,
            whatsapp: cleanWhatsApp,
          });
        }
      })
      .catch(() => {
        // Keep existing genuine default business details
      });
  }, []);

  const configuredWhatsApp =
    contactInfo.whatsapp || process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '';
  const cleanDigits = configuredWhatsApp.replace(/[^0-9]/g, '');
  const whatsappNumber = cleanDigits || CONFIG_WHATSAPP_PLACEHOLDER;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitLockRef.current || submitting) return;

    setErrorMessage('');
    setSuccessMessage('');

    const trimmedName = fullName.trim();
    const trimmedEmail = email.trim();
    const trimmedSubject = subject.trim();
    const trimmedMessage = message.trim();

    if (trimmedName.length < 2) {
      setErrorMessage('Please enter your full name (at least 2 characters).');
      return;
    }
    if (!EMAIL_REGEX.test(trimmedEmail)) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }
    if (trimmedSubject.length < 3) {
      setErrorMessage('Please enter a subject (at least 3 characters).');
      return;
    }
    if (trimmedMessage.length < 10) {
      setErrorMessage('Please enter your message (at least 10 characters).');
      return;
    }

    submitLockRef.current = true;
    setSubmitting(true);

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: trimmedName,
          email: trimmedEmail,
          subject: trimmedSubject,
          message: trimmedMessage,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data?.success) {
        throw new Error(data?.error || 'Could not send your message. Please try again.');
      }

      setSuccessMessage(
        data.message ||
          'Thank you for reaching out. Your message has been received and our team will respond shortly.'
      );
      setFullName('');
      setEmail('');
      setSubject('');
      setMessage('');
    } catch (err: any) {
      setErrorMessage(err.message || 'Unable to send your message right now. Please try again.');
    } finally {
      setSubmitting(false);
      submitLockRef.current = false;
    }
  };

  return (
    <div className="bg-[#FBF8F3] text-[#333333]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-12">
        {/* Page Header */}
        <div className="max-w-2xl space-y-3">
          <nav className="text-xs text-[#666666] flex items-center gap-1.5">
            <Link href="/" className="hover:text-[#123C2F] transition-colors">
              Home
            </Link>
            <span>/</span>
            <span className="text-[#123C2F] font-medium">Contact</span>
          </nav>

          <h1 className="text-3xl sm:text-4xl font-semibold text-[#123C2F] tracking-tight">
            We&apos;d Love to Hear From You
          </h1>
          <p className="text-sm sm:text-base text-[#333333]/85 leading-relaxed">
            Have a question about our collections, an order, or finding the perfect piece for your home? Our team is here to help.
          </p>
        </div>

        {/* Main Grid: Contact Info + Form */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
          {/* Left: Genuine Business Contact Info */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white border border-[#D9D9D4] rounded-lg p-6 sm:p-8 space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-[#123C2F]">Contact Information</h2>
                <p className="text-xs sm:text-sm text-[#666666] mt-1">
                  Reach our Sri Lanka team directly for orders, collections, and private showroom visits.
                </p>
              </div>

              <div className="space-y-5 pt-2 border-t border-[#D9D9D4] text-sm">
                {contactInfo.email && (
                  <div className="flex items-start gap-3.5">
                    <div className="w-9 h-9 rounded-md bg-[#E9EDE7] text-[#123C2F] flex items-center justify-center shrink-0">
                      <Mail className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wider text-[#666666]">
                        Business Email
                      </p>
                      <a
                        href={`mailto:${contactInfo.email}`}
                        className="text-sm font-medium text-[#123C2F] hover:underline mt-0.5 block"
                      >
                        {contactInfo.email}
                      </a>
                    </div>
                  </div>
                )}

                {/* WhatsApp Direct Concierge */}
                <div className="flex items-start gap-3.5">
                  <div className="w-9 h-9 rounded-md bg-[#E9EDE7] text-[#123C2F] flex items-center justify-center shrink-0">
                    <WhatsAppIcon className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wider text-[#666666]">
                      WHATSAPP
                    </p>
                    <a
                      href={`https://wa.me/${whatsappNumber}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-medium text-[#123C2F] hover:underline mt-0.5 block"
                    >
                      Chat with us on WhatsApp
                    </a>
                    <p className="text-xs text-[#666666] mt-0.5">
                      Quick assistance for orders and enquiries
                    </p>
                  </div>
                </div>

                {contactInfo.hotline && (
                  <div className="flex items-start gap-3.5">
                    <div className="w-9 h-9 rounded-md bg-[#E9EDE7] text-[#123C2F] flex items-center justify-center shrink-0">
                      <Phone className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wider text-[#666666]">
                        Phone
                      </p>
                      <p className="text-sm font-medium text-[#333333] mt-0.5">
                        {contactInfo.hotline}
                      </p>
                    </div>
                  </div>
                )}

                {contactInfo.showroom && (
                  <div className="flex items-start gap-3.5">
                    <div className="w-9 h-9 rounded-md bg-[#E9EDE7] text-[#123C2F] flex items-center justify-center shrink-0">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wider text-[#666666]">
                        Location
                      </p>
                      <p className="text-sm text-[#333333] mt-0.5 leading-relaxed">
                        {contactInfo.showroom}
                      </p>
                    </div>
                  </div>
                )}

                {contactInfo.businessHours && (
                  <div className="flex items-start gap-3.5">
                    <div className="w-9 h-9 rounded-md bg-[#E9EDE7] text-[#123C2F] flex items-center justify-center shrink-0">
                      <Clock className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wider text-[#666666]">
                        Business Hours
                      </p>
                      <p className="text-sm text-[#333333] mt-0.5 leading-relaxed">
                        {contactInfo.businessHours}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-[#E9EDE7]/70 border border-[#D9D9D4] rounded-lg p-5 text-xs sm:text-sm text-[#333333] space-y-1.5">
              <p className="font-semibold text-[#123C2F]">Looking for an existing order?</p>
              <p className="text-[#333333]/80">
                Track your Sri Lanka delivery status anytime using your order reference number.
              </p>
              <Link
                href="/track-order"
                className="inline-block pt-1 text-xs font-semibold text-[#123C2F] underline hover:opacity-80"
              >
                Go to Track Order
              </Link>
            </div>
          </div>

          {/* Right: Contact Form */}
          <div className="lg:col-span-7">
            <form
              onSubmit={handleSubmit}
              noValidate
              className="bg-white border border-[#D9D9D4] rounded-lg p-6 sm:p-8 space-y-5"
            >
              <div className="border-b border-[#D9D9D4] pb-4">
                <h2 className="text-lg font-semibold text-[#123C2F]">Send Us a Message</h2>
                <p className="text-xs sm:text-sm text-[#666666] mt-1">
                  Fill in the form below and we will get back to you as soon as possible.
                </p>
              </div>

              {errorMessage && (
                <div
                  role="alert"
                  className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-xs sm:text-sm flex items-start gap-2.5"
                >
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {successMessage && (
                <div
                  role="status"
                  className="bg-[#E9EDE7] border border-[#123C2F]/30 text-[#123C2F] px-4 py-3.5 rounded-md text-xs sm:text-sm flex items-start gap-2.5"
                >
                  <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{successMessage}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="contact-fullName" className="block text-xs font-medium text-[#333333] mb-1.5">
                    Full Name <span className="text-red-600">*</span>
                  </label>
                  <input
                    id="contact-fullName"
                    type="text"
                    required
                    maxLength={120}
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Your full name"
                    disabled={submitting}
                    className="w-full px-3.5 py-2.5 text-sm bg-white border border-[#D9D9D4] rounded-md text-[#333333] placeholder:text-[#666666] focus:outline-none focus:border-[#123C2F] disabled:opacity-60"
                  />
                </div>

                <div>
                  <label htmlFor="contact-email" className="block text-xs font-medium text-[#333333] mb-1.5">
                    Email Address <span className="text-red-600">*</span>
                  </label>
                  <input
                    id="contact-email"
                    type="email"
                    required
                    maxLength={200}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    disabled={submitting}
                    className="w-full px-3.5 py-2.5 text-sm bg-white border border-[#D9D9D4] rounded-md text-[#333333] placeholder:text-[#666666] focus:outline-none focus:border-[#123C2F] disabled:opacity-60"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="contact-subject" className="block text-xs font-medium text-[#333333] mb-1.5">
                  Subject <span className="text-red-600">*</span>
                </label>
                <input
                  id="contact-subject"
                  type="text"
                  required
                  maxLength={200}
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="How can we help you?"
                  disabled={submitting}
                  className="w-full px-3.5 py-2.5 text-sm bg-white border border-[#D9D9D4] rounded-md text-[#333333] placeholder:text-[#666666] focus:outline-none focus:border-[#123C2F] disabled:opacity-60"
                />
              </div>

              <div>
                <label htmlFor="contact-message" className="block text-xs font-medium text-[#333333] mb-1.5">
                  Message <span className="text-red-600">*</span>
                </label>
                <textarea
                  id="contact-message"
                  rows={5}
                  required
                  maxLength={4000}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Tell us about your question, order reference, or the piece you are looking for..."
                  disabled={submitting}
                  className="w-full px-3.5 py-2.5 text-sm bg-white border border-[#D9D9D4] rounded-md text-[#333333] placeholder:text-[#666666] focus:outline-none focus:border-[#123C2F] leading-relaxed disabled:opacity-60"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3 bg-[#123C2F] hover:bg-[#0D2E24] disabled:opacity-50 text-white text-sm font-medium rounded-md transition-colors"
                >
                  {submitting ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Sending Message...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Send Message</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

