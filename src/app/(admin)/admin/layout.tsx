'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, Package, ShoppingCart, Image as ImageIcon, Settings, LogOut, ExternalLink, ShieldCheck, Layers } from 'lucide-react';
import Logo from '@/components/shared/Logo';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

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
    { name: 'Orders & Fulfillment', href: '/admin/orders', icon: ShoppingCart },
    { name: 'Add Product (Cloudinary)', href: '/admin/products/new', icon: ImageIcon },
    { name: 'District Shipping Settings', href: '/admin/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen flex bg-cream-200/50">
      {/* Sidebar */}
      <aside className="w-64 bg-forest-900 text-cream-100 flex flex-col justify-between border-r border-gold-400/20 shadow-xl shrink-0">
        <div className="p-6 space-y-6">
          <div className="py-1">
            <Logo width={160} height={60} variant="light" />
          </div>

          <div className="px-3 py-1.5 rounded bg-forest-800/80 border border-gold-400/30 flex items-center justify-between text-[11px]">
            <span className="text-gold-300 font-semibold">Admin Workspace</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          </div>

          <nav className="space-y-1.5 text-xs font-medium">
            {navItems.map((item) => {
              const active = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-md transition-all ${
                    active
                      ? 'bg-gold-500 text-forest-950 font-bold shadow-sm'
                      : 'text-cream-200/80 hover:bg-forest-800 hover:text-cream-50'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="p-6 border-t border-forest-800 space-y-3 text-xs">
          <Link
            href="/"
            target="_blank"
            className="flex items-center justify-between text-gold-300 hover:text-cream-50 transition-colors py-1"
          >
            <span className="flex items-center gap-2">
              <ExternalLink className="w-4 h-4" />
              Live Storefront
            </span>
            <span className="text-[10px] bg-forest-800 px-1.5 py-0.5 rounded">View</span>
          </Link>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 text-cream-300 hover:text-red-400 transition-colors py-1"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-cream-300 px-8 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3 text-xs text-forest-600">
            <span className="font-serif font-bold text-forest-900 text-sm">Aura Luxe Admin</span>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-xs">
              <div className="w-8 h-8 rounded-full bg-forest-800 text-gold-300 font-serif font-bold flex items-center justify-center">
                A
              </div>
              <div className="flex flex-col">
                <span className="font-semibold text-forest-900">Store Manager</span>
                <span className="text-[10px] text-forest-500">admin@auraluxe.lk</span>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

