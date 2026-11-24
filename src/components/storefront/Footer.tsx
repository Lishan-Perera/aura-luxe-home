'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Mail, MapPin, Clock } from 'lucide-react';
import Logo from '@/components/shared/Logo';

// Official Facebook Brand Icon
function FacebookIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

// Official Instagram Brand Icon
function InstagramIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
    </svg>
  );
}

// Official TikTok Brand Icon
function TikTokIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.24 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
    </svg>
  );
}

interface SocialLinksState {
  facebook: string;
  instagram: string;
  tiktok: string;
}

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const [socialLinks, setSocialLinks] = useState<SocialLinksState>({
    facebook: process.env.NEXT_PUBLIC_SOCIAL_FACEBOOK || '',
    instagram: process.env.NEXT_PUBLIC_SOCIAL_INSTAGRAM || '',
    tiktok: process.env.NEXT_PUBLIC_SOCIAL_TIKTOK || '',
  });

  useEffect(() => {
    fetch('/api/settings')
      .then((res) => res.json())
      .then((data) => {
        if (data?.social) {
          setSocialLinks({
            facebook: data.social.facebook || process.env.NEXT_PUBLIC_SOCIAL_FACEBOOK || '',
            instagram: data.social.instagram || process.env.NEXT_PUBLIC_SOCIAL_INSTAGRAM || '',
            tiktok: data.social.tiktok || process.env.NEXT_PUBLIC_SOCIAL_TIKTOK || '',
          });
        }
      })
      .catch(() => {
        // Fall back to env or empty state
      });
  }, []);

  const socialChannels = [
    {
      name: 'Facebook',
      url: socialLinks.facebook,
      icon: <FacebookIcon className="w-5 h-5 fill-current" />,
      containerBg: 'bg-[#1877F2]',
      hoverClass: 'hover:scale-105 hover:brightness-110 hover:shadow-md',
      ariaLabel: 'Follow Aura Luxe Home on Facebook',
    },
    {
      name: 'Instagram',
      url: socialLinks.instagram,
      icon: <InstagramIcon className="w-5 h-5 fill-current" />,
      containerBg: 'bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888]',
      hoverClass: 'hover:scale-105 hover:brightness-110 hover:shadow-md',
      ariaLabel: 'Follow Aura Luxe Home on Instagram',
    },
    {
      name: 'TikTok',
      url: socialLinks.tiktok,
      icon: <TikTokIcon className="w-5 h-5 fill-current" />,
      containerBg: 'bg-black border border-white/20',
      hoverClass: 'hover:scale-105 hover:brightness-125 hover:shadow-md',
      ariaLabel: 'Follow Aura Luxe Home on TikTok',
    },
  ];

  return (
    <footer className="bg-[#123C2F] text-[#FBF8F3] border-t border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        {/* Tier 1: Main Brand & Navigation Columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10">
          {/* Brand Info & Genuine Business Details */}
          <div className="lg:col-span-5 space-y-4">
            <Logo width={140} height={52} variant="light" />
            <p className="text-sm text-[#E9EDE7]/80 leading-relaxed max-w-sm">
              Timeless Sri Lankan home décor crafted from solid Ceylon teak, hand-finished lighting, and natural stoneware for calm, modern living.
            </p>
            <ul className="pt-2 space-y-2.5 text-xs sm:text-sm text-[#E9EDE7]/85">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 shrink-0 mt-0.5 text-[#E9EDE7]" />
                <span>Colombo, Sri Lanka (Showroom visits by appointment)</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 shrink-0 text-[#E9EDE7]" />
                <a href="mailto:concierge@auraluxe.lk" className="hover:text-white transition-colors">
                  concierge@auraluxe.lk
                </a>
              </li>
              <li className="flex items-start gap-2.5">
                <Clock className="w-4 h-4 shrink-0 mt-0.5 text-[#E9EDE7]" />
                <span>Monday – Saturday: 9:00 AM – 6:00 PM (Sri Lanka Time)</span>
              </li>
            </ul>
          </div>

          {/* Explore & Company */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-widest text-[#E9EDE7]">
              Aura Luxe Home
            </h4>
            <ul className="space-y-2.5 text-sm text-[#E9EDE7]/80">
              <li>
                <Link href="/shop" className="hover:text-white transition-colors">
                  Shop All
                </Link>
              </li>
              <li>
                <Link href="/#categories" className="hover:text-white transition-colors">
                  Categories
                </Link>
              </li>
              <li>
                <Link href="/#about" className="hover:text-white transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-white transition-colors">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="/track-order" className="hover:text-white transition-colors">
                  Track Order
                </Link>
              </li>
              <li>
                <Link href="/admin/login" className="hover:text-white transition-colors">
                  Staff Portal
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Care & Policies */}
          <div className="lg:col-span-4 space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-widest text-[#E9EDE7]">
              Customer Care &amp; Policies
            </h4>
            <ul className="space-y-2.5 text-sm text-[#E9EDE7]/80">
              <li>
                <Link href="/delivery-information" className="hover:text-white transition-colors">
                  Delivery Information
                </Link>
              </li>
              <li>
                <Link href="/returns-refunds" className="hover:text-white transition-colors">
                  Returns &amp; Refunds
                </Link>
              </li>
              <li>
                <Link href="/privacy-policy" className="hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms-and-conditions" className="hover:text-white transition-colors">
                  Terms &amp; Conditions
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Tier 2: Bottom Bar (Inspired by Reference Layout) */}
        <div className="mt-12 pt-8 border-t border-white/15">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            {/* Left: Brand Origin & Delivery */}
            <div className="text-center md:text-left space-y-1 order-2 md:order-1">
              <p className="text-xs font-semibold tracking-wide text-[#FBF8F3]">
                Aura Luxe Home • Sri Lanka
              </p>
              <p className="text-[11px] text-[#E9EDE7]/70">
                Islandwide White-Glove Delivery to all 25 Districts
              </p>
            </div>

            {/* Center: Follow Us Social Media Section */}
            <div className="flex flex-col items-center gap-2.5 order-1 md:order-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#E9EDE7]">
                Follow Us
              </span>
              <div className="flex items-center gap-3.5">
                {socialChannels.map((channel) => {
                  const isConfigured = Boolean(channel.url && channel.url.trim().startsWith('http'));

                  if (isConfigured) {
                    return (
                      <a
                        key={channel.name}
                        href={channel.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={channel.ariaLabel}
                        className={`w-10 h-10 sm:w-11 sm:h-11 rounded-full ${channel.containerBg} text-white flex items-center justify-center shadow-xs transition-all duration-200 shrink-0 ${channel.hoverClass}`}
                      >
                        {channel.icon}
                      </a>
                    );
                  }

                  // Disabled state until genuine URL is configured (prevents linking to random accounts)
                  return (
                    <button
                      key={channel.name}
                      type="button"
                      disabled
                      aria-disabled="true"
                      title={`Aura Luxe Home ${channel.name} profile pending configuration`}
                      aria-label={`${channel.name} (Pending Configuration)`}
                      className={`w-10 h-10 sm:w-11 sm:h-11 rounded-full ${channel.containerBg} text-white opacity-60 cursor-not-allowed flex items-center justify-center shadow-xs shrink-0`}
                    >
                      {channel.icon}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Right: Copyright */}
            <div className="text-center md:text-right space-y-1 order-3">
              <p className="text-xs text-[#E9EDE7]/80">
                © Aura Luxe Home {currentYear}. All rights reserved.
              </p>
              <p className="text-[11px] text-[#E9EDE7]/60">
                Handcrafted Ceylon Teak &amp; Artisanal Decor
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
