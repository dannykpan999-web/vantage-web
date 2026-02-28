import { useState, useRef, useEffect, useCallback } from "react";
import { useInView } from "../../hooks/useInView";
import { useQuery } from "@tanstack/react-query";
import { getProducts } from "../../services/products";

const FALLBACK_IMGS = [
  "/images/product-brush.webp",
  "/images/product-scissors.webp",
  "/images/product-hot-oil.webp",
  "/images/product-razor.webp",
];

const DEFAULT_PRODUCTS = [
  { id: "d1", name: "Brocha De Afeitar",     description: "Cerdas naturales de tejón para una espuma perfecta. Ideal para un afeitado clásico y de lujo que cuida la piel con cada uso.", price: 24, images: ["/images/product-brush.webp"],    stock_quantity: 99, low_stock_threshold: 5, is_active: true },
  { id: "d2", name: "Tijeras Profesionales", description: "Acero japonés de precisión para cortes impecables. Equilibradas para reducir la fatiga y maximizar la exactitud en cada corte.", price: 48, images: ["/images/product-scissors.webp"], stock_quantity: 99, low_stock_threshold: 5, is_active: true },
  { id: "d3", name: "Aceite Capilar",        description: "Fórmula nutritiva para cabello suave y brillante. Enriquecida con aceites esenciales que fortalecen desde la raíz hasta las puntas.", price: 32, images: ["/images/product-hot-oil.webp"],  stock_quantity: 99, low_stock_threshold: 5, is_active: true },
  { id: "d4", name: "Navaja De Afeitar",     description: "Afeitado clásico con hoja de doble filo recambiable. Diseño ergonómico de acero inoxidable para el afeitado más limpio y cercano.", price: 65, images: ["/images/product-razor.webp"],   stock_quantity: 99, low_stock_threshold: 5, is_active: true },
];

type Product = { id: string; name: string; description: string; price: number; images: string[]; stock_quantity: number; low_stock_threshold: number; is_active: boolean; };

