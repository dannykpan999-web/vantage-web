import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const { isAuthenticated, user, logout } = useAuthStore();
  const navigate = useNavigate();
  useEffect(() => { const h=()=>setScrolled(window.scrollY>40); window.addEventListener("scroll",h,{passive:true}); return ()=>window.removeEventListener("scroll",h); }, []);
  const handleLogout = () => { logout(); navigate("/"); };
  const dashPath = user?.role==="owner"?"/dashboard/owner":user?.role==="barber"?"/dashboard/barber":"/booking";
  const c = (scrolled:boolean) => scrolled?"#000":"#fff";
  return (
    <header style={{ position:"fixed", top:0, left:0, right:0, zIndex:100, background:scrolled?"rgba(255,255,255,0.94)":"transparent", backdropFilter:scrolled?"blur(12px)":"none", borderBottom:scrolled?"1px solid #e5e5e5":"none", transition:"all 0.4s ease-in-out", padding:"0 clamp(24px,6vw,80px)" }}>
      <nav style={{ maxWidth:"1400px", margin:"0 auto", display:"flex", alignItems:"center", justifyContent:"space-between", height:"72px" }}>
        <Link to="/" style={{ fontFamily:"'Playfair Display',serif", fontSize:"22px", fontWeight:400, color:c(scrolled), letterSpacing:"0.06em", transition:"color 0.4s ease-in-out", textShadow:scrolled?"none":"0 1px 8px rgba(0,0,0,0.3)" }}>VANTAGE</Link>
        <div style={{ display:"flex", alignItems:"center", gap:"36px" }}>
          {["Servicios","Equipo","Galería"].map(item=>(
            <a key={item} href={`#${item.toLowerCase()}`} style={{ fontFamily:"'Montserrat',sans-serif", fontSize:"11px", fontWeight:400, letterSpacing:"0.12em", textTransform:"uppercase", color:c(scrolled), transition:"opacity 0.3s ease-in-out", textShadow:scrolled?"none":"0 1px 6px rgba(0,0,0,0.3)" }} onMouseEnter={e=>(e.currentTarget.style.opacity="0.6")} onMouseLeave={e=>(e.currentTarget.style.opacity="1")}>{item}</a>
          ))}
          {isAuthenticated ? (
            <>
              <Link to={dashPath} style={{ fontFamily:"'Montserrat',sans-serif", fontSize:"11px", fontWeight:400, letterSpacing:"0.12em", textTransform:"uppercase", color:c(scrolled) }}>Panel</Link>
              <button onClick={handleLogout} style={{ fontFamily:"'Montserrat',sans-serif", fontSize:"11px", fontWeight:500, letterSpacing:"0.12em", textTransform:"uppercase", color:c(scrolled), background:"none", border:"none", cursor:"pointer" }}>Salir</button>
            </>
          ) : (
            <>
              <Link to="/login" style={{ fontFamily:"'Montserrat',sans-serif", fontSize:"11px", fontWeight:400, letterSpacing:"0.12em", textTransform:"uppercase", color:c(scrolled) }}>Iniciar Sesión</Link>
              <Link to="/booking" style={{ background:scrolled?"#000":"rgba(255,255,255,0.95)", color:scrolled?"#fff":"#000", padding:"10px 24px", fontFamily:"'Montserrat',sans-serif", fontSize:"11px", fontWeight:500, letterSpacing:"0.12em", textTransform:"uppercase", borderRadius:"1px", transition:"all 0.3s ease-in-out" }}>Reservar</Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
