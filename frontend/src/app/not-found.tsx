import Link from 'next/link';
import { Home, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center gap-6 text-center px-4">
      {/* Big 404 */}
      <div className="relative select-none">
        <span className="text-[9rem] font-black leading-none text-muted/60 tracking-tighter">
          404
        </span>
        <span className="absolute inset-0 flex items-center justify-center text-[9rem] font-black leading-none bg-clip-text text-transparent bg-linear-to-br from-primary to-primary/30 tracking-tighter">
          404
        </span>
      </div>

      <div className="space-y-2 max-w-sm">
        <h1 className="text-2xl font-bold tracking-tight">Page not found</h1>
        <p className="text-muted-foreground text-sm">
          The page you&apos;re looking for doesn&apos;t exist or has been moved. You can keep
          shopping genuine smartphones and accessories at Axiora Store.
        </p>
      </div>

      <div className="flex flex-wrap gap-3 justify-center">
        <Button asChild>
          <Link href="/">
            <Home size={16} className="me-2" />
            Back to Home
          </Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/store">
            <Search size={16} className="me-2" />
            Browse Products
          </Link>
        </Button>
      </div>
    </div>
  );
}
