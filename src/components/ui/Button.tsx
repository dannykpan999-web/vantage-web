import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  fullWidth?: boolean;
}

export default function Button({
  children,
  variant = "primary",
  size = "md",
  loading = false,
  fullWidth = false,
  disabled,
  style,
  ...props
}: ButtonProps) {
  const base: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    fontFamily: "'Montserrat', sans-serif",
    fontWeight: 500,
    letterSpacing: "0.12em",
    textTransform: "uppercase",
    transition: "opacity 0.3s ease-in-out, background 0.3s ease-in-out",
    cursor: loading || disabled ? "not-allowed" : "pointer",
    opacity: loading || disabled ? 0.6 : 1,
    border: "none",
    borderRadius: "2px",
    width: fullWidth ? "100%" : "auto",
    whiteSpace: "nowrap",
  };

  const sizes: Record<string, React.CSSProperties> = {
    sm: { padding: "10px 24px", fontSize: "11px" },
    md: { padding: "14px 36px", fontSize: "12px" },
    lg: { padding: "18px 48px", fontSize: "13px" },
  };

  const variants: Record<string, React.CSSProperties> = {
    primary: { background: "#000", color: "#fff" },
    outline: { background: "transparent", color: "#000", border: "1px solid #000" },
    ghost: { background: "transparent", color: "#000" },
  };

  return (
    <button
      style={{ ...base, ...sizes[size], ...variants[variant], ...style }}
      disabled={loading || disabled}
      {...props}
    >
      {loading ? (
        <span style={{ display: "inline-block", width: 14, height: 14, border: "1.5px solid currentColor", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
      ) : null}
      {children}
    </button>
  );
}
