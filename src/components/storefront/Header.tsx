'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import {
  Search,
  Heart,
  ShoppingBag,
  Menu,
  X,
  User,
  ShieldCheck,
  MapPin,
  ChevronRight,
  ChevronDown,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { useCartStore } from '@/store/useCartStore';
import { useWishlistStore } from '@/store/useWishlistStore';
import {
  MEGA_MENU_CATEGORIES,
  MegaCategoryConfig,
  MAIN_NAV_CATEGORIES,
} from '@/lib/constants/navigation';

interface DesktopNavLinksContentProps {
  isNavbarVisible?: boolean;
  isAtTop?: boolean;
}

function DesktopNavLinksContent({ isNavbarVisible = true, isAtTop = true }: DesktopNavLinksContentProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentRoom = searchParams.get('room');
  const currentCategory = searchParams.get('category');
  const currentSubcategory = searchParams.get('subcategory');
  const currentFilter = searchParams.get('filter');

  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const navRef = useRef<HTMLDivElement>(null);

  // Close dropdown on route change
  useEffect(() => {
    setActiveDropdown(null);
  }, [pathname, searchParams]);

  // Close dropdown immediately when navbar hides on scroll down
  useEffect(() => {
    if (!isNavbarVisible) {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      setActiveDropdown(null);
    }
  }, [isNavbarVisible]);

  // Escape key & Click outside listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setActiveDropdown(null);
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setActiveDropdown(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleMouseEnter = (slug: string) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setActiveDropdown(slug);
  };

  const handleMouseLeave = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setActiveDropdown(null);
    }, 180);
  };

  const handlePanelMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
  };

  const isShopAllActive =
    pathname === '/shop' &&
    !currentRoom &&
    !currentCategory &&
    !currentSubcategory &&
    !currentFilter;

  const isCategoryActive = (cat: MegaCategoryConfig) => {
    if (pathname !== '/shop') return false;
    if (currentCategory === cat.slug) return true;
    if (currentRoom && cat.roomType && currentRoom.toLowerCase() === cat.roomType.toLowerCase()) return true;
    return false;
  };

  const activeConfig = MEGA_MENU_CATEGORIES.find((c) => c.slug === activeDropdown);

  return (
    <div ref={navRef} className="static">
      {/* Horizontal Nav Links Row - Clean Minimalist directly on Warm Ivory Navbar */}
      <div className="flex items-center gap-0.5 xl:gap-2 py-1">
        {/* 1. Shop All Link with Mega Menu */}
        <div
          className="relative shrink-0"
          onMouseEnter={() => handleMouseEnter('shop-all')}
          onMouseLeave={handleMouseLeave}
        >
          <Link
            href="/shop"
            onClick={() => setActiveDropdown(null)}
            onFocus={() => handleMouseEnter('shop-all')}
            className={`relative inline-flex items-center gap-1 py-1 px-1.5 xl:px-2 text-[10.5px] xl:text-[11.5px] font-semibold tracking-[0.04em] xl:tracking-[0.06em] uppercase whitespace-nowrap transition-colors duration-200 shrink-0 focus:outline-none ${
              isShopAllActive || activeDropdown === 'shop-all'
                ? 'text-forest-950 font-bold after:absolute after:bottom-0 after:left-1 after:right-1 after:h-[1.5px] after:bg-gold-500 after:rounded-full'
                : 'text-forest-900/85 hover:text-forest-950 hover:after:absolute hover:after:bottom-0 hover:after:left-1 hover:after:right-1 hover:after:h-[1.5px] hover:after:bg-gold-400/60 hover:after:rounded-full'
            }`}
            aria-expanded={activeDropdown === 'shop-all'}
            aria-haspopup="true"
          >
            <span>Shop All</span>
            <ChevronDown
              className={`w-2 h-2 xl:w-2.5 xl:h-2.5 text-gold-600/75 transition-transform duration-200 shrink-0 ${
                activeDropdown === 'shop-all' ? 'rotate-180 text-gold-600' : ''
              }`}
            />
          </Link>
        </div>

        {/* Refined Thin Gold Separator */}
        <span className="h-3 w-px bg-gold-400/35 mx-0.5 xl:mx-1 shrink-0 select-none" aria-hidden="true" />

        {/* 2. Six Dedicated Category Dropdown Groups */}
        {MEGA_MENU_CATEGORIES.filter((c) => c.slug !== 'shop-all').map((cat) => {
          const isOpen = activeDropdown === cat.slug;
          const isActive = isCategoryActive(cat);

          return (
            <div
              key={cat.slug}
              className="relative shrink-0"
              onMouseEnter={() => handleMouseEnter(cat.slug)}
              onMouseLeave={handleMouseLeave}
            >
              <Link
                href={cat.href}
                onClick={() => setActiveDropdown(null)}
                onFocus={() => handleMouseEnter(cat.slug)}
                className={`relative inline-flex items-center gap-1 py-1 px-1 xl:px-2 text-[10.5px] xl:text-[11.5px] font-semibold tracking-[0.03em] xl:tracking-[0.05em] uppercase whitespace-nowrap transition-colors duration-200 focus:outline-none ${
                  isActive || isOpen
                    ? 'text-forest-950 font-bold after:absolute after:bottom-0 after:left-1 after:right-1 after:h-[1.5px] after:bg-gold-500 after:rounded-full'
                    : 'text-forest-900/85 hover:text-forest-950 hover:after:absolute hover:after:bottom-0 hover:after:left-1 hover:after:right-1 hover:after:h-[1.5px] hover:after:bg-gold-400/60 hover:after:rounded-full'
                }`}
                aria-expanded={isOpen}
                aria-haspopup="true"
              >
                <span>{cat.name}</span>
                <ChevronDown
                  className={`w-2 h-2 xl:w-2.5 xl:h-2.5 text-gold-600/75 transition-transform duration-200 shrink-0 ${
                    isOpen ? 'rotate-180 text-gold-600' : ''
                  }`}
                />
              </Link>
            </div>
          );
        })}
      </div>

      {/* 3. Wide Full-Width Mega Menu Panel (Fashion Bug Inspired Architecture) */}
      {activeConfig && (
        <div
          className={`absolute top-full left-0 right-0 w-full border-t border-b shadow-[0_25px_50px_-12px_rgba(24,59,43,0.14)] z-50 animate-fadeIn transition-colors duration-200 ${
            isAtTop ? 'bg-[#FAF8F5] border-[#E8E2D6]' : 'bg-[#FFFFFF] border-neutral-200'
          }`}
          onMouseEnter={handlePanelMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          {/* Top invisible hover bridge so pointer never drops hover */}
          <div className="absolute -top-3 left-0 right-0 h-3" />

          <div className="max-w-[1380px] mx-auto px-6 xl:px-8 py-8">
            <div className="grid grid-cols-[1fr_300px] xl:grid-cols-[1fr_340px] gap-10 xl:gap-14 items-start">
              
              {/* Left Side: Multiple Vertical Content Columns */}
              <div
                className={`grid ${
                  activeConfig.columns.length === 3 ? 'grid-cols-3' : 'grid-cols-2'
                } gap-8 xl:gap-12`}
              >
                {activeConfig.columns.map((col, idx) => (
                  <div key={idx} className="space-y-3">
                    {/* Bold Uppercase Section Heading */}
                    <div className="pb-2 mb-3 border-b border-[#E8E2D6] flex items-center justify-between">
                      <h4 className="font-serif text-xs font-bold tracking-[0.16em] uppercase text-forest-900 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-gold-500" aria-hidden="true" />
                        {col.heading}
                      </h4>
                    </div>

                    {/* Vertical Subcategory Links with Elegant Hover */}
                    <ul className="space-y-1">
                      {col.links.map((link) => (
                        <li key={link.slug}>
                          <Link
                            href={link.href}
                            onClick={() => setActiveDropdown(null)}
                            className="group/link flex items-center justify-between py-1.5 px-2 rounded-sm text-xs xl:text-[13px] font-medium text-[#24352B] hover:text-gold-700 hover:bg-forest-50/70 transition-all duration-150"
                          >
                            <span className="group-hover/link:translate-x-1 transition-transform duration-150">
                              {link.name}
                            </span>
                            <ChevronRight className="w-3.5 h-3.5 text-gold-400/50 group-hover/link:text-gold-600 group-hover/link:translate-x-0.5 transition-all opacity-0 group-hover/link:opacity-100" />
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>

              {/* Right Side: Product or Lifestyle Image Presentation */}
              <div className="w-[300px] xl:w-[340px] shrink-0">
                <Link
                  href={activeConfig.featured.ctaLink}
                  onClick={() => setActiveDropdown(null)}
                  className="group/feat block bg-white border border-[#E8E2D6] hover:border-gold-400/70 rounded-lg p-3 shadow-xs hover:shadow-md transition-all duration-300"
                >
                  {/* Clean Rectangular Presentation */}
                  <div className="relative h-[175px] xl:h-[195px] w-full rounded-md overflow-hidden bg-forest-900/5 mb-3">
                    <Image
                      src={activeConfig.featured.image}
                      alt={activeConfig.featured.title}
                      fill
                      unoptimized
                      sizes="(max-width: 1280px) 300px, 340px"
                      className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-forest-950/60 via-transparent to-transparent opacity-40 group-hover:opacity-30 transition-opacity" />
                    <div className="absolute top-2.5 left-2.5">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-forest-900/90 backdrop-blur-xs border border-gold-400/40 text-[9px] font-bold uppercase tracking-[0.16em] text-gold-300 shadow-2xs">
                        <Sparkles className="w-2.5 h-2.5 text-gold-400" />
                        {activeConfig.featured.tag}
                      </span>
                    </div>
                  </div>

                  {/* Featured Content & CTA */}
                  <div className="px-1">
                    <h5 className="font-serif text-sm font-semibold text-forest-950 group-hover/feat:text-gold-700 transition-colors line-clamp-1">
                      {activeConfig.featured.title}
                    </h5>
                    <p className="text-[11px] text-forest-800/75 leading-snug mt-1 line-clamp-2">
                      {activeConfig.featured.subtitle}
                    </p>
                    <div className="mt-2.5 pt-2 border-t border-[#EFECE6] flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-forest-900 group-hover/feat:text-gold-700 transition-colors">
                      <span>{activeConfig.featured.ctaText}</span>
                      <ArrowRight className="w-3.5 h-3.5 text-gold-500 group-hover/feat:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </Link>
              </div>

            </div>

            {/* Clean Subtle Footer Bar */}
            <div className="mt-6 pt-3.5 border-t border-[#E8E2D6] flex items-center justify-between text-[11px] text-forest-800/80">
              <div className="flex items-center gap-2">
                <Link
                  href={activeConfig.href}
                  onClick={() => setActiveDropdown(null)}
                  className="inline-flex items-center gap-1.5 font-bold uppercase tracking-[0.12em] text-forest-900 hover:text-gold-700 transition-colors"
                >
                  <span>Explore All {activeConfig.name}</span>
                  <ArrowRight className="w-3 h-3 text-gold-500" />
                </Link>
                <span className="text-[#C5A869]/50 select-none">•</span>
                <span className="text-forest-700/70">Solid Ceylon Teak &amp; Artisanal Craftsmanship</span>
              </div>
              <div className="hidden sm:flex items-center gap-2 text-forest-700/70">
                <span className="w-1.5 h-1.5 rounded-full bg-gold-500" />
                <span>Islandwide White-Glove Delivery to all 25 Districts</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function DesktopNavLinksFallback() {
  return (
    <div className="flex items-center gap-1 xl:gap-2.5 py-1">
      <Link
        href="/shop"
        className="py-1.5 px-2 xl:px-2.5 text-[11px] xl:text-xs font-semibold tracking-[0.05em] uppercase text-forest-900"
      >
        Shop All
      </Link>
      <span className="h-3 w-px bg-gold-400/35 mx-1 select-none" aria-hidden="true" />
      {MEGA_MENU_CATEGORIES.filter((c) => c.slug !== 'shop-all').map((cat) => (
        <Link
          key={cat.slug}
          href={cat.href}
          className="py-1.5 px-1.5 xl:px-2.5 text-[11px] xl:text-xs font-semibold tracking-[0.05em] uppercase text-forest-900"
        >
          {cat.name}
        </Link>
      ))}
    </div>
  );
}

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [expandedMobileCategory, setExpandedMobileCategory] = useState<string | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isVisible, setIsVisible] = useState(true);
  const [isAtTop, setIsAtTop] = useState(true);
  const [mounted, setMounted] = useState(false);

  const lastScrollYRef = useRef(0);
  const tickingRef = useRef(false);

  const { openCart, getItemCount } = useCartStore();
  const { items: wishlistItems } = useWishlistStore();

  useEffect(() => {
    setMounted(true);

    const handleScroll = () => {
      if (!tickingRef.current) {
        window.requestAnimationFrame(() => {
          const currentScrollY = window.scrollY;

          // 1. At the very top of the page (within 15px)
          if (currentScrollY <= 15) {
            setIsAtTop(true);
            setIsVisible(true);
            lastScrollYRef.current = Math.max(0, currentScrollY);
            tickingRef.current = false;
            return;
          }

          setIsAtTop(false);

          // 2. Prevent rubber-banding past document bottom on macOS / iOS
          const maxScrollY = document.documentElement.scrollHeight - window.innerHeight;
          if (currentScrollY >= maxScrollY - 20) {
            tickingRef.current = false;
            return;
          }

          const deltaY = currentScrollY - lastScrollYRef.current;
          const scrollThreshold = 8; // Small threshold to avoid micro-jitter

          if (Math.abs(deltaY) >= scrollThreshold) {
            if (deltaY > 0) {
              // Scrolling DOWN -> smoothly hide navbar
              setIsVisible(false);
              setSearchOpen(false);
            } else {
              // Scrolling UP -> smoothly show navbar immediately
              setIsVisible(true);
            }
            lastScrollYRef.current = currentScrollY;
          }

          tickingRef.current = false;
        });
        tickingRef.current = true;
      }
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Close mobile drawer and restore navbar when route changes
  useEffect(() => {
    setIsVisible(true);
    setMobileMenuOpen(false);
    setSearchOpen(false);
    lastScrollYRef.current = 0;
  }, [pathname]);

  // Escape key & scroll lock for mobile slide-out panel
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMobileMenuOpen(false);
        setSearchOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setSearchOpen(false);
      router.push(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const toggleMobileAccordion = (slug: string) => {
    setExpandedMobileCategory((prev) => (prev === slug ? null : slug));
  };

  const itemCount = mounted ? getItemCount() : 0;
  const wishlistCount = mounted ? wishlistItems.length : 0;

  return (
    <>
      {/* Main Smart Scrolling Sticky Navbar */}
      <header
        className={`sticky top-0 z-50 w-full transition-transform duration-300 ease-in-out ${
          isVisible ? 'translate-y-0' : '-translate-y-full'
        }`}
      >
        <div
          className={`relative w-full border-b transition-[background-color,border-color,box-shadow] duration-300 ${
            isAtTop
              ? 'bg-[#FBF8F3] border-[#E8E2D6] shadow-none'
              : 'bg-[#FFFFFF] border-neutral-200/90 shadow-[0_2px_12px_rgba(24,59,43,0.06)]'
          }`}
        >
          <div className="max-w-[1380px] mx-auto px-4 sm:px-6 lg:px-6 xl:px-8">
            <div className="flex items-center justify-between h-16 lg:h-[72px] gap-3 lg:gap-4 xl:gap-6">
              
              {/* DIVISION 1: BRAND LOGO (Directly on Navbar Background) */}
              <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                {/* Mobile Hamburger Menu Button */}
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(true)}
                  className="inline-flex lg:hidden items-center justify-center w-8.5 h-8.5 rounded text-forest-900 hover:text-gold-600 transition-colors focus:outline-none"
                  aria-label="Open Navigation Menu"
                  aria-expanded={mobileMenuOpen}
                  aria-controls="mobile-navigation-drawer"
                >
                  <Menu className="w-5 h-5 stroke-[1.75]" />
                </button>

                {/* Original Aura Luxe Logo */}
                <Link
                  href="/"
                  className="group/brand inline-flex items-center gap-2.5 py-1 shrink-0 transition-opacity hover:opacity-90"
                >
                  <Image
                    src="/assets/logo.png"
                    alt="Aura Luxe Home"
                    width={36}
                    height={36}
                    priority
                    className="h-7 w-7 sm:h-8 sm:w-8 xl:h-9 xl:w-9 object-contain"
                  />
                  <div className="flex flex-col">
                    <span className="font-serif tracking-[0.14em] text-xs sm:text-sm xl:text-[15px] font-bold text-forest-900 uppercase leading-none group-hover/brand:text-gold-600 transition-colors">
                      Aura Luxe
                    </span>
                    <span className="text-[7.5px] sm:text-[8px] tracking-[0.22em] text-gold-600 uppercase font-sans font-semibold mt-0.5">
                      Home • Décor
                    </span>
                  </div>
                </Link>
              </div>

              {/* DIVISION 2: CATEGORY NAVIGATION DIVISION (One clean row: Shop All + 6 Categories) */}
              <nav
                aria-label="Primary Categories"
                className="hidden lg:flex items-center justify-center flex-1 min-w-0"
              >
                <Suspense fallback={<DesktopNavLinksFallback />}>
                  <DesktopNavLinksContent isNavbarVisible={isVisible} isAtTop={isAtTop} />
                </Suspense>
              </nav>

              {/* DIVISION 3: RIGHT-SIDE ACTION ICONS & SHOPPING BAG (Clean Minimalist Directly on Navbar) */}
              <div className="flex items-center justify-end gap-1.5 sm:gap-2.5 xl:gap-3.5 shrink-0">
                {/* Search Toggle */}
                <button
                  type="button"
                  onClick={() => setSearchOpen((prev) => !prev)}
                  className="inline-flex items-center justify-center p-1.5 text-forest-900 hover:text-gold-600 transition-colors shrink-0"
                  aria-label="Search Catalog"
                  aria-expanded={searchOpen}
                >
                  <Search className="w-4 h-4 stroke-[1.75]" />
                </button>

                {/* Wishlist Link */}
                <Link
                  href="/shop?filter=wishlist"
                  className="relative inline-flex items-center justify-center p-1.5 text-forest-900 hover:text-gold-600 transition-colors shrink-0"
                  aria-label="Wishlist"
                >
                  <Heart className="w-4 h-4 stroke-[1.75]" />
                  {wishlistCount > 0 && (
                    <span className="absolute top-0 right-0 min-w-[14px] h-3.5 px-0.5 bg-gold-500 text-cream-50 text-[8.5px] font-bold rounded-full inline-flex items-center justify-center leading-none">
                      {wishlistCount}
                    </span>
                  )}
                </Link>

                {/* Account Link */}
                <Link
                  href="/auth/login"
                  className="hidden sm:inline-flex items-center justify-center p-1.5 text-forest-900 hover:text-gold-600 transition-colors shrink-0"
                  aria-label="Account"
                >
                  <User className="w-4 h-4 stroke-[1.75]" />
                </Link>

                {/* Subtle Gold Separator before Bag */}
                <span
                  className="h-3.5 w-px bg-gold-400/35 select-none"
                  aria-hidden="true"
                />

                {/* Minimalist Shopping Bag Trigger */}
                <button
                  type="button"
                  onClick={openCart}
                  className="group/bag inline-flex items-center gap-1.5 py-1 px-1 text-forest-900 hover:text-gold-600 transition-colors shrink-0"
                  aria-label="Open Shopping Bag"
                >
                  <div className="relative flex items-center">
                    <ShoppingBag className="w-4 h-4 text-forest-900 group-hover/bag:text-gold-600 stroke-[1.75] transition-colors" />
                    {itemCount > 0 && (
                      <span className="sm:hidden absolute -top-1.5 -right-1.5 min-w-[13px] h-3.5 px-0.5 bg-gold-500 text-cream-50 text-[8.5px] font-bold rounded-full inline-flex items-center justify-center leading-none">
                        {itemCount}
                      </span>
                    )}
                  </div>
                  <span className="hidden sm:inline text-xs font-semibold tracking-wider uppercase text-forest-900 group-hover/bag:text-gold-600 transition-colors">
                    Bag
                  </span>
                  <span className="hidden sm:inline-flex items-center justify-center min-w-[18px] h-4 px-1.5 bg-gold-500/20 text-gold-700 text-[10px] font-bold rounded-full tabular-nums leading-none">
                    {itemCount}
                  </span>
                </button>
              </div>
            </div>

            {/* Expandable Search Bar */}
            {searchOpen && (
              <div className="py-3 border-t border-cream-300/60 animate-fadeIn">
                <form
                  onSubmit={handleSearchSubmit}
                  className="relative max-w-xl mx-auto flex items-center gap-2"
                >
                  <div className="relative flex-1">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search Ceylon teak armchairs, spun brass lighting, ceramics..."
                      className="w-full pl-10 pr-24 py-2 text-sm bg-white/95 border border-cream-300 rounded-lg focus:outline-none focus:border-forest-700 text-forest-900 placeholder:text-forest-400 shadow-2xs"
                      autoFocus
                    />
                    <Search className="w-4 h-4 text-forest-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <button
                      type="submit"
                      className="absolute right-1.5 top-1/2 -translate-y-1/2 px-4 py-1 bg-forest-800 text-cream-50 text-xs font-medium tracking-wider uppercase rounded-md hover:bg-forest-900 transition-colors"
                    >
                      Search
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSearchOpen(false)}
                    className="inline-flex items-center justify-center w-8.5 h-8.5 rounded-md text-forest-700 hover:text-forest-900 hover:bg-forest-50 transition-colors shrink-0"
                    aria-label="Close Search"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Mobile & Tablet Slide-Out Navigation Panel with Expandable Accordions */}
      <div
        id="mobile-navigation-drawer"
        role="dialog"
        aria-modal="true"
        aria-label="Navigation Menu"
        aria-hidden={!mobileMenuOpen}
        className={`lg:hidden fixed inset-0 z-50 transition-all duration-300 ${
          mobileMenuOpen ? 'visible pointer-events-auto' : 'invisible pointer-events-none'
        }`}
      >
        {/* Backdrop */}
        <div
          onClick={() => setMobileMenuOpen(false)}
          className={`fixed inset-0 bg-forest-950/60 backdrop-blur-xs transition-opacity duration-300 ${
            mobileMenuOpen ? 'opacity-100' : 'opacity-0'
          }`}
        />

        {/* Slide-out Panel */}
        <aside
          className={`fixed inset-y-0 left-0 w-[330px] max-w-[88vw] bg-forest-900 text-cream-100 border-r border-gold-400/20 flex flex-col transform transition-transform duration-300 ease-out shadow-2xl ${
            mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          {/* Drawer Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-gold-400/20 bg-forest-950/90">
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2.5"
            >
              <div className="bg-[#FAF6EE] p-0.5 rounded border border-gold-400/40 shrink-0">
                <Image
                  src="/assets/logo.png"
                  alt="Aura Luxe Home"
                  width={34}
                  height={34}
                  className="h-8 w-8 object-contain"
                />
              </div>
              <div className="flex flex-col">
                <span className="font-serif tracking-[0.18em] text-sm font-bold text-cream-100 uppercase leading-tight">
                  Aura Luxe
                </span>
                <span className="text-[9px] tracking-[0.22em] text-gold-300 uppercase font-sans font-semibold">
                  Home • Décor
                </span>
              </div>
            </Link>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(false)}
              className="inline-flex items-center justify-center w-8.5 h-8.5 rounded-md text-gold-300 hover:text-cream-100 hover:bg-forest-800/80 transition-colors"
              aria-label="Close Navigation Menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Drawer Body with Accordion Navigation */}
          <nav aria-label="Mobile Categories" className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
            {/* 1. Shop All Highlight */}
            <div>
              <Link
                href="/shop"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between p-3 rounded-lg bg-forest-800/80 border border-gold-400/30 text-cream-50 hover:bg-forest-800 transition-colors group"
              >
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold uppercase tracking-wider text-cream-50">
                      Shop All Creations
                    </span>
                    <span className="text-[9.5px] uppercase tracking-wider text-gold-300 bg-gold-500/20 px-1.5 py-0.2 rounded font-bold">
                      2026
                    </span>
                  </div>
                  <span className="text-[11px] text-cream-300/80 block mt-0.5">
                    Explore entire luxury furniture &amp; artisanal range
                  </span>
                </div>
                <ChevronRight className="w-4 h-4 text-gold-400 group-hover:translate-x-0.5 transition-transform shrink-0" />
              </Link>
            </div>

            {/* 2. Category Accordion List */}
            <div className="space-y-2">
              <p className="text-[10px] uppercase tracking-[0.22em] text-gold-400 font-bold mb-2 px-1 flex items-center gap-1.5">
                <span className="w-1 h-1 rounded-full bg-gold-400" />
                Category Collections
              </p>

              <div className="space-y-1.5">
                {MEGA_MENU_CATEGORIES.filter((c) => c.slug !== 'shop-all').map((cat) => {
                  const isExpanded = expandedMobileCategory === cat.slug;
                  return (
                    <div
                      key={cat.slug}
                      className="border border-forest-800/80 rounded-lg overflow-hidden bg-forest-950/40"
                    >
                      {/* Accordion Trigger */}
                      <button
                        type="button"
                        onClick={() => toggleMobileAccordion(cat.slug)}
                        className="w-full flex items-center justify-between p-3 text-left hover:bg-forest-800/60 transition-colors"
                        aria-expanded={isExpanded}
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-cream-100 font-serif">
                              {cat.name}
                            </span>
                            <span className="text-[8.5px] uppercase tracking-wider text-gold-400 bg-forest-900 px-1.5 py-0.5 rounded border border-gold-400/20">
                              {cat.featured.tag}
                            </span>
                          </div>
                          <span className="text-[10px] text-cream-300/70 block mt-0.5 line-clamp-1">
                            {cat.featured.subtitle}
                          </span>
                        </div>
                        <ChevronDown
                          className={`w-4 h-4 text-gold-400 transition-transform duration-200 shrink-0 ${
                            isExpanded ? 'rotate-180' : ''
                          }`}
                        />
                      </button>

                      {/* Accordion Content */}
                      {isExpanded && (
                        <div className="px-3 pb-3 pt-2 space-y-3 border-t border-forest-800/60 bg-forest-900/60 animate-fadeIn">
                          {cat.columns.map((col, colIdx) => (
                            <div key={colIdx} className="space-y-1">
                              <span className="text-[9px] font-bold uppercase tracking-[0.18em] text-gold-400 block px-1">
                                {col.heading}
                              </span>
                              <div className="space-y-0.5">
                                {col.links.map((link) => (
                                  <Link
                                    key={link.slug}
                                    href={link.href}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="group/sub flex items-center justify-between py-1 px-2 rounded hover:bg-forest-800/80 text-cream-200 hover:text-gold-300 transition-colors"
                                  >
                                    <span className="text-xs font-medium">{link.name}</span>
                                    <ChevronRight className="w-3.5 h-3.5 text-gold-400/50 group-hover/sub:text-gold-300 transition-colors shrink-0" />
                                  </Link>
                                ))}
                              </div>
                            </div>
                          ))}

                          <div className="pt-2 border-t border-forest-800/80">
                            <Link
                              href={cat.href}
                              onClick={() => setMobileMenuOpen(false)}
                              className="w-full inline-flex items-center justify-center gap-2 py-2 px-3 rounded bg-forest-800 text-cream-50 hover:bg-forest-700 text-xs font-semibold uppercase tracking-wider transition-colors border border-gold-400/30"
                            >
                              <span>Explore All {cat.name}</span>
                              <ArrowRight className="w-3.5 h-3.5 text-gold-400" />
                            </Link>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="border-t border-forest-800/80" />

            {/* 3. Customer Concierge & Services */}
            <div>
              <p className="text-[10px] uppercase tracking-[0.22em] text-gold-400 font-bold mb-2 px-1 flex items-center gap-1.5">
                <span className="w-1 h-1 rounded-full bg-gold-400" />
                Customer Concierge
              </p>
              <div className="space-y-1">
                <Link
                  href="/auth/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 py-2 px-2.5 rounded-lg text-xs font-medium text-cream-200 hover:text-cream-50 hover:bg-forest-800/50 transition-colors"
                >
                  <User className="w-4 h-4 text-gold-400 shrink-0" />
                  <span>Sign In / My Account</span>
                </Link>
                <Link
                  href="/shop?filter=wishlist"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between py-2 px-2.5 rounded-lg text-xs font-medium text-cream-200 hover:text-cream-50 hover:bg-forest-800/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Heart className="w-4 h-4 text-gold-400 shrink-0" />
                    <span>Saved Wishlist</span>
                  </div>
                  {wishlistCount > 0 && (
                    <span className="min-w-[18px] h-4 px-1.5 bg-gold-500 text-forest-950 font-bold rounded-full text-[10px] inline-flex items-center justify-center">
                      {wishlistCount}
                    </span>
                  )}
                </Link>
                <Link
                  href="/track-order"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 py-2 px-2.5 rounded-lg text-xs font-medium text-cream-200 hover:text-cream-50 hover:bg-forest-800/50 transition-colors"
                >
                  <ShieldCheck className="w-4 h-4 text-gold-400 shrink-0" />
                  <span>Track Sri Lanka Delivery</span>
                </Link>
                <Link
                  href="/admin/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 py-2 px-2.5 rounded-lg text-xs font-medium text-cream-200 hover:text-cream-50 hover:bg-forest-800/50 transition-colors"
                >
                  <MapPin className="w-4 h-4 text-gold-400 shrink-0" />
                  <span>Staff Portal</span>
                </Link>
              </div>
            </div>
          </nav>

          {/* Drawer Footer */}
          <div className="px-5 py-3.5 border-t border-gold-400/20 bg-forest-950/90 flex items-center justify-between text-[11px] text-cream-300">
            <span className="tracking-wide">White-Glove Delivery</span>
            <span className="text-gold-300 font-semibold tracking-wider uppercase">LKR (Rs.)</span>
          </div>
        </aside>
      </div>
    </>
  );
}
