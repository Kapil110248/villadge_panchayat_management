import { cn } from "@/lib/utils";

export const Card = ({ className, children, ...props }) => {
  return (
    <div
      className={cn("premium-card rounded-[2rem] overflow-hidden", className)}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardHeader = ({ className, title, subtitle, children, ...props }) => {
  return (
    <div className={cn("px-8 py-8 border-b border-slate-50", className)} {...props}>
      {title && <h3 className="text-xl font-black text-slate-900 tracking-tight">{title}</h3>}
      {subtitle && <p className="text-sm font-medium text-slate-400 mt-1">{subtitle}</p>}
      {children}
    </div>
  );
};

export const CardContent = ({ className, children, ...props }) => {
  return (
    <div className={cn("p-8", className)} {...props}>
      {children}
    </div>
  );
};

export const CardFooter = ({ className, children, ...props }) => {
  return (
    <div className={cn("px-8 py-6 border-t border-slate-50 bg-slate-50/50 flex items-center", className)} {...props}>
      {children}
    </div>
  );
};
