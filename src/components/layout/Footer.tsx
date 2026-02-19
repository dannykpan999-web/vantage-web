export default function Footer() {
  return (
    <footer style={{ borderTop:"1px solid #e5e5e5", padding:"48px clamp(24px,8vw,120px)", background:"#fff" }}>
      <div style={{ maxWidth:"1400px", margin:"0 auto", display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:"24px" }}>
        <span style={{ fontFamily:"'Playfair Display',serif", fontSize:"18px", fontWeight:400, letterSpacing:"0.06em" }}>VANTAGE</span>
        <div style={{ display:"flex", gap:"32px", flexWrap:"wrap" }}>
          {[["Servicios","#servicios"],["Equipo","#equipo"],["Galería","#galería"],["Reservar","/booking"],["Privacidad","#"]].map(([label,href])=>(
            <a key={label} href={href} style={{ fontFamily:"'Montserrat',sans-serif", fontSize:"10px", fontWeight:400, letterSpacing:"0.14em", textTransform:"uppercase", color:"#757575", transition:"color 0.3s ease-in-out" }} onMouseEnter={e=>(e.currentTarget.style.color="#000")} onMouseLeave={e=>(e.currentTarget.style.color="#757575")}>{label}</a>
          ))}
        </div>
        <p style={{ fontFamily:"'Montserrat',sans-serif", fontSize:"10px", fontWeight:300, color:"#757575" }}>© {new Date().getFullYear()} Vantage. Todos los derechos reservados.</p>
      </div>
    </footer>
  );
}
