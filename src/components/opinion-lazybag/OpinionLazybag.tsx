'use client';

import { useState, useCallback } from 'react';
import type { OpinionEntry, DimensionDef } from '@/data/opinions';
import DimensionSelector from './DimensionSelector';
import OpinionScatterPlot from './OpinionScatterPlot';
import OpinionTable from './OpinionTable';

interface OpinionLazybagProps {
  opinions: OpinionEntry[];
  dimensions: DimensionDef[];
}

export default function OpinionLazybag({ opinions, dimensions }: OpinionLazybagProps) {
  const [activeX, setActiveX] = useState(dimensions[0].id);
  const [activeY, setActiveY] = useState(dimensions[1].id);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const xDim = dimensions.find((d) => d.id === activeX) || dimensions[0];
  const yDim = dimensions.find((d) => d.id === activeY) || dimensions[1];

  const handleChangeX = useCallback(
    (id: string) => {
      if (id === activeY) return;
      setActiveX(id);
    },
    [activeY],
  );

  const handleChangeY = useCallback(
    (id: string) => {
      if (id === activeX) return;
      setActiveY(id);
    },
    [activeX],
  );

  return (
    <div className="space-y-8">
      {/* How to read this chart */}
      <div className="bg-white border border-gray-200 rounded-sm p-6 md:p-8">
        <h2 className="font-serif text-lg font-bold text-gray-900 mb-3">
          如何閱讀這張圖表
        </h2>
        <div className="text-sm text-gray-600 leading-relaxed space-y-2 font-serif">
          <p>
            這張散布圖呈現憲法法庭不同意見的<strong>論證立場分布</strong>。每個圓點代表一個法律論點（非個人），
            位置由兩個分析維度決定。
          </p>
          <p>
            您可以透過上方的軸選擇器切換不同的分析維度，探索同一組意見在不同面向上的立場差異。
            將滑鼠移到圓點上可以查看該論點的詳細摘要。
          </p>
          <p className="text-gray-500 text-xs">
            本圖表僅呈現論證角度的分類，不涉及任何個人或黨派標籤。所有分類均基於法律論證內容。
          </p>
        </div>
      </div>

      {/* Dimension Selector */}
      <div className="bg-white border border-gray-200 rounded-sm p-4 md:p-6">
        <DimensionSelector
          dimensions={dimensions}
          activeX={activeX}
          activeY={activeY}
          onChangeX={handleChangeX}
          onChangeY={handleChangeY}
        />
      </div>

      {/* Scatter Plot */}
      <div className="bg-white border border-gray-200 rounded-sm p-4 md:p-6">
        <OpinionScatterPlot
          opinions={opinions}
          xDim={xDim}
          yDim={yDim}
          hoveredId={hoveredId}
          onHover={setHoveredId}
        />
      </div>

      {/* Opinion Table */}
      <div className="bg-white border border-gray-200 rounded-sm p-4 md:p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-serif font-bold text-gray-900 text-lg">
            所有意見論點
            <span className="text-gray-500 font-mono text-sm ml-2">({opinions.length})</span>
          </h3>
        </div>
        <OpinionTable
          opinions={opinions}
          dimensions={dimensions}
          highlightId={hoveredId}
          onHover={setHoveredId}
        />
      </div>
    </div>
  );
}
