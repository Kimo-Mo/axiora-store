import { Home, Smartphone, Zap, Headphones, Watch, ShieldCheck, HelpCircle } from 'lucide-react';
import type { ReactNode } from 'react';

export interface NavLink {
  href: string;
  label: string;
  icon: ReactNode;
  description: string;
}

export const NAV_LINKS: NavLink[] = [
  { href: '/', label: 'Home', icon: <Home size={18} />, description: 'Back to homepage' },
  {
    href: '/store?category=smartphones',
    label: 'Smartphones',
    icon: <Smartphone size={18} />,
    description: 'Latest mobile phones',
  },
  {
    href: '/store?category=chargers-cables',
    label: 'Chargers & Cables',
    icon: <Zap size={18} />,
    description: 'Fast chargers and cables',
  },
  {
    href: '/store?category=audio',
    label: 'Audio',
    icon: <Headphones size={18} />,
    description: 'Earbuds, headphones & speakers',
  },
  {
    href: '/store?category=wearables',
    label: 'Wearables',
    icon: <Watch size={18} />,
    description: 'Smartwatches and fitness bands',
  },
  {
    href: '/store?category=accessories',
    label: 'Accessories',
    icon: <ShieldCheck size={18} />,
    description: 'Cases, screen protectors & more',
  },
  { href: '/support', label: 'Support', icon: <HelpCircle size={18} />, description: 'Help & Warranty' },
];
