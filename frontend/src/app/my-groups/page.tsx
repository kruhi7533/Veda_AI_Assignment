import { AppShell } from '@/components/AppShell';
import { TopBar } from '@/components/TopBar';
import { GroupsPage } from '@/components/GroupsPage';

export const dynamic = 'force-dynamic';

export default function Page() {
  return (
    <AppShell>
      <TopBar title="My Groups" />
      <GroupsPage />
    </AppShell>
  );
}
