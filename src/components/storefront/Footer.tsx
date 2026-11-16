'use client';

import Link from 'next/link';
import { Mail, Phone, MapPin, Instagram, Facebook, ShieldCheck, Truck, RefreshCw, Award } from 'lucide-react';
import Logo from '@/components/shared/Logo';

export default function Footer() {
  return (
    <footer className="bg-forest-900 text-cream-100 border-t border-gold-400/20 pt-16 pb-12">
      {/* Trust Badges Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-14 border-b border-forest-800">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-forest-800 flex items-center justify-center text-gold-400 shrink-0">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-serif text-sm font-semibold text-cream-50">Islandwide White-Glove</h4>
              <p className="text-xs text-cream-300/70 mt-0.5">Complimentary over LKR 25,000</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-forest-800 flex items-center justify-center text-gold-400 shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-serif text-sm font-semibold text-cream-50">Cash On Delivery</h4>
              <p className="text-xs text-cream-300/70 mt-0.5">Inspect & pay at your doorstep</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-forest-800 flex items-center justify-center text-gold-400 shrink-0">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-serif text-sm font-semibold text-cream-50">Ceylon Artisanship</h4>
              <p className="text-xs text-cream-300/70 mt-0.5">Grade-A Teak, Brass & Ceramics</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-forest-800 flex items-center justify-center text-gold-400 shrink-0">
              <RefreshCw className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-serif text-sm font-semibold text-cream-50">7-Day Home Trial</h4>
              <p className="text-xs text-cream-300/70 mt-0.5">Hassle-free exchange policy</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-cream-100 p-2.5 rounded-lg inline-block">
              <Logo width={160} height={60} />
            </div>
            <p className="text-xs text-cream-200/80 leading-relaxed max-w-sm">
              Aura Luxe Home embodies serene luxury living in Sri Lanka. We curate timeless Ceylon teak furniture, hand-spun architectural brass lighting, and tactile natural stoneware ceramics.
            </p>
            <div className="pt-2 text-xs text-cream-300/80 space-y-2">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-gold-400 shrink-0 mt-0.5" />
                <span>Flagship Gallery: Colombo, Sri Lanka (Showroom visits by appointment)</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-gold-400 shrink-0" />
                <span>Private Inquiries & Concierge: concierge@auraluxe.lk</span>
              </div>
            </div>
          </div>

          {/* Shop Rooms */}
          <div>
            <h5 className="font-serif text-sm font-semibold text-gold-300 uppercase tracking-wider mb-4">
              Explore Rooms
            </h5>
            <ul className="space-y-2 text-xs text-cream-200/80">
              <li>
                <Link href="/shop?room=Living+Room" className="hover:text-gold-400 transition-colors">
                  Living Room Seating
                </Link>
              </li>
              <li>
                <Link href="/shop?room=Bedroom" className="hover:text-gold-400 transition-colors">
                  Bedroom Sanctuaries
                </Link>
              </li>
              <li>
                <Link href="/shop?room=Dining+%26+Kitchen" className="hover:text-gold-400 transition-colors">
                  Dining & Tableware
                </Link>
              </li>
              <li>
                <Link href="/shop?room=Luxury+Lighting" className="hover:text-gold-400 transition-colors">
                  Artisan Brass Lighting
                </Link>
              </li>
              <li>
                <Link href="/shop?room=Artisanal+Decor" className="hover:text-gold-400 transition-colors">
                  Sculptural Stoneware
                </Link>
              </li>
              <li>
                <Link href="/shop?room=Rugs+%26+Textiles" className="hover:text-gold-400 transition-colors">
                  Natural Jute & Linens
                </Link>
              </li>
            </ul>
          </div>

          {/* Client Concierge */}
          <div>
            <h5 className="font-serif text-sm font-semibold text-gold-300 uppercase tracking-wider mb-4">
              Client Care
            </h5>
            <ul className="space-y-2 text-xs text-cream-200/80">
              <li>
                <Link href="/track-order" className="hover:text-gold-400 transition-colors">
                  Track Sri Lanka Delivery
                </Link>
              </li>
              <li>
                <Link href="/shop" className="hover:text-gold-400 transition-colors">
                  25 Districts Shipping Rates
                </Link>
              </li>
              <li>
                <Link href="/shop" className="hover:text-gold-400 transition-colors">
                  Cash on Delivery & Bank Transfer
                </Link>
              </li>
              <li>
                <Link href="/shop" className="hover:text-gold-400 transition-colors">
                  Material Care Guides
                </Link>
              </li>
              <li>
                <Link href="/admin/login" className="hover:text-gold-400 transition-colors">
                  Staff Admin Portal
                </Link>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h5 className="font-serif text-sm font-semibold text-gold-300 uppercase tracking-wider mb-4">
              Private Newsletter
            </h5>
            <p className="text-xs text-cream-200/80 mb-3">
              Receive private previews of limited seasonal releases and artisan collections.
            </p>
            <form onSubmit={(e) => e.preventDefault()} className="space-y-2">
              <input
                type="email"
                placeholder="Enter your email address"
                className="w-full text-xs px-3.5 py-2.5 bg-forest-800 border border-gold-400/30 rounded text-cream-100 placeholder:text-cream-400 focus:outline-none focus:border-gold-400"
              />
              <button
                type="submit"
                className="w-full py-2 bg-gold-500 hover:bg-gold-600 text-forest-900 font-medium text-xs tracking-wider uppercase rounded transition-colors"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 border-t border-forest-800 text-xs text-cream-400/70 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p>© 2026 Aura Luxe Home (Pvt) Ltd. All Rights Reserved. Colombo, Sri Lanka.</p>
        <div className="flex items-center gap-6">
          <span>Payment: Cash on Delivery | Visa | MasterCard | Direct Bank Transfer</span>
        </div>
      </div>
    </footer>
  );
}
