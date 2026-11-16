import Image from 'next/image';
import Link from 'next/link';

interface LogoProps {
  className?: string;
  imageClassName?: string;
  width?: number;
  height?: number;
  showText?: boolean;
  variant?: 'dark' | 'light';
}

export default function Logo({
  className = '',
  imageClassName = 'object-contain max-h-[65px] w-auto',
  width = 160,
  height = 65,
  showText = false,
  variant = 'dark',
}: LogoProps) {
  const isLight = variant === 'light';

  return (
    <Link href="/" className={`inline-flex items-center gap-3 shrink-0 transition-opacity hover:opacity-90 ${className}`}>
      <div className="relative shrink-0 overflow-hidden rounded-sm flex items-center justify-center">
        <Image
          src={isLight ? '/assets/logo-light.png' : '/assets/logo.png'}
          alt="Aura Luxe Home - Home Décor, Style, Comfort"
          width={width}
          height={height}
          priority
          className={imageClassName}
        />
      </div>
      {showText && (
        <div className="flex flex-col">
          <span
            className={`font-serif tracking-widest text-lg font-bold uppercase ${
              isLight ? 'text-cream-100' : 'text-forest-700'
            }`}
          >
            Aura Luxe
          </span>
          <span
            className={`text-[10px] tracking-[0.25em] uppercase font-sans -mt-1 font-semibold ${
              isLight ? 'text-gold-300' : 'text-gold-500'
            }`}
          >
            Home • Décor
          </span>
        </div>
      )}
    </Link>
  );
}

