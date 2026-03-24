import React from "react";

interface SectionProps {
  children: React.ReactNode;
  className?: string;
  id?: string;
  variant?: "default" | "primary" | "secondary" | "gradient";
  padding?: "none" | "sm" | "md" | "lg" | "xl";
}

export const Section: React.FC<SectionProps> = ({
  children,
  className = "",
  id,
  variant = "default",
  padding = "lg",
}) => {
  const variantClasses = {
    default: "bg-white",
    primary: "bg-sookmyung-blue-50",
    secondary: "bg-sookmyung-snow-50",
    gradient: "bg-gradient-to-br from-sookmyung-blue-600 to-blue-800 text-white",
  };

  const paddingClasses = {
    none: "py-0",
    sm: "py-8",
    md: "py-12",
    lg: "py-16",
    xl: "py-24",
  };

  return (
    <section
      id={id}
      className={`${variantClasses[variant]} ${paddingClasses[padding]} ${className}`}
    >
      {children}
    </section>
  );
};
