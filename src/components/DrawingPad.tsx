"use client";

import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from "react";

const W = 640;
const H = 400;
const COLORS = [
  { name: "black", value: "#111111" },
  { name: "pink", value: "#f463b1" },
  { name: "orange", value: "#f5a34b" },
  { name: "yellow", value: "#f7d54b" },
  { name: "green", value: "#4bc97a" },
  { name: "blue", value: "#4b9df5" },
  { name: "purple", value: "#a66cf2" },
  { name: "eraser (white)", value: "#ffffff" },
];
const SIZES = [3, 7, 14];
const MAX_UNDO = 25;

export type DrawingPadHandle = {
  /** PNG data URL, or null if nothing has been drawn. */
  toDataURL: () => string | null;
  clear: () => void;
};

/**
 * A little paint canvas for guestbook doodles. Works with mouse, pen and
 * touch (pointer events). Always exports at a fixed 640×400 so every
 * drawing is the same size no matter the screen.
 */
const DrawingPad = forwardRef<DrawingPadHandle, { onChange?: (hasDrawing: boolean) => void }>(
  function DrawingPad({ onChange }, ref) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [color, setColor] = useState(COLORS[0].value);
    const [size, setSize] = useState(SIZES[1]);
    const [dirty, setDirty] = useState(false);
    const undo = useRef<ImageData[]>([]);
    const trimmed = useRef(false); // older strokes fell off the undo stack
    const drawing = useRef(false);
    const last = useRef<{ x: number; y: number } | null>(null);

    const ctx = () => canvasRef.current!.getContext("2d")!;

    const fillWhite = useCallback(() => {
      const c = ctx();
      c.fillStyle = "#ffffff";
      c.fillRect(0, 0, W, H);
    }, []);

    useEffect(() => fillWhite(), [fillWhite]);

    const markDirty = (v: boolean) => {
      setDirty(v);
      onChange?.(v);
    };

    const clear = useCallback(() => {
      undo.current = [];
      trimmed.current = false;
      fillWhite();
      setDirty(false);
      onChange?.(false);
    }, [fillWhite, onChange]);

    useImperativeHandle(ref, () => ({
      toDataURL: () => (dirty ? canvasRef.current!.toDataURL("image/png") : null),
      clear,
    }));

    const point = (e: React.PointerEvent) => {
      const r = canvasRef.current!.getBoundingClientRect();
      return { x: ((e.clientX - r.left) / r.width) * W, y: ((e.clientY - r.top) / r.height) * H };
    };

    const stroke = (from: { x: number; y: number }, to: { x: number; y: number }, pressure = 0.5) => {
      const c = ctx();
      c.strokeStyle = color;
      c.lineWidth = size * (0.6 + pressure * 0.8);
      c.lineCap = "round";
      c.lineJoin = "round";
      c.beginPath();
      c.moveTo(from.x, from.y);
      c.lineTo(to.x, to.y);
      c.stroke();
    };

    const down = (e: React.PointerEvent<HTMLCanvasElement>) => {
      e.preventDefault();
      e.currentTarget.setPointerCapture(e.pointerId);
      undo.current.push(ctx().getImageData(0, 0, W, H));
      if (undo.current.length > MAX_UNDO) {
        undo.current.shift();
        trimmed.current = true;
      }
      drawing.current = true;
      const p = point(e);
      last.current = p;
      stroke(p, { x: p.x + 0.01, y: p.y }, e.pressure || 0.5); // a dot on click
      if (!dirty) markDirty(true);
    };

    const move = (e: React.PointerEvent<HTMLCanvasElement>) => {
      if (!drawing.current || !last.current) return;
      const p = point(e);
      stroke(last.current, p, e.pointerType === "pen" ? e.pressure : 0.5);
      last.current = p;
    };

    const up = () => {
      drawing.current = false;
      last.current = null;
    };

    const doUndo = () => {
      const prev = undo.current.pop();
      if (prev) ctx().putImageData(prev, 0, 0);
      if (undo.current.length === 0 && !trimmed.current) markDirty(false);
    };

    return (
      <div className="drawPad">
        <canvas
          ref={canvasRef}
          width={W}
          height={H}
          className="drawCanvas"
          onPointerDown={down}
          onPointerMove={move}
          onPointerUp={up}
          onPointerCancel={up}
          onPointerLeave={up}
          role="img"
          aria-label="Drawing canvas — draw with your mouse, finger, or stylus"
        />
        <div className="drawTools" role="toolbar" aria-label="Drawing tools">
          {COLORS.map((c) => (
            <button
              key={c.value}
              type="button"
              className="swatch"
              style={{ background: c.value }}
              aria-label={c.name}
              aria-pressed={color === c.value}
              onClick={() => setColor(c.value)}
            />
          ))}
          <span className="drawSep" aria-hidden="true" />
          {SIZES.map((s, i) => (
            <button
              key={s}
              type="button"
              className="sizeBtn"
              aria-label={["thin", "medium", "thick"][i] + " brush"}
              aria-pressed={size === s}
              onClick={() => setSize(s)}
            >
              <i style={{ width: s + 2, height: s + 2 }} />
            </button>
          ))}
          <span className="drawSep" aria-hidden="true" />
          <button type="button" className="btn btnSmall" onClick={doUndo} disabled={!dirty}>
            undo
          </button>
          <button type="button" className="btn btnSmall btnDanger" onClick={clear} disabled={!dirty}>
            clear
          </button>
        </div>
      </div>
    );
  }
);

export default DrawingPad;
