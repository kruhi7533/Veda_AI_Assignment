import { AppShell } from '@/components/AppShell';
import { TopBar } from '@/components/TopBar';
import { Dashboard } from '@/components/Dashboard';

export const dynamic = 'force-dynamic';

export default function Home() {
  return (
    <AppShell>
      <TopBar title="Home" showBack={false} />
      <Dashboard />
    </AppShell>
  );
}
