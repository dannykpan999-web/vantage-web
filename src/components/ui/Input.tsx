import React, { useState } from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> { label?: string; error?: string; showToggle?: boolean; }

function EyeOpen() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  );
}

function EyeOff() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
      <line x1="1" y1="1" x2="23" y2="23"/>
    </svg>
  );
}

export default function Input({ label, error, showToggle, type, style, ...props }: InputProps) {
  const [focused, setFocused] = useState(false);
  const [show, setShow] = useState(false);
  const isPassword = showToggle && type === "password";
  return (
    <div style={{ marginBottom: "24px", position: "relative" }}>
      {label && (
        <label style={{
          display: "block", fontFamily: "'Montserrat',sans-serif",
          fontSize: "10px", fontWeight: 500, letterSpacing: "0.14em",
          textTransform: "uppercase", color: focused ? "#000" : "#757575",
          marginBottom: "6px", transition: "color 0.3s ease-in-out",
        }}>{label}</label>
      )}
      <div style={{ position: "relative" }}>
        <input
          type={isPassword ? (show ? "text" : "password") : type}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{
            width: "100%", padding: "12px 0",
            paddingRight: isPassword ? "36px" : "0",
            background: "transparent", border: "none",
            borderBottom: `1px solid ${focused ? "#000" : "#e5e5e5"}`,
            borderRadius: 0, outline: "none",
            fontFamily: "'Montserrat',sans-serif", fontWeight: 300,
            fontSize: "14px", color: "#000",
            transition: "border-color 0.3s ease-in-out",
            boxSizing: "border-box",
            ...style,
          }}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShow(s => !s)}
            tabIndex={-1}
            aria-label={show ? "Ocultar contraseña" : "Mostrar contraseña"}
            style={{
              position: "absolute", right: 0, top: "50%",
              transform: "translateY(-50%)",
              background: "none", border: "none", cursor: "pointer",
              color: focused ? "#000" : "#9e9e9e",
              padding: "4px", display: "flex", alignItems: "center",
              transition: "color 0.2s ease",
            }}
          >
            {show ? <EyeOff /> : <EyeOpen />}
          </button>
        )}
      </div>
      {error && (
        <p style={{ fontFamily: "'Montserrat',sans-serif", fontSize: "11px", color: "#c00", marginTop: "4px" }}>
          {error}
        </p>
      )}
    </div>
  );
}
