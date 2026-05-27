import { AssignmentDetail } from '@/components/AssignmentDetail';

export const dynamic = 'force-dynamic';

interface Props {
  params: { id: string };
}

export default function AssignmentDetailPage({ params }: Props) {
  return <AssignmentDetail id={params.id} />;
}
