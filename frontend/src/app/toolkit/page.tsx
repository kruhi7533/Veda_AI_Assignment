import { AppShell } from '@/components/AppShell';
import { TopBar } from '@/components/TopBar';
import { ToolkitPage } from '@/components/ToolkitPage';

export const dynamic = 'force-dynamic';

export default function Page() {
  return (
    <AppShell>
      <TopBar title="AI Teacher's Toolkit" />
      <ToolkitPage />
    </AppShell>
  );
}
