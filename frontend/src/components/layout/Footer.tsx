'use client';

import Link from 'next/link';
import { FaFacebook, FaInstagram, FaTiktok } from 'react-icons/fa6';
import { IconType } from 'react-icons/lib';
import { Building2, MapPin, Mail } from 'lucide-react';

import { Logo } from './Logo';
import { ThemeToggle } from '../ui';

const LEGAL_LINKS = [
  { href: '/legal?tab=terms', label: 'Terms and Conditions' },
  { href: '/legal?tab=privacy', label: 'Privacy Policy' },
  { href: '/legal?tab=refunds', label: 'Refund Policy' },
  { href: '/legal?tab=cookie', label: 'Cookie Policy' },
];

export const Footer = () => {
  return (
    <footer className="relative w-full bg-[#0a0a0a] text-white border-t border-white/10 pt-16 pb-8 font-sans overflow-hidden">
      {/* Decorative background gradients */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
      <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-full max-w-2xl h-24 bg-primary/20 blur-[100px] rounded-full pointer-events-none" />

      <div className="main_container relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8 mb-16">
          {/* Brand Column */}
          <div className="lg:col-span-3 flex flex-col gap-6">
            <div className="flex items-center gap-4">
              <Logo />
            </div>
            <p className="text-white/60 text-sm leading-relaxed max-w-xs">
              Your trusted destination for genuine smartphones, electronics, chargers, and mobile accessories in Egypt.
            </p>
            <div>
              <ThemeToggle className="bg-white/5 hover:bg-white/10 border border-white/10 dark:bg-transparent dark:hover:bg-white/5" />
            </div>
          </div>

          {/* Links Columns */}
          <div className="lg:col-span-2">
            <FooterColumn
              title="Company"
              links={[
                { href: '/about', label: 'About' },
                { href: '/support', label: 'Contact Us' },
              ]}
            />
          </div>

          <div className="lg:col-span-2">
            <FooterColumn
              title="Buy"
              links={[
                { href: '/store', label: 'Our Store' },
                { href: '/store?category=smartphones', label: 'Smartphones' },
                { href: '/store?category=accessories', label: 'Accessories' },
              ]}
            />
          </div>

          <div className="lg:col-span-2">
            <h3 className="text-white/50 font-bold mb-6 tracking-wider text-xs uppercase">Follow Us</h3>
            <ul className="flex flex-col gap-4">
              <SocialLink
                href="https://www.facebook.com"
                icon={FaFacebook}
                label="Facebook"
              />
              <SocialLink
                href="https://www.instagram.com"
                icon={FaInstagram}
                label="Instagram"
              />
              <SocialLink
                href="https://www.tiktok.com"
                icon={FaTiktok}
                label="TikTok"
              />
            </ul>
          </div>

          {/* Company Details Column */}
          <div className="lg:col-span-3 md:col-span-2">
            <h3 className="text-white/50 font-bold mb-6 tracking-wider text-xs uppercase">Company Details</h3>
            <div className="flex flex-col gap-6">
              {/* Registered Info */}
              <div className="flex items-start gap-4 group">
                <div className="p-2 rounded-lg bg-white/5 border border-white/10 group-hover:border-primary/50 group-hover:bg-primary/10 transition-colors shrink-0">
                  <Building2 className="w-4 h-4 text-white/80 group-hover:text-primary transition-colors" />
                </div>
                <div className="flex flex-col gap-1 mt-0.5">
                  <span className="text-white/90 text-sm font-medium leading-none">Axiora Store</span>
                  <span className="text-white/50 text-sm mt-1">Egypt</span>
                </div>
              </div>

              {/* Address Info */}
              <div className="flex items-start gap-4 group">
                <div className="p-2 rounded-lg bg-white/5 border border-white/10 group-hover:border-primary/50 group-hover:bg-primary/10 transition-colors shrink-0">
                  <MapPin className="w-4 h-4 text-white/80 group-hover:text-primary transition-colors" />
                </div>
                <div className="flex flex-col gap-1 mt-0.5">
                  <span className="text-white/90 text-sm font-medium leading-tight">Cairo, Egypt</span>
                </div>
              </div>

              {/* Email Info */}
              <div className="flex items-start gap-4 group">
                <div className="p-2 rounded-lg bg-white/5 border border-white/10 group-hover:border-primary/50 group-hover:bg-primary/10 transition-colors shrink-0">
                  <Mail className="w-4 h-4 text-white/80 group-hover:text-primary transition-colors" />
                </div>
                <div className="flex flex-col gap-1 mt-0.5">
                  <a href="mailto:support@axiora-store.com" className="text-white/90 text-sm font-medium hover:text-primary transition-colors">support@axiora-store.com</a>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 border-t border-white/10 pt-8">
          <div className="flex flex-col md:flex-row items-center gap-4 md:gap-8">
            <Logo />
            <span className="text-white/40 text-sm">&copy; {new Date().getFullYear()} Axiora Store. All rights reserved.</span>
          </div>

          <ul className="flex flex-wrap justify-center gap-x-8 gap-y-4 text-sm font-medium">
            {LEGAL_LINKS.map((link, idx) => (
              <li key={idx}>
                <Link href={link.href} className="text-white/60 hover:text-primary transition-colors">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
};

function FooterColumn({
  title,
  links,
}: {
  title: string;
  links: { href: string; label: string }[];
}) {
  return (
    <div>
      <h3 className="text-white/50 font-bold mb-6 tracking-wider text-xs uppercase">{title}</h3>
      <ul className="flex flex-col gap-4">
        {links.map((link, idx) => (
          <li key={idx}>
            <Link href={link.href} className="text-white/80 hover:text-primary hover:translate-x-1 inline-block transition-all duration-300 text-sm">
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

function SocialLink({
  icon: Icon,
  label,
  href,
}: {
  icon: IconType;
  label: string;
  href: string;
}) {
  return (
    <li>
      <Link
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-3 text-white/80 hover:text-primary hover:translate-x-1 transition-all duration-300 group w-fit"
      >
        <div className="p-2 rounded-lg bg-white/5 border border-white/10 group-hover:border-primary/50 group-hover:bg-primary/10 transition-colors">
          <Icon size={16} className="text-white/80 group-hover:text-primary transition-colors" />
        </div>
        <span className="text-sm font-medium">{label}</span>
      </Link>
    </li>
  );
}
