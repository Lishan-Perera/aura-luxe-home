'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, Package, ShoppingCart, PlusCircle, Settings, LogOut, ExternalLink, ShieldCheck, Layers, Menu, X, Mail, Sparkles, Users } from 'lucide-react';
import Logo from '@/components/shared/Logo';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Close mobile sidebar drawer automatically on route navigation
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  // If on admin login page, don't show admin sidebar
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/admin/login');
  };

  const navItems = [
    { name: 'Dashboard Overview', href: '/admin', icon: LayoutDashboard },
    { name: 'Categories & Subcategories', href: '/admin/categories', icon: Layers },
    { name: 'Products & Inventory', href: '/admin/products', icon: Package },
    { name: 'Promotions & Flash Sale', href: '/admin/promotions', icon: Sparkles },
    { name: 'Orders & Fulfillment', href: '/admin/orders', icon: ShoppingCart },
    { name: 'Clients & Customers', href: '/admin/customers', icon: Users },
    { name: 'Contact Messages', href: '/admin/messages', icon: Mail },
    { name: 'Add New Product', href: '/admin/products/new', icon: PlusCircle },
    { name: 'District Shipping Settings', href: '/admin/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen flex bg-[#FBF8F3] overflow-x-hidden">
      {/* Mobile / Tablet Backdrop Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-[#123C2F]/40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar (Slide-over drawer on mobile/tablet, fixed column on lg+ desktop) */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#123C2F] text-[#FBF8F3] flex flex-col justify-between border-r border-white/10 shrink-0 transform transition-transform duration-200 ease-in-out lg:static lg:translate-x-0 overflow-y-auto ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
      >
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between gap-2 py-1">
            <Logo width={160} height={60} variant="light" />
            <button
              type="button"
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-1.5 rounded-md text-[#E9EDE7] hover:bg-white/10 hover:text-white transition-colors"
              aria-label="Close navigation menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="px-3 py-1.5 rounded-md bg-white/10 border border-white/15 flex items-center justify-between text-[11px]">
            <span className="text-[#E9EDE7] font-medium">Admin Workspace</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
          </div>

          <nav className="space-y-1 text-xs font-medium">
            {navItems.map((item) => {
              const active = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-md transition-colors ${active
                    ? 'bg-[#E9EDE7] text-[#123C2F] font-semibold'
                    : 'text-[#E9EDE7]/80 hover:bg-white/10 hover:text-white'
                    }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="p-6 border-t border-white/10 space-y-3 text-xs">
          <Link
            href="/"
            target="_blank"
            className="flex items-center justify-between text-[#E9EDE7] hover:text-white transition-colors py-1"
          >
            <span className="flex items-center gap-2">
              <ExternalLink className="w-4 h-4" />
              Live Storefront
            </span>
            <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded">View</span>
          </Link>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 text-[#E9EDE7]/80 hover:text-red-300 transition-colors py-1"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="sticky top-0 z-30 h-16 bg-white border-b border-[#D9D9D4] px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 text-xs text-[#666666] min-w-0">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 -ml-1 rounded-md text-[#123C2F] hover:bg-[#E9EDE7] transition-colors"
              aria-label="Open navigation menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <span className="font-semibold text-[#123C2F] text-sm truncate">Aura Luxe Admin</span>
          </div>

          <div className="flex items-center gap-3 sm:gap-4 shrink-0">
            <div className="flex items-center gap-2.5 text-xs">
              <div className="w-8 h-8 rounded-full bg-[#123C2F] text-white font-semibold flex items-center justify-center shrink-0">
                A
              </div>
              <div className="hidden sm:flex flex-col">
                <span className="font-medium text-[#333333]">Store Manager</span>
                <span className="text-[10px] text-[#666666]">admin@auraluxe.lk</span>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

