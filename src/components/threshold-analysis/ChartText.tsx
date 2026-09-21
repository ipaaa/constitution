/**
 * 圖內文字。桌機與行動版各出一個 <text>，字級不同。
 *
 * 單一 SVG 靠 viewBox 等比縮放（見設計文件的 `### Desktop and mobile`），
 * 代價是字也一起縮。viewBox 寬 960，在 375px 螢幕上實際寬約 311px，縮放比約 0.32
 * —— 桌機看起來剛好的 10px 字，到手機上只剩 3.2px，等於看不見。
 *
 * 因此行動版另給一個大得多的 fontSize。不傳 mobileFontSize 就是行動版不顯示這行字，
 * 用在「桌機才看得完、手機上改由下方文字段落交代」的標籤。
 *
 * **本元件不得 import FACTORS。**
 */
interface ChartTextProps {
  x: number;
  y: number;
  /** 行動版的 y。省略時與桌機相同。 */
  mobileY?: number;
  textAnchor?: 'start' | 'middle' | 'end';
  fontFamily?: string;
  fontWeight?: string;
  fontSize: number;
  /** 省略代表行動版不顯示這行字。 */
  mobileFontSize?: number;
  fill?: string;
  opacity?: number;
  children: string;
}

export default function ChartText({
  x,
  y,
  mobileY,
  textAnchor = 'middle',
  fontFamily = 'serif',
  fontWeight,
  fontSize,
  mobileFontSize,
  fill = '#4b5563',
  opacity,
  children,
}: ChartTextProps) {
  const shared = { x, textAnchor, fontFamily, fontWeight, fill, opacity };
  return (
    <>
      <text {...shared} y={y} fontSize={fontSize} className="hidden md:block">
        {children}
      </text>
      {mobileFontSize !== undefined && (
        <text {...shared} y={mobileY ?? y} fontSize={mobileFontSize} className="md:hidden">
          {children}
        </text>
      )}
    </>
  );
}
