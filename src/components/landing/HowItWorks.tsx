const steps = [
  {n:'01',t:'Elige tu Barbero',d:'Explora nuestros especialistas, sus técnicas y disponibilidad en tiempo real.'},
  {n:'02',t:'Selecciona tu Horario',d:'Escoge el día y la hora que mejor se adapte a tu agenda. Sin llamadas, sin esperas.'},
  {n:'03',t:'Paga con Square',d:'Pago seguro en línea. Apple Pay disponible. Confirmación instantánea por correo.'},
];
export default function HowItWorks() {
  return (
    <section style={{padding:'var(--section-pad)',background:'#fafafa',borderTop:'1px solid #e5e5e5'}}>
      <div style={{maxWidth:'1400px',margin:'0 auto'}}>
        <div style={{textAlign:'center',marginBottom:'clamp(56px,8vw,96px)'}}>
          <p style={{fontFamily:"'Montserrat',sans-serif",fontSize:'10px',fontWeight:400,letterSpacing:'0.24em',textTransform:'uppercase',color:'#757575',marginBottom:'16px'}}>El Proceso</p>
          <h2 style={{fontFamily:"'Playfair Display',serif",fontSize:'clamp(32px,5vw,56px)',fontWeight:400,color:'#000'}}>Tres Pasos, <em>Un Estándar</em></h2>
        </div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(240px,1fr))',gap:'clamp(40px,6vw,80px)'}}>
          {steps.map((s,i)=>(
            <div key={i}>
              <div style={{fontFamily:"'Playfair Display',serif",fontSize:'clamp(48px,6vw,72px)',fontWeight:400,color:'#e5e5e5',lineHeight:1,marginBottom:'16px'}}>{s.n}</div>
              <h3 style={{fontFamily:"'Playfair Display',serif",fontSize:'clamp(20px,2.5vw,26px)',fontWeight:400,color:'#000',marginBottom:'14px'}}>{s.t}</h3>
              <p style={{fontFamily:"'Montserrat',sans-serif",fontSize:'13px',fontWeight:300,color:'#757575',lineHeight:1.9}}>{s.d}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
