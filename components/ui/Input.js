import { cn } from "@/lib/utils";

export const Input = ({ className, label, error, ...props }) => {
  return (
    <div className="flex flex-col gap-2 w-full">
      {label && <label className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1">{label}</label>}
      <div className="relative">
        <input
          className={cn(
            "flex w-full bg-slate-100 border-2 border-transparent px-4 py-3.5 text-sm font-semibold rounded-2xl transition-all duration-300 placeholder:text-slate-400 focus:bg-white focus:border-primary/30 focus:ring-8 focus:ring-primary/5 outline-none disabled:opacity-50",
            error && "border-rose-500/50 bg-rose-50/50 focus:ring-rose-500/5",
            className
          )}
          {...props}
        />
      </div>
      {error && <span className="text-xs font-bold text-rose-500 pl-1">{error}</span>}
    </div>
  );
};

export const Select = ({ className, label, error, options = [], ...props }) => {
  return (
    <div className="flex flex-col gap-2 w-full">
      {label && <label className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1">{label}</label>}
      <div className="relative group">
        <select
          className={cn(
            "flex w-full bg-slate-100 border-2 border-transparent px-4 py-3.5 text-sm font-semibold rounded-2xl transition-all duration-300 focus:bg-white focus:border-primary/30 focus:ring-8 focus:ring-primary/5 outline-none appearance-none cursor-pointer",
            className
          )}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 group-focus-within:text-primary transition-colors">
           <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7" /></svg>
        </div>
      </div>
      {error && <span className="text-xs font-bold text-rose-500 pl-1">{error}</span>}
    </div>
  );
};
