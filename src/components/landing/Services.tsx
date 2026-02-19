import { useNavigate } from "react-router-dom";
const svcs=[{n:"Corte Clasico",d:"Precision artesanal con tecnicas tradicionales y tijeras de precision.",p:"$45",t:"45 min"},{n:"Afeitado con Navaja",d:"La experiencia definitiva del afeitado. Toalla caliente y aceites premium.",p:"$65",t:"60 min"},{n:"Experiencia Completa",d:"Corte, barba y tratamiento facial. El lujo absoluto en un solo servicio.",p:"$95",t:"90 min"}];
export default function Services(){
  const nav=useNavigate();
  return(<section id="servicios" style={{padding:"var(--section-pad)",background:"#fff"}}><div style={{maxWidth:"1400px",margin:"0 auto"}}>
    <div style={{marginBottom:"clamp(48px,7vw,80px)"}}><p style={{fontFamily:"Montserrat,sans-serif",fontSize:"10px",letterSpacing:"0.24em",textTransform:"uppercase",color:"#757575",marginBottom:"16px"}}>Nuestros Servicios</p>
    <h2 style={{fontFamily:"Playfair Display,serif",fontSize:"clamp(32px,5vw,56px)",fontWeight:400,color:"#000"}}>Arte en Cada<br/><em>Detalle</em></h2></div>
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))",gap:"1px",background:"#e5e5e5",border:"1px solid #e5e5e5"}}>
    {svcs.map((s,i)=>(<div key={i} style={{background:"#fff",padding:"clamp(32px,4vw,56px)"}} onMouseEnter={e=>(e.currentTarget.style.background="#f8f8f8")} onMouseLeave={e=>(e.currentTarget.style.background="#fff")}>
      <div style={{fontSize:"10px",letterSpacing:"0.2em",textTransform:"uppercase",color:"#757575",marginBottom:"20px"}}>{String(i+1).padStart(2,"0")}</div>
      <h3 style={{fontFamily:"Playfair Display,serif",fontSize:"clamp(20px,2.5vw,28px)",fontWeight:400,color:"#000",marginBottom:"16px"}}>{s.n}</h3>
      <p style={{fontSize:"13px",fontWeight:300,color:"#757575",lineHeight:1.9,marginBottom:"32px"}}>{s.d}</p>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"28px"}}><span style={{fontFamily:"Playfair Display,serif",fontSize:"28px",fontWeight:400}}>{s.p}</span><span style={{fontSize:"11px",fontWeight:300,color:"#757575"}}>{s.t}</span></div>
      <button onClick={()=>nav("/booking")} style={{width:"100%",padding:"14px",background:"#000",color:"#fff",fontSize:"11px",fontWeight:500,letterSpacing:"0.18em",textTransform:"uppercase",border:"none",borderRadius:"1px",cursor:"pointer"}}>Reservar</button>
    </div>))}</div></div></section>);
}
