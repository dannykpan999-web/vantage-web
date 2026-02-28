import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getBarbers } from "../services/barbers";
import { getPublicGallery, SERVICE_TYPES, type GalleryPhoto } from "../services/gallery";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import Spinner from "../components/ui/Spinner";

export default function BarberPortfolioPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: barbers, isLoading: barbersLoading } = useQuery({
    queryKey: ["barbers"],
    queryFn: getBarbers,
    staleTime: 1000 * 60 * 5,
  });

  const { data: allPhotos, isLoading: photosLoading } = useQuery({
    queryKey: ["public-gallery"],
    queryFn: getPublicGallery,
    staleTime: 1000 * 60 * 2,
  });

  const barber = barbers?.find(b => b.id === id);
  const photos: GalleryPhoto[] = (allPhotos ?? []).filter(
    (p: GalleryPhoto) => p.barber_id === id
  );

  const isLoading = barbersLoading || photosLoading;

  // Redirect if barber not found and we've finished loading
  if (!isLoading && barbers && !barber) {
    navigate("/", { replace: true });
    return null;
  }

  const avatarSrc = barber?.avatar
    ? `https://vantagestudioapp.com${barber.avatar}`
    : null;

  return (
    <>
      <Header />
      <main style={{ minHeight: "100vh", background: "#050505" }}>

        {/* Hero section */}
        <div style={{
          paddingTop: "clamp(96px,14vw,160px)",
          paddingBottom: "clamp(48px,6vw,80px)",
          paddingLeft: "clamp(24px,6vw,80px)",
          paddingRight: "clamp(24px,6vw,80px)",
          maxWidth: "1100px",
          margin: "0 auto",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
        }}>

          {isLoading ? (
            <div style={{ padding: "4rem 0" }}>
              <Spinner size={32} theme="light" label="Cargando portafolio…" />
            </div>
          ) : barber ? (
            <>
              {/* Avatar */}
              <div style={{
                width: "clamp(100px,18vw,150px)",
                height: "clamp(100px,18vw,150px)",
                borderRadius: "50%",
                overflow: "hidden",
                background: "#1a1a1a",
                border: "2px solid rgba(255,255,255,0.12)",
                marginBottom: "1.75rem",
                flexShrink: 0,
              }}>
                {avatarSrc ? (
                  <img
                    src={avatarSrc}
                    alt={barber.name}
                    style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                    onError={e => { (e.target as HTMLImageElement).style.display = "none"; }}
                  />
                ) : (
                  <div style={{
                    width: "100%", height: "100%",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontFamily: "'Playfair Display',serif",
                    fontSize: "clamp(2rem,6vw,3.5rem)", fontWeight: 700, color: "rgba(255,255,255,0.2)",
                  }}>
                    {barber.name[0].toUpperCase()}
                  </div>
                )}
              </div>

              {/* Specialty label */}
              <p style={{
                fontFamily: "Montserrat,sans-serif", fontWeight: 300,
                fontSize: "0.65rem", letterSpacing: "0.25em", textTransform: "uppercase",
                color: "rgba(255,255,255,0.4)", marginBottom: "0.6rem",
              }}>
                {barber.specialty || "Barbero"}
              </p>

              {/* Name */}
              <h1 style={{
                fontFamily: "'Playfair Display',serif",
                fontSize: "clamp(2rem,5vw,3.2rem)", fontWeight: 700,
                color: "#fff", lineHeight: 1.15, marginBottom: "2rem",
              }}>
                {barber.name}
              </h1>

              {/* CTA */}
              <button
                onClick={() => navigate(`/booking?barber=${barber.id}`)}
                style={{
                  fontFamily: "Montserrat,sans-serif", fontWeight: 400,
                  fontSize: "0.72rem", letterSpacing: "0.22em", textTransform: "uppercase",
                  background: "#fff", color: "#000", border: "none",
                  padding: "1rem 3rem", cursor: "pointer",
                  transition: "opacity 0.2s",
                }}
                onMouseOver={e => { e.currentTarget.style.opacity = "0.85"; }}
                onMouseOut={e => { e.currentTarget.style.opacity = "1"; }}
              >
                Reservar con {barber.name.split(" ")[0]}
              </button>
            </>
          ) : null}
        </div>

        {/* Divider */}
        <div style={{ height: "1px", background: "rgba(255,255,255,0.07)", maxWidth: "1100px", margin: "0 auto clamp(40px,6vw,72px)" }} />

        {/* Portfolio grid */}
        <div style={{
          maxWidth: "1100px",
          margin: "0 auto",
          paddingLeft: "clamp(16px,4vw,60px)",
          paddingRight: "clamp(16px,4vw,60px)",
          paddingBottom: "clamp(60px,8vw,120px)",
        }}>

          {!isLoading && photos.length === 0 && (
            <p style={{
              fontFamily: "Montserrat,sans-serif", fontSize: "0.75rem", fontWeight: 300,
              letterSpacing: "0.15em", color: "rgba(255,255,255,0.25)",
              textAlign: "center", padding: "3rem 0",
            }}>
              Portafolio próximamente
            </p>
          )}

          {photos.length > 0 && (
            <>
              <p style={{
                fontFamily: "Montserrat,sans-serif", fontWeight: 300,
                fontSize: "0.65rem", letterSpacing: "0.25em", textTransform: "uppercase",
                color: "rgba(255,255,255,0.35)", marginBottom: "2rem", textAlign: "center",
              }}>
                Trabajos recientes · {photos.length} {photos.length === 1 ? "foto" : "fotos"}
              </p>

              <div style={{
                columns: "2 260px",
                columnGap: "0.75rem",
              }}>
                {photos.map((photo, i) => (
                  <div key={photo.id} style={{
                    breakInside: "avoid",
                    marginBottom: "0.75rem",
                    position: "relative",
                    overflow: "hidden",
                    cursor: "pointer",
                  }}
                    onClick={() => navigate(`/booking?barber=${id}`)}
                  >
                    <img
                      src={`https://vantagestudioapp.com${photo.url}`}
                      alt={SERVICE_TYPES.find(s => s.value === photo.service_type)?.label || photo.service_type}
                      loading="lazy"
                      style={{
                        width: "100%",
                        display: "block",
                        aspectRatio: i % 3 === 0 ? "4/5" : i % 3 === 1 ? "1/1" : "4/3",
                        objectFit: "cover",
                        filter: "brightness(0.88)",
                        transition: "filter 0.3s ease, transform 0.4s ease",
                      }}
                      onMouseOver={e => {
                        (e.currentTarget as HTMLImageElement).style.filter = "brightness(1)";
                        (e.currentTarget as HTMLImageElement).style.transform = "scale(1.03)";
                      }}
                      onMouseOut={e => {
                        (e.currentTarget as HTMLImageElement).style.filter = "brightness(0.88)";
                        (e.currentTarget as HTMLImageElement).style.transform = "scale(1)";
                      }}
                    />
                    {/* Service type label */}
                    <div style={{
                      position: "absolute", bottom: "8px", left: "8px",
                      background: "rgba(0,0,0,0.65)",
                      fontFamily: "Montserrat,sans-serif", fontSize: "8px",
                      fontWeight: 500, letterSpacing: "0.15em", textTransform: "uppercase",
                      color: "rgba(255,255,255,0.75)", padding: "3px 8px",
                    }}>
                      {SERVICE_TYPES.find(s => s.value === photo.service_type)?.label || photo.service_type}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

      </main>
      <Footer />
    </>
  );
}
