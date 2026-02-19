import React, { useState } from "react";
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> { label?:string; error?:string; showToggle?:boolean; }
export default function Input({ label, error, showToggle, type, style, ...props }: InputProps) {
  const [focused, setFocused] = useState(false);
  const [show, setShow] = useState(false);
  return (
    <div style={{ marginBottom:"24px", position:"relative" }}>
      {label && <label style={{ display:"block", fontFamily:"'Montserrat',sans-serif", fontSize:"10px", fontWeight:500, letterSpacing:"0.14em", textTransform:"uppercase", color:focused?"#000":"#757575", marginBottom:"6px", transition:"color 0.3s ease-in-out" }}>{label}</label>}
      <div style={{ position:"relative" }}>
        <input type={showToggle?(show?"text":"password"):type} onFocus={()=>setFocused(true)} onBlur={()=>setFocused(false)}
          style={{ width:"100%", padding:"12px 0", paddingRight:showToggle?"32px":"0", background:"transparent", border:"none", borderBottom:`1px solid ${focused?"#000":"#e5e5e5"}`, borderRadius:0, outline:"none", fontFamily:"'Montserrat',sans-serif", fontWeight:300, fontSize:"14px", color:"#000", transition:"border-color 0.3s ease-in-out", ...style }} {...props} />
        {showToggle && <button type="button" onClick={()=>setShow(!show)} style={{ position:"absolute", right:0, top:"50%", transform:"translateY(-50%)", background:"none", border:"none", cursor:"pointer", color:"#757575", fontSize:"16px", padding:"4px" }}>{show?"○":"●"}</button>}
      </div>
      {error && <p style={{ fontFamily:"'Montserrat',sans-serif", fontSize:"11px", color:"#757575", marginTop:"4px" }}>{error}</p>}
    </div>
  );
}
