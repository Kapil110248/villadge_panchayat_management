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

export const CardHeader = ({ className, title, subtitle, titleClassName, subtitleClassName, action, children, ...props }) => {
  return (
    <div className={cn("px-8 py-8 border-b border-slate-50", className)} {...props}>
      {action ? (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            {title && <h3 className={cn("text-xl font-black text-slate-900 tracking-tight", titleClassName)}>{title}</h3>}
            {subtitle && <p className={cn("text-sm font-medium text-slate-400 mt-1", subtitleClassName)}>{subtitle}</p>}
          </div>
          <div>{action}</div>
        </div>
      ) : (
        <>
          {title && <h3 className={cn("text-xl font-black text-slate-900 tracking-tight", titleClassName)}>{title}</h3>}
          {subtitle && <p className={cn("text-sm font-medium text-slate-400 mt-1", subtitleClassName)}>{subtitle}</p>}
        </>
      )}
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
