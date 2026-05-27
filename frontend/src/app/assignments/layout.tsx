import { AppShell } from '@/components/AppShell';
import { TopBar } from '@/components/TopBar';

export default function AssignmentsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AppShell>
      <TopBar />
      {children}
    </AppShell>
  );
}
