import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "gold";
  size?: "sm" | "md" | "lg";
  children: React.ReactNode;
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  variant = "primary",
  size = "md",
  children,
  fullWidth = false,
  className = "",
  ...props
}) => {
  const variantClasses = {
    primary:
      "bg-sookmyung-blue-600 hover:bg-sookmyung-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-200",
    secondary:
      "bg-gray-700 hover:bg-gray-800 text-white shadow-lg hover:shadow-xl transition-all duration-200",
    outline:
      "border-2 border-sookmyung-blue-600 text-sookmyung-blue-600 hover:bg-sookmyung-blue-600 hover:text-white transition-all duration-200",
    ghost: "text-sookmyung-blue-600 hover:bg-sookmyung-blue-50 hover:text-sookmyung-blue-700 transition-all duration-200",
    gold:
      "bg-[#C5A059] hover:bg-[#B89042] text-white shadow-lg hover:shadow-xl transition-all duration-200",
  };

  const sizeClasses = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-6 py-2.5 text-base",
    lg: "px-8 py-3 text-lg",
  };

  const widthClass = fullWidth ? "w-full" : "";

  return (
    <button
      className={`${variantClasses[variant]} ${sizeClasses[size]} ${widthClass} rounded-lg font-medium focus:outline-none focus:ring-2 focus:ring-sookmyung-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
