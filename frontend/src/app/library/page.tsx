import { AppShell } from '@/components/AppShell';
import { TopBar } from '@/components/TopBar';
import { LibraryPage } from '@/components/LibraryPage';

export const dynamic = 'force-dynamic';

export default function Page() {
  return (
    <AppShell>
      <TopBar title="My Library" />
      <LibraryPage />
    </AppShell>
  );
}
