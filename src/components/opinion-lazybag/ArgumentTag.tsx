import { type StanceValue, STANCE_LABELS } from '@/data/opinions';

const STANCE_COLORS: Record<StanceValue, { bg: string; text: string; border: string }> = {
  'support':      { bg: 'bg-blue-50',  text: 'text-blue-700',  border: 'border-blue-200' },
  'lean-support': { bg: 'bg-blue-50',  text: 'text-blue-600',  border: 'border-blue-100' },
  'neutral':      { bg: 'bg-gray-50',  text: 'text-gray-600',  border: 'border-gray-200' },
  'lean-oppose':  { bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-100' },
  'oppose':       { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
};

interface ArgumentTagProps {
  label: string;
  stance: StanceValue;
}

export default function ArgumentTag({ label, stance }: ArgumentTagProps) {
  const colors = STANCE_COLORS[stance];
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-sm border ${colors.bg} ${colors.text} ${colors.border}`}
    >
      {label ? `${label}: ` : ''}{STANCE_LABELS[stance]}
    </span>
  );
}
