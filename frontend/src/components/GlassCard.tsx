import React from "react";

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  /** Adds hover lift + teal border glow effect */
  hover?: boolean;
  /** Adds animated shimmer line at the top */
  shimmer?: boolean;
  as?: React.ElementType;
  style?: React.CSSProperties;
}

export function GlassCard({
  children,
  className = "",
  hover = false,
  shimmer = false,
  as: Tag = "div",
  style,
}: GlassCardProps) {
  return (
    <Tag
      className={[
        "glass-card rounded-3xl",
        hover ? "glass-card-hover" : "",
        shimmer ? "panel-shimmer" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      style={style}
    >
      {children}
    </Tag>
  );
}
