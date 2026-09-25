import {
  INTERIM_SEGMENT,
  SERIES_BOUNDARY_NOTES,
  type StatuteSegment,
} from '@/data/threshold-analysis';

/**
 * 資料邊界的固定說明。
 *
 * 這三項是資料定義，可以斷言，不是推測。**不可摺疊起來。**
 * 讀者若沒看到第一項，會把 813 筆讀成聲請量。
 */
interface SeriesBoundaryNoteProps {
  /** 2022-01-04 至 2025-01-23 的過渡門檻。條文已逐字核對，附在本段最後。 */
  interim?: StatuteSegment;
}

export default function SeriesBoundaryNote({ interim = INTERIM_SEGMENT }: SeriesBoundaryNoteProps) {
  return (
    <section className="mt-10" aria-labelledby="boundary-heading">
      <h3 id="boundary-heading" className="font-serif text-lg font-bold text-gray-900 mb-1">
        這張圖不包含什麼
      </h3>
      <p className="text-sm text-gray-600 font-serif mb-4">
        以下三項是資料本身的邊界，不是推測。讀圖之前要先知道。
      </p>

      <ol className="space-y-3">
        {SERIES_BOUNDARY_NOTES.map((note, i) => (
          <li key={note.id} className="bg-white border border-gray-200 rounded-sm p-4 flex gap-3">
            <span className="font-mono text-xs font-bold text-gray-400 flex-shrink-0 pt-0.5">
              {String(i + 1).padStart(2, '0')}
            </span>
            <div>
              <h4 className="font-serif font-bold text-gray-900 text-sm mb-1">{note.heading}</h4>
              <p className="font-serif text-sm text-gray-600 leading-relaxed">{note.body}</p>
            </div>
          </li>
        ))}
      </ol>

      <div className="mt-3 bg-white border border-gray-200 rounded-sm p-4">
        <h4 className="font-serif font-bold text-gray-900 text-sm mb-1">
          {interim.effectiveFrom} 至 {interim.effectiveTo} 適用的是另一套條件
        </h4>
        <p className="font-serif text-sm text-gray-600 leading-relaxed">
          {interim.statute}
          {interim.article}：{interim.quotedText}
          {' '}這段沒有釋字可計，圖上畫斜線網底。
        </p>
        {interim.sourceUrl && (
          <a
            href={interim.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono text-[11px] text-gray-500 underline hover:text-gray-800 mt-2 inline-block"
          >
            全國法規資料庫 歷史條文
          </a>
        )}
      </div>
    </section>
  );
}
