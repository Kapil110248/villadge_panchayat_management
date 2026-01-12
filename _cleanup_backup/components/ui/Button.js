import { cn } from "@/lib/utils";

export const Button = ({ className, variant = "primary", size = "md", ...props }) => {
  const variants = {
    primary: "bg-slate-900 text-white hover:bg-slate-800 shadow-xl shadow-slate-200",
    emerald: "bg-emerald-600 text-white hover:bg-emerald-700 shadow-xl shadow-emerald-200",
    secondary: "bg-white text-slate-900 border border-slate-200 hover:bg-slate-50 shadow-sm",
    outline: "border-2 border-slate-200 bg-transparent text-slate-600 hover:border-primary hover:text-primary hover:bg-primary/5",
    ghost: "bg-transparent text-slate-500 hover:bg-slate-100 font-bold",
    danger: "bg-rose-500 text-white hover:bg-rose-600 shadow-xl shadow-rose-200",
  };

  const sizes = {
    sm: "h-9 px-4 text-xs font-bold rounded-xl",
    md: "h-12 px-6 py-2.5 font-bold rounded-[1.25rem]",
    lg: "h-14 px-10 text-lg font-black rounded-2xl",
  };

  return (
    <button
      className={cn(
        "inline-flex items-center justify-center transition-all duration-300 active:scale-[0.97] cursor-pointer disabled:opacity-50 disabled:pointer-events-none tracking-tight",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    />
  );
};
