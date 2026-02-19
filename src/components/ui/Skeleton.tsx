import React from "react";
interface SkeletonProps { width?:string|number; height?:string|number; borderRadius?:string|number; style?:React.CSSProperties; }
export default function Skeleton({ width="100%", height=20, borderRadius=2, style }:SkeletonProps) {
  return <div className="skeleton" style={{ width, height, borderRadius, ...style }} />;
}
export function SkeletonCard() {
  return (
    <div style={{ padding:"32px", border:"1px solid #e5e5e5" }}>
      <Skeleton height={24} width="60%" style={{ marginBottom:16 }} />
      <Skeleton height={16} style={{ marginBottom:8 }} />
      <Skeleton height={16} width="80%" style={{ marginBottom:24 }} />
      <Skeleton height={44} width={140} />
    </div>
  );
}
