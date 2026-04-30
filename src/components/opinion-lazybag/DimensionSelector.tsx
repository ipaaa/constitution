import type { DimensionDef } from '@/data/opinions';

interface DimensionSelectorProps {
  dimensions: DimensionDef[];
  activeX: string;
  activeY: string;
  onChangeX: (id: string) => void;
  onChangeY: (id: string) => void;
}

export default function DimensionSelector({
  dimensions,
  activeX,
  activeY,
  onChangeX,
  onChangeY,
}: DimensionSelectorProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
      {/* X axis selector */}
      <div className="flex-1">
        <label className="block text-xs font-medium text-gray-500 uppercase tracking-widest mb-1.5">
          X 軸
        </label>
        {/* Desktop: toggle bar */}
        <div className="hidden sm:flex gap-1 bg-gray-100 rounded-sm p-0.5">
          {dimensions.map((dim) => (
            <button
              key={dim.id}
              onClick={() => onChangeX(dim.id)}
              disabled={dim.id === activeY}
              className={`text-xs px-3 py-1.5 rounded-sm font-medium transition-colors
                ${dim.id === activeX
                  ? 'bg-white text-gray-900 shadow-sm'
                  : dim.id === activeY
                    ? 'text-gray-300 cursor-not-allowed'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
            >
              {dim.label}
            </button>
          ))}
        </div>
        {/* Mobile: dropdown */}
        <select
          value={activeX}
          onChange={(e) => onChangeX(e.target.value)}
          className="sm:hidden w-full border border-gray-200 rounded-sm px-3 py-2 text-sm bg-white"
        >
          {dimensions.map((dim) => (
            <option key={dim.id} value={dim.id} disabled={dim.id === activeY}>
              {dim.label}
            </option>
          ))}
        </select>
      </div>

      {/* Y axis selector */}
      <div className="flex-1">
        <label className="block text-xs font-medium text-gray-500 uppercase tracking-widest mb-1.5">
          Y 軸
        </label>
        <div className="hidden sm:flex gap-1 bg-gray-100 rounded-sm p-0.5">
          {dimensions.map((dim) => (
            <button
              key={dim.id}
              onClick={() => onChangeY(dim.id)}
              disabled={dim.id === activeX}
              className={`text-xs px-3 py-1.5 rounded-sm font-medium transition-colors
                ${dim.id === activeY
                  ? 'bg-white text-gray-900 shadow-sm'
                  : dim.id === activeX
                    ? 'text-gray-300 cursor-not-allowed'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
            >
              {dim.label}
            </button>
          ))}
        </div>
        <select
          value={activeY}
          onChange={(e) => onChangeY(e.target.value)}
          className="sm:hidden w-full border border-gray-200 rounded-sm px-3 py-2 text-sm bg-white"
        >
          {dimensions.map((dim) => (
            <option key={dim.id} value={dim.id} disabled={dim.id === activeX}>
              {dim.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
