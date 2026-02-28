import { useState, useEffect, useRef, useCallback } from "react";

// ── Types ─────────────────────────────────────────────────────────────────────
interface CropBox { x: number; y: number; w: number; h: number; }
type Handle = "move" | "nw" | "ne" | "sw" | "se";

interface Props {
  file: File;
  targetW: number;
  targetH: number;
  label: string;
  onConfirm: (dataUrl: string) => void;
  onCancel: () => void;
}

const MAX_W = 560;
const MAX_H = 400;
const MIN_SIZE = 30;
const HANDLE = 14; // slightly larger for touch

// ── Component ─────────────────────────────────────────────────────────────────
export default function ImageCropModal({ file, targetW, targetH, label, onConfirm, onCancel }: Props) {
  const [imgSrc,   setImgSrc]   = useState("");
  const [disp,     setDisp]     = useState({ w: 0, h: 0 });
  const [nat,      setNat]      = useState({ w: 0, h: 0 });
  const [crop,     setCrop]     = useState<CropBox>({ x: 0, y: 0, w: 0, h: 0 });
  const imgRef  = useRef<HTMLImageElement>(null);
  const dragRef = useRef<{ handle: Handle; sx: number; sy: number; sc: CropBox } | null>(null);

  const ratio = targetW / targetH;

  // Load object URL for the file
  useEffect(() => {
    const url = URL.createObjectURL(file);
    setImgSrc(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  // Once image loads, compute display size and initial crop
  function onLoad() {
    const img = imgRef.current!;
    const nw = img.naturalWidth, nh = img.naturalHeight;
    setNat({ w: nw, h: nh });

    let dw = nw, dh = nh;
    if (dw > MAX_W) { dh = Math.round(dh * MAX_W / dw); dw = MAX_W; }
    if (dh > MAX_H) { dw = Math.round(dw * MAX_H / dh); dh = MAX_H; }
    setDisp({ w: dw, h: dh });

    // Initial crop: fill as large as possible while preserving aspect ratio
    let cw = dw, ch = cw / ratio;
    if (ch > dh) { ch = dh; cw = ch * ratio; }
    setCrop({ x: (dw - cw) / 2, y: (dh - ch) / 2, w: cw, h: ch });
  }

  // ── Shared move logic (used by both mouse and touch) ─────────────────────────
  const applyMove = useCallback((clientX: number, clientY: number) => {
    if (!dragRef.current) return;
    const { handle, sx, sy, sc } = dragRef.current;
    const dx = clientX - sx, dy = clientY - sy;
    const { w: dw, h: dh } = disp;
    let { x, y, w, h } = sc;

    switch (handle) {
      case "move":
        x = Math.max(0, Math.min(dw - w, x + dx));
        y = Math.max(0, Math.min(dh - h, y + dy));
        break;

      case "se": {
        const d = Math.abs(dx) >= Math.abs(dy) ? dx : dy * ratio;
        w = Math.max(MIN_SIZE, sc.w + d);
        h = w / ratio;
        if (x + w > dw) { w = dw - x; h = w / ratio; }
        if (y + h > dh) { h = dh - y; w = h * ratio; }
        break;
      }
      case "sw": {
        const d = Math.abs(dx) >= Math.abs(dy) ? -dx : dy * ratio;
        w = Math.max(MIN_SIZE, sc.w + d);
        h = w / ratio;
        x = sc.x + sc.w - w;
        if (x < 0) { x = 0; w = sc.x + sc.w; h = w / ratio; }
        if (y + h > dh) { h = dh - y; w = h * ratio; x = sc.x + sc.w - w; }
        break;
      }
      case "ne": {
        const d = Math.abs(dx) >= Math.abs(dy) ? dx : -dy * ratio;
        w = Math.max(MIN_SIZE, sc.w + d);
        h = w / ratio;
        y = sc.y + sc.h - h;
        if (x + w > dw) { w = dw - x; h = w / ratio; y = sc.y + sc.h - h; }
        if (y < 0) { y = 0; h = sc.y + sc.h; w = h * ratio; }
        break;
      }
      case "nw": {
        const d = Math.abs(dx) >= Math.abs(dy) ? -dx : -dy * ratio;
        w = Math.max(MIN_SIZE, sc.w + d);
        h = w / ratio;
        x = sc.x + sc.w - w;
        y = sc.y + sc.h - h;
        if (x < 0) { x = 0; w = sc.x + sc.w; h = w / ratio; y = sc.y + sc.h - h; }
        if (y < 0) { y = 0; h = sc.y + sc.h; w = h * ratio; x = sc.x + sc.w - w; }
        break;
      }
    }
    setCrop({ x, y, w, h });
  }, [disp, ratio]);

  // ── Mouse handlers ────────────────────────────────────────────────────────────
  const onMouseMove = useCallback((e: MouseEvent) => {
    applyMove(e.clientX, e.clientY);
  }, [applyMove]);

  const onMouseUp = useCallback(() => {
    dragRef.current = null;
    window.removeEventListener("mousemove", onMouseMove);
    window.removeEventListener("mouseup", onMouseUp);
  }, [onMouseMove]);

  function startDrag(e: React.MouseEvent, handle: Handle) {
    e.preventDefault();
    e.stopPropagation();
    dragRef.current = { handle, sx: e.clientX, sy: e.clientY, sc: { ...crop } };
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
  }

  // ── Touch handlers ────────────────────────────────────────────────────────────
  const onTouchMove = useCallback((e: TouchEvent) => {
    e.preventDefault();
    const t = e.touches[0];
    applyMove(t.clientX, t.clientY);
  }, [applyMove]);

  const onTouchEnd = useCallback(() => {
    dragRef.current = null;
    window.removeEventListener("touchmove", onTouchMove);
    window.removeEventListener("touchend", onTouchEnd);
  }, [onTouchMove]);

  function startDragTouch(e: React.TouchEvent, handle: Handle) {
    e.stopPropagation();
    const t = e.touches[0];
    dragRef.current = { handle, sx: t.clientX, sy: t.clientY, sc: { ...crop } };
    window.addEventListener("touchmove", onTouchMove, { passive: false });
    window.addEventListener("touchend", onTouchEnd);
  }

  // ── Confirm: draw cropped area onto canvas at target size ───────────────────
  function confirmCrop() {
    const img = imgRef.current!;
    const scX = nat.w / disp.w, scY = nat.h / disp.h;
    const canvas = document.createElement("canvas");
    canvas.width  = targetW;
    canvas.height = targetH;
    canvas.getContext("2d")!.drawImage(
      img,
      crop.x * scX, crop.y * scY, crop.w * scX, crop.h * scY,
      0, 0, targetW, targetH
    );
    onConfirm(canvas.toDataURL("image/webp", 0.85));
  }

  // ── Handle style helper ─────────────────────────────────────────────────────
  const hs = (cursor: string, extra: React.CSSProperties): React.CSSProperties => ({
    position: "absolute", width: HANDLE, height: HANDLE,
    background: "#fff", border: "2px solid #C5A059",
    cursor, zIndex: 10, touchAction: "none", ...extra,
  });

  const ready = disp.w > 0;

  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.78)",
      zIndex: 2000, display: "flex", alignItems: "center",
      justifyContent: "center", padding: "1rem",
    }}>
      <div style={{
        background: "#fff", padding: "1.5rem",
        width: "100%", maxWidth: "640px",
        boxShadow: "0 24px 80px rgba(0,0,0,0.4)",
      }}>
        {/* Header */}
        <p style={{
          fontFamily: "Montserrat,sans-serif", fontWeight: 600,
          fontSize: "0.9rem", marginBottom: "0.3rem",
        }}>
          Recortar imagen
        </p>
        <p style={{
          fontFamily: "Montserrat,sans-serif", fontWeight: 300,
          fontSize: "0.7rem", color: "#757575", marginBottom: "1.5rem",
          letterSpacing: "0.02em",
        }}>
          Tamaño final: {targetW} × {targetH} px · {label}
          <br />Arrastra el recuadro para mover · Arrastra las esquinas para redimensionar.
        </p>

        {/* Crop canvas area */}
        <div style={{
          position: "relative",
          width: ready ? disp.w : MAX_W,
          height: ready ? disp.h : 200,
          margin: "0 auto",
          background: "#111",
          overflow: "hidden",
          userSelect: "none",
          touchAction: "none",
        }}>
          {imgSrc && (
            <img
              ref={imgRef}
              src={imgSrc}
              onLoad={onLoad}
              draggable={false}
              style={{
                position: "absolute", top: 0, left: 0,
                width: disp.w, height: disp.h,
                display: "block", pointerEvents: "none",
              }}
            />
          )}

          {ready && (
            <>
              {/* Dim overlay — 4 strips around the crop box */}
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: crop.y, background: "rgba(0,0,0,0.58)" }} />
              <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, top: crop.y + crop.h, background: "rgba(0,0,0,0.58)" }} />
              <div style={{ position: "absolute", top: crop.y, left: 0, width: crop.x, height: crop.h, background: "rgba(0,0,0,0.58)" }} />
              <div style={{ position: "absolute", top: crop.y, left: crop.x + crop.w, right: 0, height: crop.h, background: "rgba(0,0,0,0.58)" }} />

              {/* Crop box */}
              <div
                onMouseDown={e => startDrag(e, "move")}
                onTouchStart={e => startDragTouch(e, "move")}
                style={{
                  position: "absolute",
                  left: crop.x, top: crop.y,
                  width: crop.w, height: crop.h,
                  border: "2px solid rgba(197,160,89,0.9)",
                  cursor: "move", boxSizing: "border-box",
                  touchAction: "none",
                }}
              >
                {/* Rule-of-thirds grid */}
                {[1/3, 2/3].map(r => (
                  <div key={`h${r}`} style={{ position: "absolute", top: `${r*100}%`, left: 0, right: 0, height: 1, background: "rgba(255,255,255,0.25)", pointerEvents: "none" }} />
                ))}
                {[1/3, 2/3].map(r => (
                  <div key={`v${r}`} style={{ position: "absolute", left: `${r*100}%`, top: 0, bottom: 0, width: 1, background: "rgba(255,255,255,0.25)", pointerEvents: "none" }} />
                ))}

                {/* Corner handles — mouse + touch */}
                <div onMouseDown={e => startDrag(e, "nw")} onTouchStart={e => startDragTouch(e, "nw")} style={hs("nw-resize", { top: -HANDLE/2, left: -HANDLE/2 })} />
                <div onMouseDown={e => startDrag(e, "ne")} onTouchStart={e => startDragTouch(e, "ne")} style={hs("ne-resize", { top: -HANDLE/2, right: -HANDLE/2 })} />
                <div onMouseDown={e => startDrag(e, "sw")} onTouchStart={e => startDragTouch(e, "sw")} style={hs("sw-resize", { bottom: -HANDLE/2, left: -HANDLE/2 })} />
                <div onMouseDown={e => startDrag(e, "se")} onTouchStart={e => startDragTouch(e, "se")} style={hs("se-resize", { bottom: -HANDLE/2, right: -HANDLE/2 })} />
              </div>
            </>
          )}
        </div>

        {/* Buttons */}
        <div style={{ display: "flex", gap: "0.75rem", justifyContent: "flex-end", marginTop: "1.5rem" }}>
          <button
            onClick={onCancel}
            style={{
              fontFamily: "Montserrat,sans-serif", fontWeight: 300,
              fontSize: "0.7rem", letterSpacing: "0.15em", textTransform: "uppercase",
              background: "transparent", color: "#000",
              border: "1px solid #e5e5e5", padding: "0.75rem 1.5rem", cursor: "pointer",
            }}
          >
            Cancelar
          </button>
          <button
            onClick={confirmCrop}
            disabled={!ready}
            style={{
              fontFamily: "Montserrat,sans-serif", fontWeight: 500,
              fontSize: "0.7rem", letterSpacing: "0.15em", textTransform: "uppercase",
              background: "#000", color: "#fff", border: "none",
              padding: "0.75rem 2rem", cursor: ready ? "pointer" : "not-allowed",
              opacity: ready ? 1 : 0.5,
            }}
          >
            Confirmar recorte
          </button>
        </div>
      </div>
    </div>
  );
}
