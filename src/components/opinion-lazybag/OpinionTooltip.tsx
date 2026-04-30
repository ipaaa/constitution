import type { OpinionEntry, DimensionDef } from '@/data/opinions';
import ArgumentTag from './ArgumentTag';

interface OpinionTooltipProps {
  opinion: OpinionEntry | null;
  xDim: DimensionDef;
  yDim: DimensionDef;
  style?: React.CSSProperties;
}

export default function OpinionTooltip({ opinion, xDim, yDim, style }: OpinionTooltipProps) {
  if (!opinion) return null;

  return (
    <div
      className="absolute z-50 w-72 bg-white border border-gray-200 rounded-sm shadow-lg p-4 pointer-events-none
                 md:block hidden"
      style={style}
    >
      <div className="text-[10px] font-mono text-gray-400 uppercase tracking-widest mb-1">
        {opinion.rulingRef}
      </div>
      {opinion.category && (
        <div className="text-[10px] font-medium text-gray-500 mb-1">{opinion.category}</div>
      )}
      {opinion.justiceName && (
        <div className="text-[10px] text-gray-400 mb-2">大法官：{opinion.justiceName}</div>
      )}
      <p className="text-sm text-gray-800 font-serif leading-relaxed mb-3">
        {opinion.argumentSummary}
      </p>
      <div className="flex flex-wrap gap-1.5">
        <ArgumentTag label={xDim.label} stance={opinion.stances[xDim.id]} />
        <ArgumentTag label={yDim.label} stance={opinion.stances[yDim.id]} />
      </div>
    </div>
  );
}
