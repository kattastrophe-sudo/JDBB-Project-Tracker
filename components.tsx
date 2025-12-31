import React from 'react';
import { COLORS } from './config';

export const Button = ({ children, onClick, variant = 'primary', className = '', fullWidth = false, disabled = false, type = 'button' }: any) => {
  const baseStyle = "px-4 py-2 rounded-md font-medium transition-colors duration-200 flex items-center justify-center gap-2 shadow-sm text-sm";
  const styles: any = {
    primary: { backgroundColor: COLORS.emerald, color: 'white' },
    secondary: { backgroundColor: COLORS.dustyGrape, color: 'white' },
    outline: { border: `2px solid ${COLORS.pacificCyan}`, color: COLORS.pacificCyan, backgroundColor: 'transparent' },
    danger: { backgroundColor: COLORS.vintageGrape, color: 'white' },
    ghost: { backgroundColor: 'transparent', boxShadow: 'none' } 
  };
  return (
    <button type={type} onClick={onClick} disabled={disabled} className={`${baseStyle} ${fullWidth ? "w-full" : ""} ${disabled ? "opacity-50 cursor-not-allowed" : "hover:opacity-90 active:scale-95"} ${className} ${variant === 'ghost' ? 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800' : ''}`} style={styles[variant]}>
      {children}
    </button>
  );
};
