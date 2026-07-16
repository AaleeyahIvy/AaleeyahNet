/**
 * Pixel icons drawn on grids, matching the heart/cat pixel-art style.
 * 'K' pixels use currentColor so every icon adapts to dark mode automatically.
 */
const PAL: Record<string, string> = {
  K: "currentColor", O: "#f5a34b", P: "#f463b1", Y: "#f7d54b",
  W: "#ffffff", B: "#4b9df5", G: "#4bc97a",
};

export const ICONS: Record<string, string[]> = {
  heart: [".KK..KK.", "KKKKKKKK", "KKKKKKKK", ".KKKKKK.", "..KKKK..", "...KK..."],
  monitor: ["KKKKKKKKK", "K.......K", "K.......K", "K.......K", "KKKKKKKKK", "....K....", "..KKKKK.."],
  person: ["..KKK..", ".KKKKK.", ".KKKKK.", "..KKK..", ".KKKKK.", "KKKKKKK", "KKKKKKK"],
  magnifier: [".KKK...", "K...K..", "K...K..", "K...K..", ".KKK...", "....KK.", ".....KK"],
  bookmark: ["KKKKK", "KKKKK", "KKKKK", "KKKKK", "KK.KK", "K...K"],
  home: ["...K...", "..KKK..", ".KKKKK.", "KKKKKKK", ".K...K.", ".K.K.K.", ".K.K.K."],
  code: ["..K..K..", ".K....K.", "K......K", ".K....K.", "..K..K.."],
  brush: ["....PP", "...KPP", "..KK..", ".KK...", "KK....", "K....."],
  pencil: ["....YY", "...KYY", "..KK..", ".KK...", "KK....", "K....."],
  doc: ["KKKK.", "K..KK", "K...K", "K.K.K", "K...K", "K.K.K", "KKKKK"],
  controller: [".KKKKKK.", "KKKKKKKK", "KK.KK.KK", "KKKKKKKK", ".KK..KK."],
  star: ["...K...", "..KKK..", "KKKKKKK", ".KKKKK.", "..K.K..", ".K...K."],
  gem: [".KKKK.", "KKKKKK", ".KKKK.", "..KK..", "..KK.."],
  bag: [".K.K.", ".KKK.", "KKKKK", "KKKKK", "KKKKK"],
  headphones: [".KKKK.", "KK..KK", "K....K", "KK..KK", "KK..KK"],
  eye: [".KKKK.", "KK..KK", "K.KK.K", "KK..KK", ".KKKK."],
  dice: ["KKKKK", "KWKWK", "KKKKK", "KWKWK", "KKKKK"],
  briefcase: [".KKK.", ".K.K.", "KKKKK", "KKKKK", "KKKKK"],
  camera: [".KK...", "KKKKKK", "KK..KK", "KK..KK", "KKKKKK"],
  paw: ["K.K.K", ".K.K.", ".KKK.", "KKKKK", ".KKK."],
  sun: ["K.K.K", ".KKK.", "KKKKK", ".KKK.", "K.K.K"],
  moon: ["..KKK", ".KK..", "KK...", ".KK..", "..KKK"],
  cookie: [".OOOO.", "OKOOKO", "OOOOOO", "OOKOOO", ".OOOO."],
  catface: ["K.....K", "KK...KK", "KOOOOOK", "KOKOKOK", "KOOPOOK", ".KKKKK."],
  smiley: [".YYYY.", "YKYYKY", "YYYYYY", "YKKKKY", ".YYYY."],
  tongue: [".YYYY.", "YKYYKY", "YYYYYY", "YKKKKY", ".YYPP."],
  worried: [".YYYY.", "YKYYKY", "YYYYYY", "YYKKYY", ".YYYY."],
  teddy: ["OO..OO", "OOOOOO", "OKOOKO", "OOOPOO", ".OOOO."],
  download: ["..K..", "..K..", "..K..", "KKKKK", ".KKK.", "..K.."],
};

export default function PixelIcon({
  name,
  cell = 3,
  inline = false,
}: {
  name: keyof typeof ICONS | string;
  cell?: number;
  inline?: boolean;
}) {
  const grid = ICONS[name];
  if (!grid) return null;
  const w = Math.max(...grid.map((r) => r.length)) * cell;
  const h = grid.length * cell;
  return (
    <svg
      className="pixelSvg pi"
      width={w}
      height={h}
      aria-hidden="true"
      style={inline ? { verticalAlign: "-0.12em", display: "inline-block", margin: 0 } : undefined}
    >
      {grid.flatMap((row, y) =>
        row.split("").map((ch, x) =>
          PAL[ch] ? (
            <rect key={`${x}-${y}`} x={x * cell} y={y * cell} width={cell} height={cell} fill={PAL[ch]} />
          ) : null
        )
      )}
    </svg>
  );
}
