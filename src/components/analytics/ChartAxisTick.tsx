const accentPalette = ['#0ea5e9', '#6366f1', '#14b8a6', '#f97316', '#8b5cf6', '#0f172a'];

const splitLongWord = (word: string, maxChars: number): string[] => {
  const segments: string[] = [];
  for (let i = 0; i < word.length; i += maxChars) {
    segments.push(word.slice(i, i + maxChars));
  }
  return segments;
};

const buildLines = (value = '', maxChars = 18): string[] => {
  const words = value.split(' ').filter(Boolean);
  const lines: string[] = [];
  let currentLine = '';

  words.forEach((word) => {
    if (word.length > maxChars) {
      if (currentLine) {
        lines.push(currentLine);
        currentLine = '';
      }
      lines.push(...splitLongWord(word, maxChars));
      return;
    }

    if (!currentLine) {
      currentLine = word;
      return;
    }

    if (`${currentLine} ${word}`.length <= maxChars) {
      currentLine = `${currentLine} ${word}`;
    } else {
      lines.push(currentLine);
      currentLine = word;
    }
  });

  if (currentLine) {
    lines.push(currentLine);
  }

  return lines.length ? lines : [''];
};

interface TickPayload {
  value?: string | number;
  index?: number;
}

export interface ChartAxisTickProps {
  x?: number;
  y?: number;
  payload?: TickPayload;
  maxChars?: number;
}

const ChartAxisTick = ({ x = 0, y = 0, payload, maxChars = 18 }: ChartAxisTickProps) => {
  const labelValue = typeof payload?.value === 'number' ? String(payload.value) : payload?.value ?? '';
  const lines = buildLines(labelValue, maxChars);
  const paletteIndex = payload?.index ?? 0;
  const accent = accentPalette[paletteIndex % accentPalette.length] ?? accentPalette[0];
  const connectorStartY = y + 4;
  const dotY = connectorStartY + 8;
  const textStartY = dotY + 14;
  const lineHeight = 14;

  return (
    <g>
      <line
        x1={x}
        x2={x}
        y1={connectorStartY}
        y2={dotY - 2}
        stroke={accent}
        strokeWidth={1.5}
        strokeLinecap="round"
        opacity={0.7}
      />
      <circle cx={x} cy={dotY} r={3} fill={accent} opacity={0.85} />
      <text
        x={x}
        y={textStartY}
        textAnchor="middle"
        fill="#0f172a"
        fontSize={12}
        fontWeight={600}
      >
        {lines.map((line, index) => (
          <tspan key={index} x={x} dy={index === 0 ? 0 : lineHeight}>
            {line}
          </tspan>
        ))}
      </text>
    </g>
  );
};

export default ChartAxisTick;
