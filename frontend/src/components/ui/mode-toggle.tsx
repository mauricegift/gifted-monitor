import { useState, useRef, useEffect } from "react";
import { useTheme } from "@/hooks";
import { Sun, Moon, Monitor, Check } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import type { ThemeMode } from "@/store";

const options: { value: ThemeMode; label: string; icon: React.ElementType }[] = [
  { value: "light",  label: "Light",  icon: Sun     },
  { value: "dark",   label: "Dark",   icon: Moon    },
  { value: "system", label: "System", icon: Monitor },
];

export default function ModeToggle() {
  const { theme, resolvedTheme, setTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const Icon = resolvedTheme === "dark" ? Moon : Sun;

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(o => !o)}
        className="text-main h-10 w-10 center rounded-full hover:bg-foreground transition-colors"
        title="Change theme"
      >
        <Icon size={18} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.95 }}
            transition={{ duration: 0.12 }}
            className="absolute right-0 top-full mt-1.5 w-36 bg-background border border-line rounded-xl shadow-lg z-50 py-1 overflow-hidden"
          >
            {options.map(({ value, label, icon: OptionIcon }) => (
              <button
                key={value}
                onClick={() => { setTheme(value); setOpen(false); }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-sm transition-colors hover:bg-foreground text-main"
                style={{ justifyContent: "flex-start" }}
              >
                <OptionIcon size={14} className="shrink-0 text-muted" />
                <span className="flex-1 text-left">{label}</span>
                {theme === value && <Check size={13} className="text-emerald-500 shrink-0" />}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
