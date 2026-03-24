import React from "react";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "elevated" | "outlined" | "gradient";
  hover?: boolean;
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = "",
  variant = "default",
  hover = false,
  onClick,
}) => {
  const variantClasses = {
    default: "bg-white border border-gray-200",
    elevated: "bg-white shadow-soft",
    outlined: "bg-white border-2 border-sookmyung-blue-200",
    gradient:
      "bg-gradient-to-br from-sookmyung-blue-50 to-sookmyung-snow-50 border border-sookmyung-blue-100",
  };

  const hoverClasses = hover
    ? "hover:shadow-lg hover:scale-105 transition-all duration-300 cursor-pointer"
    : "";

  return (
    <div
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      className={`${variantClasses[variant]} ${hoverClasses} rounded-xl p-4 sm:p-6 ${className}`}
      onClick={onClick}
      onKeyUp={onClick ? (e) => e.key === "Enter" && onClick() : undefined}
    >
      {children}
    </div>
  );
};
