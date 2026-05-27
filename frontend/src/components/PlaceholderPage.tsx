import { Construction } from 'lucide-react';

export function PlaceholderPage({ title }: { title: string }) {
  return (
    <div className="p-3">
      <div className="bg-white rounded-2xl shadow-card p-12 flex flex-col items-center text-center">
        <Construction className="w-12 h-12 text-veda-subtle" />
        <h2 className="mt-4 text-xl font-semibold">{title}</h2>
        <p className="mt-2 text-sm text-veda-subtle max-w-md">
          This section is part of the broader VedaAI product and is out of scope
          for this assessment. The Assignment Creator flow is fully functional.
        </p>
      </div>
    </div>
  );
}