/* ── Product Detail Modal ─────────────────────────────────────────────────── */
function ProductModal({ product, onClose }: { product: Product; onClose: () => void }) {
  const [expanded, setExpanded] = useState(false);
  const [added, setAdded]       = useState(false);
  const [photoIdx, setPhotoIdx] = useState(0);
  const gold = "#C5A059";

  const imgs = product.images && product.images.length > 0 ? product.images : [];
  const outOfStock = product.stock_quantity === 0;

  function handleAddToCart() {
    setAdded(true);
    setTimeout(() => { setAdded(false); onClose(); }, 1400);
  }
  const DESC_LIMIT = 80;
  const isLong = product.description.length > DESC_LIMIT;
  const displayDesc = !expanded && isLong
    ? product.description.slice(0, DESC_LIMIT).trimEnd() + "…"
    : product.description;

  return (
    <div onClick={onClose} style={{
      position: "fixed", inset: 0, zIndex: 999,
      background: "rgba(0,0,0,0.82)",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: "20px",
      animation: "pmFadeIn 0.25s ease forwards",
    }}>
      <style>{`
        @keyframes pmFadeIn  { from{opacity:0} to{opacity:1} }
        @keyframes pmSlideUp { from{opacity:0;transform:translateY(28px)} to{opacity:1;transform:translateY(0)} }
        .pm-close:hover { color:#fff !important; }
        .pm-cta:hover   { background:#C5A059 !important; border-color:#C5A059 !important; color:#fff !important; }
        .pm-expand:hover { color:#C5A059 !important; }
        .pm-thumb:hover { opacity:1 !important; }
      `}</style>
      <div onClick={e => e.stopPropagation()} style={{
        background: "#0e0e0e", maxWidth: "520px", width: "100%",
        maxHeight: "90vh", overflowY: "auto",
        animation: "pmSlideUp 0.3s ease forwards", position: "relative",
      }}>
        <button className="pm-close" onClick={onClose} style={{
          position:"absolute", top:"14px", right:"16px",
          background:"none", border:"none", cursor:"pointer",
          color:"rgba(255,255,255,0.4)", fontSize:"24px", fontWeight:200,
          zIndex:1, lineHeight:1, padding:"4px 8px", transition:"color 0.2s",
        }}>×</button>
        {/* Main photo with nav arrows if multiple */}
        <div style={{ width:"100%", aspectRatio:"1/1", overflow:"hidden", background:"#1a1a1a", position:"relative" }}>
          <img src={imgs[photoIdx] || ""} alt={product.name}
            style={{ width:"100%", height:"100%", objectFit:"cover", display:"block", transition:"opacity 0.2s" }} />
          {imgs.length > 1 && (
            <>
              <button onClick={e => { e.stopPropagation(); setPhotoIdx(i => Math.max(0, i - 1)); }}
                style={{ position:"absolute", left:"10px", top:"50%", transform:"translateY(-50%)", background:"rgba(0,0,0,0.5)", border:"none", color:"#fff", fontSize:"20px", width:"36px", height:"36px", borderRadius:"50%", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", opacity: photoIdx === 0 ? 0.25 : 0.8 }}
                disabled={photoIdx === 0}>‹</button>
              <button onClick={e => { e.stopPropagation(); setPhotoIdx(i => Math.min(imgs.length - 1, i + 1)); }}
                style={{ position:"absolute", right:"10px", top:"50%", transform:"translateY(-50%)", background:"rgba(0,0,0,0.5)", border:"none", color:"#fff", fontSize:"20px", width:"36px", height:"36px", borderRadius:"50%", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", opacity: photoIdx === imgs.length - 1 ? 0.25 : 0.8 }}
                disabled={photoIdx === imgs.length - 1}>›</button>
              {/* Dot indicators */}
              <div style={{ position:"absolute", bottom:"10px", left:"50%", transform:"translateX(-50%)", display:"flex", gap:"6px" }}>
                {imgs.map((_, i) => (
                  <button key={i} onClick={e => { e.stopPropagation(); setPhotoIdx(i); }}
                    style={{ width: i === photoIdx ? "20px" : "6px", height:"6px", borderRadius:"3px", padding:0, border:"none", cursor:"pointer", background: i === photoIdx ? gold : "rgba(255,255,255,0.45)", transition:"all 0.25s" }} />
                ))}
              </div>
            </>
          )}
        </div>
        <div style={{ padding:"clamp(24px,5vw,40px)" }}>
          <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:"clamp(22px,4vw,28px)",
            fontWeight:700, color:"#fff", lineHeight:1.2, marginBottom:"16px" }}>
            {product.name}
          </h2>
          <p style={{ fontFamily:"Montserrat,sans-serif", fontSize:"13px", fontWeight:300,
            color:"#888", lineHeight:1.75, marginBottom: isLong ? "6px" : "24px" }}>
            {displayDesc}
          </p>
          {isLong && (
            <button className="pm-expand" onClick={() => setExpanded(s => !s)} style={{
              background:"none", border:"none", cursor:"pointer",
              fontFamily:"Montserrat,sans-serif", fontSize:"11px",
              fontWeight:400, letterSpacing:"0.15em", textTransform:"uppercase",
              color:"rgba(197,160,89,0.7)", padding:0, marginBottom:"24px", transition:"color 0.2s",
            }}>
              {expanded ? "Ver menos ↑" : "Ver más ↓"}
            </button>
          )}
          <p style={{ fontFamily:"Montserrat,sans-serif", fontSize:"22px", fontWeight:600,
            color:gold, letterSpacing:"0.05em", marginBottom: outOfStock ? "12px" : "28px" }}>
            ${typeof product.price === "number" ? product.price.toFixed(2) : product.price}
          </p>
          {outOfStock && (
            <p style={{ fontFamily:"Montserrat,sans-serif", fontSize:"10px", fontWeight:500,
              letterSpacing:"0.2em", textTransform:"uppercase", color:"#c0392b",
              marginBottom:"20px" }}>Sin stock</p>
          )}
          <button className="pm-cta" onClick={handleAddToCart} disabled={outOfStock} style={{
            width:"100%", padding:"16px",
            fontFamily:"Montserrat,sans-serif", fontSize:"11px", fontWeight:500,
            letterSpacing:"0.25em", textTransform:"uppercase",
            color: outOfStock ? "rgba(255,255,255,0.25)" : added ? "#fff" : "rgba(255,255,255,0.8)",
            background: added ? "#C5A059" : "transparent",
            border: added ? "1px solid #C5A059" : `1px solid ${outOfStock ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.25)"}`,
            cursor: outOfStock ? "not-allowed" : "pointer", transition:"all 0.25s ease",
          }}>
            {outOfStock ? "Agotado" : added ? "¡Agregado al Carrito ✓" : "Agregar al Carrito"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Main section ─────────────────────────────────────────────────────────── */
const GAP = 24; // px between cards

export default function FeaturedProducts() {
  const [headingRef, headingInView] = useInView();
  const [activeProduct, setActiveProduct] = useState<Product | null>(null);

  /* ── Per-card photo index (which photo is active within each product card) ── */
  const [cardPhotoIdx, setCardPhotoIdx] = useState<Record<number, number>>({});

  /* ── Main carousel state ── */
  const viewportRef = useRef<HTMLDivElement>(null);
  const [cw, setCw]           = useState(0);
  const [page, setPage]       = useState(0);

  const { data: apiProducts } = useQuery({
    queryKey: ["products-public"],
    queryFn: getProducts,
    staleTime: 1000 * 60 * 5,
  });

  const rawList = (apiProducts && apiProducts.length > 0 ? apiProducts : DEFAULT_PRODUCTS) as Product[];
  const products = rawList.map((p, i) => ({
    ...p,
    images: p.images && p.images.length > 0
      ? p.images.map(url => url.startsWith("/uploads/") ? `https://vantagestudioapp.com${url}` : url)
      : [FALLBACK_IMGS[i % FALLBACK_IMGS.length]],
  }));

  /* Measure container on mount + resize */
  const measure = useCallback(() => {
    if (viewportRef.current) setCw(viewportRef.current.clientWidth);
  }, []);

  useEffect(() => {
    measure();
    const ro = new ResizeObserver(measure);
    if (viewportRef.current) ro.observe(viewportRef.current);
    return () => ro.disconnect();
  }, [measure]);

  /* Derived values */
  const perPage    = cw >= 1100 ? 4 : cw >= 700 ? 3 : cw >= 440 ? 2 : 1;
  const cardW      = cw > 0 ? (cw - (perPage - 1) * GAP) / perPage : 260;
  const stride     = cardW + GAP;          // px to move per page
  const totalPages = Math.ceil(products.length / perPage);
  const maxPage    = Math.max(0, totalPages - 1);

  /* Clamp page if viewport shrinks */
  useEffect(() => { setPage(p => Math.min(p, maxPage)); }, [maxPage]);

  function goTo(p: number) { setPage(Math.max(0, Math.min(maxPage, p))); }
  function prev() { goTo(page - 1); }
  function next() { goTo(page + 1); }

  /* Touch swipe */
  const touchX = useRef<number | null>(null);
  function onTouchStart(e: React.TouchEvent) { touchX.current = e.touches[0].clientX; }
  function onTouchEnd(e: React.TouchEvent) {
    if (touchX.current === null) return;
    const dx = touchX.current - e.changedTouches[0].clientX;
    if (Math.abs(dx) > 40) dx > 0 ? next() : prev();
    touchX.current = null;
  }

  const gold = "#C5A059";
  const trackOffset = -(page * perPage * stride);

  return (
    <section id="shop" style={{
      position:"relative", overflow:"hidden",
      padding:"clamp(80px,12vw,160px) clamp(20px,5vw,80px)",
      backgroundImage:"url('/images/shop-bg.webp')",
      backgroundSize:"cover", backgroundPosition:"center top",
    }}>
      <div style={{
        position:"absolute", inset:0,
        background:"linear-gradient(to bottom,rgba(4,4,4,0.93) 0%,rgba(4,4,4,0.88) 60%,rgba(4,4,4,0.96) 100%)",
      }} />

      <style>{`
        .sp-card { text-align:center; cursor:pointer; flex-shrink:0; }
        .sp-img-wrap {
          width:100%; aspect-ratio:1/1; overflow:hidden; background:#1a1a1a;
          margin-bottom:clamp(14px,2.5vw,22px);
        }
        .sp-img {
          width:100%; height:100%; object-fit:cover; display:block;
          filter:grayscale(100%) brightness(0.9);
          transition:filter 0.55s ease, transform 0.55s ease, opacity 0.55s ease;
          opacity:0.88;
        }
        .sp-card:hover .sp-img { filter:grayscale(0%) brightness(1.02); transform:scale(1.05); opacity:1; }
        .sp-tap-hint {
          font-family:Montserrat,sans-serif; font-size:9px; font-weight:400;
          letter-spacing:0.18em; text-transform:uppercase;
          color:rgba(197,160,89,0.5); margin-bottom:10px; transition:color 0.3s;
        }
        .sp-card:hover .sp-tap-hint { color:rgba(197,160,89,0.85); }
        .sp-name {
          font-family:'Playfair Display',serif;
          font-size:clamp(14px,1.5vw,18px); font-weight:700;
          color:#fff; line-height:1.35; margin-bottom:8px;
        }
        .sp-desc {
          font-family:Montserrat,sans-serif; font-size:clamp(10px,1vw,12px);
          font-weight:300; color:#777; line-height:1.6; margin-bottom:10px; padding:0 4px;
          display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden;
        }
        .sp-price {
          font-family:Montserrat,sans-serif;
          font-size:clamp(12px,1.2vw,14px); font-weight:500; letter-spacing:0.1em; color:#C5A059;
        }
        .sp-arrow-btn {
          position:absolute; top:38%; transform:translateY(-50%);
          width:48px; height:48px; border-radius:50%;
          border:1px solid rgba(197,160,89,0.4);
          background:rgba(0,0,0,0.6); color:#C5A059;
          font-size:22px; line-height:1;
          display:flex; align-items:center; justify-content:center;
          cursor:pointer; z-index:10;
          transition:background 0.2s, border-color 0.2s, opacity 0.3s;
        }
        .sp-arrow-btn:hover:not(:disabled) { background:rgba(197,160,89,0.2); border-color:#C5A059; }
        .sp-arrow-btn:disabled { opacity:0.22; pointer-events:none; cursor:default; }
        .sp-cta-btn {
          display:inline-block; padding:14px 52px;
          font-family:Montserrat,sans-serif; font-size:10px; font-weight:400;
          letter-spacing:0.25em; text-transform:uppercase;
          color:rgba(255,255,255,0.75); background:transparent;
          border:1px solid rgba(255,255,255,0.25); cursor:pointer;
          transition:color 0.3s ease, border-color 0.3s ease;
        }
        .sp-cta-btn:hover { color:#C5A059; border-color:#C5A059; }
        @media (max-width:480px) { .sp-cta-btn { width:100%; padding:14px 20px; } }
      `}</style>

      <div style={{ position:"relative", zIndex:1, maxWidth:"1300px", margin:"0 auto" }}>

        {/* Heading */}
        <div ref={headingRef} style={{
          textAlign:"center", marginBottom:"clamp(56px,8vw,96px)",
          opacity:0, animation: headingInView ? "fadeInUp 0.7s ease-out forwards" : "none",
        }}>
          <p style={{ fontFamily:"Montserrat,sans-serif", fontSize:"10px", fontWeight:500,
            letterSpacing:"4px", textTransform:"uppercase", color:gold, marginBottom:"20px" }}>
            SOLO USAMOS LO MEJOR
          </p>
          <h2 style={{ fontFamily:"'Playfair Display',serif",
            fontSize:"clamp(34px,5vw,64px)", fontWeight:400, color:"#fff", lineHeight:1.1, margin:0 }}>
            Productos de Grooming
          </h2>
        </div>

        {/* ── Carousel ── */}
        <div style={{ position:"relative", marginBottom:"clamp(32px,5vw,56px)" }}>

          {/* Prev arrow — only when multiple pages */}
          {totalPages > 1 && (
            <button className="sp-arrow-btn" onClick={prev} disabled={page === 0}
              style={{ left:"-20px" }} aria-label="Anterior">
              ‹
            </button>
          )}

          {/* Viewport — clips the sliding track */}
          <div ref={viewportRef} style={{ overflow:"hidden", width:"100%" }}
            onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>

            {/* Sliding track */}
            <div style={{
              display:"flex",
              gap:`${GAP}px`,
              transform:`translateX(${trackOffset}px)`,
              transition:"transform 0.45s cubic-bezier(0.25,0.46,0.45,0.94)",
              willChange:"transform",
            }}>
              {products.map((p) => {
                const pIdx = cardPhotoIdx[p.id] ?? 0;
                const hasMany = p.images.length > 1;

                /* Touch state for per-card swipe (does NOT bubble to main carousel) */
                let cardTouchX: number | null = null;

                return (
                  <div key={p.id} className="sp-card"
                    style={{ width:`${cardW}px` }}
                    onClick={() => setActiveProduct(p)}>
                    <div className="sp-img-wrap" style={{ position:"relative" }}
                      onTouchStart={e => { cardTouchX = e.touches[0].clientX; }}
                      onTouchEnd={e => {
                        if (cardTouchX === null || !hasMany) return;
                        const dx = cardTouchX - e.changedTouches[0].clientX;
                        if (Math.abs(dx) > 30) {
                          e.stopPropagation(); // don't scroll main carousel
                          setCardPhotoIdx(prev => ({
                            ...prev,
                            [p.id]: dx > 0
                              ? Math.min(p.images.length - 1, (prev[p.id] ?? 0) + 1)
                              : Math.max(0, (prev[p.id] ?? 0) - 1),
                          }));
                        }
                        cardTouchX = null;
                      }}>
                      <img src={p.images[pIdx]} alt={p.name} className="sp-img" loading="lazy" />
                      {/* Mini photo-strip dots */}
                      {hasMany && (
                        <div style={{ position:"absolute", bottom:"8px", left:"50%", transform:"translateX(-50%)", display:"flex", gap:"4px", zIndex:2 }}
                          onClick={e => e.stopPropagation()}>
                          {p.images.map((_, i) => (
                            <button key={i}
                              onClick={e => { e.stopPropagation(); setCardPhotoIdx(prev => ({ ...prev, [p.id]: i })); }}
                              style={{ width: i === pIdx ? "16px" : "5px", height:"5px", borderRadius:"3px", padding:0, border:"none", cursor:"pointer", background: i === pIdx ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.4)", transition:"all 0.25s" }} />
                          ))}
                        </div>
                      )}
                    </div>
                    <p className="sp-tap-hint">{p.stock_quantity === 0 ? "Sin stock" : "Ver detalle"}</p>
                    <h3 className="sp-name">{p.name}</h3>
                    {p.description && <p className="sp-desc">{p.description}</p>}
                    <p className="sp-price">${typeof p.price === "number" ? p.price.toFixed(2) : p.price}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Next arrow — only when multiple pages */}
          {totalPages > 1 && (
            <button className="sp-arrow-btn" onClick={next} disabled={page >= maxPage}
              style={{ right:"-20px" }} aria-label="Siguiente">
              ›
            </button>
          )}
        </div>

        {/* Dot indicators */}
        {totalPages > 1 && (
          <div style={{ display:"flex", justifyContent:"center", gap:"8px", marginBottom:"clamp(40px,7vw,72px)" }}>
            {Array.from({ length: totalPages }).map((_, i) => (
              <button key={i} onClick={() => goTo(i)}
                style={{
                  width: i === page ? "24px" : "6px", height:"6px",
                  borderRadius:"3px", padding:0, border:"none", cursor:"pointer",
                  background: i === page ? gold : "rgba(255,255,255,0.25)",
                  transition:"all 0.3s ease",
                }}
                aria-label={`Página ${i + 1}`}
              />
            ))}
          </div>
        )}

        {/* Ghost CTA */}
        <div style={{ textAlign:"center" }}>
          <a href="#shop" className="sp-cta-btn">
            Ver Todos Los Productos
          </a>
        </div>
      </div>

      {activeProduct && (
        <ProductModal product={activeProduct} onClose={() => setActiveProduct(null)} />
      )}
    </section>
  );
}
