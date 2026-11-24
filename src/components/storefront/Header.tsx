'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { Search, User, ShoppingBag, Menu, X, ChevronDown } from 'lucide-react';
import { useCartStore } from '@/store/useCartStore';

const SIMPLE_CATEGORIES = [
  { name: 'Living Room', href: '/shop?room=Living+Room' },
  { name: 'Bedroom', href: '/shop?room=Bedroom' },
  { name: 'Dining & Kitchen', href: '/shop?room=Dining+%26+Kitchen' },
  { name: 'Lighting', href: '/shop?room=Luxury+Lighting' },
  { name: 'Home Décor', href: '/shop?room=Artisanal+Decor' },
  { name: 'Rugs & Textiles', href: '/shop?room=Rugs+%26+Textiles' },
];

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { openCart, getItemCount } = useCartStore();

  const [mounted, setMounted] = useState(false);
  const [isAtTop, setIsAtTop] = useState(true);
  const [isHidden, setIsHidden] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const [mobileCategoriesOpen, setMobileCategoriesOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const lastScrollY = useRef(0);

  useEffect(() => {
    setMounted(true);
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => setIsAuthenticated(Boolean(data?.user)))
      .catch(() => setIsAuthenticated(false));
  }, [pathname]);

  // Smart scroll behavior:
  // - Very top: Warm Ivory (#FBF8F3), visible
  // - Scroll down past threshold: hide smoothly & close dropdowns
  // - Scroll up: reappear smoothly in solid Pure White (#FFFFFF)
  useEffect(() => {
    let ticking = false;

    const updateScroll = () => {
      const currentY = Math.max(0, window.scrollY);
      const delta = currentY - lastScrollY.current;

      if (currentY <= 12) {
        setIsAtTop(true);
        setIsHidden(false);
      } else {
        setIsAtTop(false);
        if (currentY > 80 && delta > 6) {
          setIsHidden(true);
          setCategoriesOpen(false);
          setSearchOpen(false);
        } else if (delta < -4) {
          setIsHidden(false);
        }
      }

      lastScrollY.current = currentY;
      ticking = false;
    };

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(updateScroll);
        ticking = true;
      }
    };

    lastScrollY.current = Math.max(0, window.scrollY);
    setIsAtTop(lastScrollY.current <= 12);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
    setCategoriesOpen(false);
    setSearchOpen(false);
  }, [pathname]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setCategoriesOpen(false);
      }
    };
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setCategoriesOpen(false);
        setSearchOpen(false);
        setMobileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEsc);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEsc);
    };
  }, []);

  useEffect(() => {
    if (searchOpen) {
      setTimeout(() => searchInputRef.current?.focus(), 50);
    }
  }, [searchOpen]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchQuery.trim();
    if (!q) return;
    setSearchOpen(false);
    setMobileMenuOpen(false);
    router.push(`/shop?search=${encodeURIComponent(q)}`);
  };

  const itemCount = mounted ? getItemCount() : 0;

  return (
    <>
      <header
        className={`sticky top-0 z-40 transition-transform duration-300 ease-in-out border-b ${
          isHidden && !mobileMenuOpen ? '-translate-y-full' : 'translate-y-0'
        } ${
          isAtTop
            ? 'bg-[#FBF8F3] border-[#D9D9D4]/70'
            : 'bg-white border-[#D9D9D4] shadow-subtle'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-18 sm:h-20 flex items-center justify-between gap-4 py-3">
            {/* Left: Mobile Menu Toggle + Original Logo */}
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(true)}
                className="lg:hidden p-1.5 -ml-1 text-[#123C2F] hover:bg-[#E9EDE7] rounded-md transition-colors shrink-0"
                aria-label="Open menu"
              >
                <Menu className="w-5 h-5" />
              </button>

              <Link
                href="/"
                className="inline-flex items-center gap-2 sm:gap-2.5 min-w-0 transition-opacity hover:opacity-85"
              >
                <Image
                  src="/assets/logo.png"
                  alt="Aura Luxe Home"
                  width={40}
                  height={40}
                  priority
                  className="h-8 w-8 sm:h-10 sm:w-10 object-contain shrink-0"
                />
                <span className="text-xs sm:text-base font-semibold tracking-wide sm:tracking-wider text-[#123C2F] uppercase truncate">
                  Aura Luxe Home
                </span>
              </Link>
            </div>

            {/* Center: Clean 4-Item Navigation (Desktop) */}
            <nav className="hidden lg:flex items-center gap-9 text-sm font-medium text-[#333333]">
              <Link
                href="/"
                className={`py-1 transition-colors hover:text-[#123C2F] ${
                  pathname === '/' ? 'text-[#123C2F] font-semibold border-b-2 border-[#123C2F]' : ''
                }`}
              >
                Home
              </Link>

              <Link
                href="/shop"
                className={`py-1 transition-colors hover:text-[#123C2F] ${
                  pathname === '/shop' ? 'text-[#123C2F] font-semibold border-b-2 border-[#123C2F]' : ''
                }`}
              >
                Shop
              </Link>

              {/* Clean Single-Column Categories Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setCategoriesOpen((prev) => !prev)}
                  className="inline-flex items-center gap-1 py-1 text-[#333333] hover:text-[#123C2F] transition-colors"
                  aria-expanded={categoriesOpen}
                >
                  <span>Categories</span>
                  <ChevronDown
                    className={`w-4 h-4 transition-transform duration-150 ${
                      categoriesOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {categoriesOpen && (
                  <div className="absolute left-0 top-full mt-3 w-52 bg-white border border-[#D9D9D4] rounded-lg py-2 shadow-luxury animate-fadeIn z-50">
                    {SIMPLE_CATEGORIES.map((cat) => (
                      <Link
                        key={cat.name}
                        href={cat.href}
                        onClick={() => setCategoriesOpen(false)}
                        className="block px-4 py-2 text-sm text-[#333333] hover:bg-[#E9EDE7] hover:text-[#123C2F] transition-colors"
                      >
                        {cat.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              <Link
                href="/contact"
                className={`py-1 transition-colors hover:text-[#123C2F] ${
                  pathname === '/contact' ? 'text-[#123C2F] font-semibold border-b-2 border-[#123C2F]' : ''
                }`}
              >
                Contact
              </Link>
            </nav>

            {/* Right: Search, Account, Shopping Bag */}
            <div className="flex items-center gap-0.5 sm:gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setSearchOpen((prev) => !prev)}
                className="p-1.5 sm:p-2 text-[#123C2F] hover:bg-[#E9EDE7] rounded-md transition-colors"
                aria-label="Search products"
              >
                <Search className="w-5 h-5 stroke-[1.75]" />
              </button>

              <Link
                href={isAuthenticated ? '/account' : '/auth/login'}
                className="p-1.5 sm:p-2 text-[#123C2F] hover:bg-[#E9EDE7] rounded-md transition-colors"
                aria-label="Account"
              >
                <User className="w-5 h-5 stroke-[1.75]" />
              </Link>

              <button
                type="button"
                onClick={openCart}
                className="inline-flex items-center gap-1.5 sm:gap-2 px-1.5 sm:px-2.5 py-1.5 sm:py-2 text-[#123C2F] hover:bg-[#E9EDE7] rounded-md transition-colors"
                aria-label="Open shopping bag"
              >
                <ShoppingBag className="w-5 h-5 stroke-[1.75]" />
                <span className="hidden sm:inline text-xs font-semibold uppercase tracking-wider">
                  Bag
                </span>
                <span className="min-w-[20px] h-5 px-1.5 rounded-full bg-[#123C2F] text-white text-[11px] font-semibold inline-flex items-center justify-center">
                  {itemCount}
                </span>
              </button>
            </div>
          </div>

          {/* Clean Inline Search Bar */}
          {searchOpen && (
            <div className="pb-4 animate-fadeIn">
              <form onSubmit={handleSearchSubmit} className="relative max-w-xl mx-auto flex gap-2">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-[#666666] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search chairs, lighting, vases, teak..."
                    className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-[#D9D9D4] rounded-md text-[#333333] placeholder:text-[#666666] focus:outline-none focus:border-[#123C2F]"
                  />
                </div>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#123C2F] hover:bg-[#0D2E24] text-white text-sm font-medium rounded-md transition-colors"
                >
                  Search
                </button>
              </form>
            </div>
          )}
        </div>
      </header>

      {/* Mobile & Tablet Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-[#123C2F]/40"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />

          <div className="fixed inset-y-0 left-0 w-72 max-w-[85vw] bg-[#FBF8F3] border-r border-[#D9D9D4] flex flex-col justify-between p-6 overflow-y-auto">
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-[#D9D9D4] pb-4">
                <Link
                  href="/"
                  onClick={() => setMobileMenuOpen(false)}
                  className="inline-flex items-center gap-2.5"
                >
                  <Image
                    src="/assets/logo.png"
                    alt="Aura Luxe Home"
                    width={32}
                    height={32}
                    className="h-8 w-8 object-contain"
                  />
                  <span className="text-sm font-semibold tracking-wider text-[#123C2F] uppercase">
                    Aura Luxe Home
                  </span>
                </Link>
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1.5 text-[#123C2F] hover:bg-[#E9EDE7] rounded-md"
                  aria-label="Close menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <nav className="space-y-1 text-sm font-medium text-[#333333]">
                <Link
                  href="/"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-3 py-2.5 rounded-md transition-colors ${
                    pathname === '/' ? 'bg-[#E9EDE7] text-[#123C2F] font-semibold' : 'hover:bg-[#E9EDE7]/60'
                  }`}
                >
                  Home
                </Link>

                <Link
                  href="/shop"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-3 py-2.5 rounded-md transition-colors ${
                    pathname === '/shop' ? 'bg-[#E9EDE7] text-[#123C2F] font-semibold' : 'hover:bg-[#E9EDE7]/60'
                  }`}
                >
                  Shop
                </Link>

                <div>
                  <button
                    type="button"
                    onClick={() => setMobileCategoriesOpen((prev) => !prev)}
                    className="w-full flex items-center justify-between px-3 py-2.5 rounded-md hover:bg-[#E9EDE7]/60 transition-colors"
                  >
                    <span>Categories</span>
                    <ChevronDown
                      className={`w-4 h-4 transition-transform ${
                        mobileCategoriesOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  {mobileCategoriesOpen && (
                    <div className="pl-4 mt-1 space-y-1 border-l border-[#D9D9D4] ml-3">
                      {SIMPLE_CATEGORIES.map((cat) => (
                        <Link
                          key={cat.name}
                          href={cat.href}
                          onClick={() => setMobileMenuOpen(false)}
                          className="block px-3 py-2 text-sm text-[#333333] hover:text-[#123C2F] rounded-md hover:bg-[#E9EDE7]/60"
                        >
                          {cat.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>

                <Link
                  href="/contact"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-3 py-2.5 rounded-md transition-colors ${
                    pathname === '/contact' ? 'bg-[#E9EDE7] text-[#123C2F] font-semibold' : 'hover:bg-[#E9EDE7]/60'
                  }`}
                >
                  Contact
                </Link>
              </nav>
            </div>

            <div className="pt-6 border-t border-[#D9D9D4] space-y-2 text-sm">
              <Link
                href={isAuthenticated ? '/account' : '/auth/login'}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2.5 rounded-md text-[#123C2F] hover:bg-[#E9EDE7] transition-colors font-medium"
              >
                <User className="w-4 h-4" />
                <span>{isAuthenticated ? 'My Account' : 'Sign In / Register'}</span>
              </Link>
              <Link
                href="/track-order"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 text-xs text-[#666666] hover:text-[#123C2F]"
              >
                Track an Order
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
