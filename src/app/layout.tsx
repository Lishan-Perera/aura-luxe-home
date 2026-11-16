import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Aura Luxe Home | Luxury Home Décor, Style & Comfort Sri Lanka',
  description:
    'Discover timeless luxury home decor, solid Ceylon teak furniture, artisan lighting, and handcrafted ceramics in Sri Lanka. Islandwide white-glove delivery to all 25 districts.',
  icons: {
    icon: '/assets/logo.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,400;1,600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen flex flex-col bg-cream-100 text-charcoal-900 selection:bg-gold-200 selection:text-forest-900 font-sans">
        {children}
      </body>
    </html>
  );
}
