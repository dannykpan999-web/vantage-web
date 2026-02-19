export default function SocialProof() {
  const stats:[string,string][] = [['500+','Citas Reservadas'],['4.9\u2605','Calificación'],['12+','Barberos'],['3','Sucursales']];
  return (
    <section style={{borderTop:'1px solid #e5e5e5',borderBottom:'1px solid #e5e5e5',padding:'32px clamp(24px,8vw,120px)'}}>
      <div style={{maxWidth:'1400px',margin:'0 auto',display:'flex',alignItems:'center',justifyContent:'space-around',flexWrap:'wrap',gap:'32px'}}>
        {stats.map(([v,l],i)=>(
          <div key={i} style={{textAlign:'center'}}>
            <div style={{fontFamily:"'Playfair Display',serif",fontSize:'clamp(22px,3vw,34px)',fontWeight:400,color:'#000',lineHeight:1,marginBottom:'6px'}}>{v}</div>
            <div style={{fontFamily:"'Montserrat',sans-serif",fontSize:'10px',fontWeight:400,letterSpacing:'0.16em',textTransform:'uppercase',color:'#757575'}}>{l}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
