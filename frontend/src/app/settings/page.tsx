import { AppShell } from '@/components/AppShell';
import { TopBar } from '@/components/TopBar';
import { SettingsPage } from '@/components/SettingsPage';

export const dynamic = 'force-dynamic';

export default function Page() {
  return (
    <AppShell>
      <TopBar title="Settings" />
      <SettingsPage />
    </AppShell>
  );
}
