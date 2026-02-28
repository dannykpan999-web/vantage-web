export default function Spinner({
  size = 28,
  theme = "dark",
  label,
}: {
  size?: number;
  theme?: "dark" | "light";
  label?: string;
}) {
  const trackColor  = theme === "dark" ? "#e5e5e5" : "rgba(255,255,255,0.2)";
  const activeColor = theme === "dark" ? "#111"    : "#fff";

  return (
    <>
      <style>{`
        @keyframes vantage-spin { to { transform: rotate(360deg); } }
        .vantage-spinner {
          border-radius: 50%;
          animation: vantage-spin 0.75s linear infinite;
          flex-shrink: 0;
          display: inline-block;
        }
      `}</style>
      <div style={{ display: "inline-flex", alignItems: "center", gap: "10px" }}>
        <span
          className="vantage-spinner"
          style={{
            width:  size,
            height: size,
            border: `1.5px solid ${trackColor}`,
            borderTopColor: activeColor,
          }}
        />
        {label && (
          <span style={{
            fontFamily: "Montserrat, sans-serif",
            fontWeight: 300,
            fontSize: "0.7rem",
            letterSpacing: "0.15em",
            textTransform: "uppercase",
            color: activeColor,
          }}>
            {label}
          </span>
        )}
      </div>
    </>
  );
}
