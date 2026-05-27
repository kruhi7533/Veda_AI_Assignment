import { Sidebar } from './Sidebar';
import { MobileNav } from './MobileNav';

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex bg-veda-surface">
      <Sidebar />
      <main className="flex-1 min-w-0 pb-24 lg:pb-6">{children}</main>
      <MobileNav />
    </div>
  );
}
