import { Footer, Navbar } from '@/components/layout';
import { ReactNode, Suspense } from 'react';
import { AuthModalProvider } from '@/providers/AuthModalProvider';

export default function StoreLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense>
      <AuthModalProvider>
        <div className="flex min-h-screen flex-col items-center">
          <Navbar />
          <main className="flex-1 main_container py-6">{children}</main>
          <Footer />
        </div>
      </AuthModalProvider>
    </Suspense>
  );
}
