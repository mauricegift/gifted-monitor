import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { ModeToggle } from "@/components/ui";
import { useAuthStore } from "@/store";
import clsx from "clsx";

const navLinks = [
  { label: "Home", to: "/" },
  { label: "Features", to: "/#features" },
  { label: "How It Works", to: "/#how-it-works" },
  { label: "API Docs", to: "/api-docs" },
  { label: "About", to: "/about" },
  { label: "Contact", to: "/contact" },
];

interface PublicLayoutProps {
  children: React.ReactNode;
}

export default function PublicLayout({ children }: PublicLayoutProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { token } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();

  // Close drawer on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  const handleNavClick = (to: string) => {
    setMobileOpen(false);
    if (to.includes("#")) {
      const [path, hash] = to.split("#");
      if (location.pathname !== (path || "/")) {
        navigate(path || "/");
        setTimeout(() => {
          document.getElementById(hash)?.scrollIntoView({ behavior: "smooth" });
        }, 120);
      } else {
        document.getElementById(hash)?.scrollIntoView({ behavior: "smooth" });
      }
      return true;
    }
    return false;
  };

  const isActive = (to: string) => {
    if (to === "/") return location.pathname === "/" && !location.hash;
    if (to.includes("#")) return false;
    return location.pathname === to;
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Sticky header */}
      <header className="sticky top-0 z-50 bg-background/70 backdrop-blur-md border-b border-line rounded-b-2xl shadow-sm">
        <div className="main flex items-center justify-between h-14">
          <Link to="/" className="flex items-center gap-2 font-bold text-base font-outfit">
            <img
              src="https://files.giftedtech.co.ke/image/u2wvoimage.jpg"
              alt="Gifted Monitor"
              className="w-8 h-8 rounded-full object-cover shrink-0"
            />
            <span>
              <span className="text-emerald-500">Gifted</span>{" "}
              <span>Monitor</span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-0.5">
            {navLinks.map(link =>
              link.to.includes("#") ? (
                <button
                  key={link.label}
                  onClick={() => handleNavClick(link.to)}
                  className="px-3 py-1.5 text-sm rounded-lg text-muted hover:text-main transition-colors hover:bg-foreground"
                >
                  {link.label}
                </button>
              ) : (
                <Link
                  key={link.label}
                  to={link.to}
                  className={clsx(
                    "px-3 py-1.5 text-sm rounded-lg transition-colors",
                    isActive(link.to)
                      ? "text-emerald-600 dark:text-emerald-400 font-semibold"
                      : "text-muted hover:text-main hover:bg-foreground"
                  )}
                >
                  {link.label}
                </Link>
              )
            )}
          </nav>

          <div className="flex items-center gap-2">
            <ModeToggle />
            <div className="hidden md:flex items-center gap-2">
              <Link
                to={token ? "/dashboard" : "/login"}
                className="px-4 h-9 rounded-xl text-sm font-medium btn border border-line hover:bg-foreground transition-colors"
              >
                {token ? "Dashboard" : "Log In"}
              </Link>
              <Link
                to={token ? "/dashboard" : "/signup"}
                className="px-4 h-9 rounded-xl text-sm font-semibold btn bg-emerald-500 hover:bg-emerald-600 text-white transition-colors"
              >
                Get Started
              </Link>
            </div>
            <div className="md:hidden">
              <button
                onClick={() => setMobileOpen(o => !o)}
                className="btn h-9 w-9 rounded-xl bg-foreground"
              >
                <Menu size={18} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Right-side mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm md:hidden"
            />
            <motion.aside
              key="drawer"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "tween", duration: 0.2, ease: "easeOut" }}
              className="fixed top-0 right-0 h-dvh w-72 bg-background border-l border-line z-50 flex flex-col rounded-l-2xl shadow-xl md:hidden"
            >
              {/* Drawer header */}
              <div className="flex items-center justify-between px-5 h-14 border-b border-line shrink-0">
                <Link to="/" onClick={() => setMobileOpen(false)} className="flex items-center gap-2 font-bold text-sm font-outfit">
                  <img
                    src="https://files.giftedtech.co.ke/image/u2wvoimage.jpg"
                    alt="Gifted Monitor"
                    className="w-7 h-7 rounded-full object-cover shrink-0"
                  />
                  <span><span className="text-emerald-500">Gifted</span> Monitor</span>
                </Link>
                <button onClick={() => setMobileOpen(false)} className="btn h-8 w-8 rounded-xl bg-foreground shrink-0">
                  <X size={16} />
                </button>
              </div>

              {/* Nav items — all left-aligned */}
              <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
                {navLinks.map(link =>
                  link.to.includes("#") ? (
                    <button
                      key={link.label}
                      onClick={() => handleNavClick(link.to)}
                      style={{ justifyContent: "flex-start" }}
                      className="w-full px-4 py-2.5 text-sm rounded-xl text-muted hover:text-main hover:bg-foreground transition-colors"
                    >
                      {link.label}
                    </button>
                  ) : (
                    <Link
                      key={link.label}
                      to={link.to}
                      onClick={() => setMobileOpen(false)}
                      className={clsx(
                        "flex items-center px-4 py-2.5 text-sm rounded-xl transition-colors",
                        isActive(link.to)
                          ? "text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-50 dark:bg-emerald-950/20"
                          : "text-muted hover:text-main hover:bg-foreground"
                      )}
                    >
                      {link.label}
                    </Link>
                  )
                )}
              </nav>

              {/* CTA buttons */}
              <div className="px-4 py-5 border-t border-line flex flex-col gap-2 shrink-0">
                <Link
                  to={token ? "/dashboard" : "/login"}
                  onClick={() => setMobileOpen(false)}
                  className="w-full h-10 rounded-xl text-sm font-medium btn border border-line hover:bg-foreground transition-colors"
                >
                  {token ? "Dashboard" : "Log In"}
                </Link>
                <Link
                  to={token ? "/dashboard" : "/signup"}
                  onClick={() => setMobileOpen(false)}
                  className="w-full h-10 rounded-xl text-sm font-semibold btn bg-emerald-500 hover:bg-emerald-600 text-white transition-colors"
                >
                  Get Started Free
                </Link>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <main className="flex-1">{children}</main>

      <footer className="mx-4 mb-4 border border-line rounded-2xl">
        <div className="main py-3 flex flex-col sm:flex-row items-center justify-between gap-2 flex-wrap">
          <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-xs">
            <a href="/api-docs" className="text-emerald-500 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors font-medium">API Docs</a>
            <a href="/about"   className="text-emerald-500 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors font-medium">About</a>
            <a href="/terms"   className="text-emerald-500 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors font-medium">Terms</a>
            <a href="/privacy" className="text-emerald-500 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors font-medium">Privacy</a>
            <a href="/contact" className="text-emerald-500 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors font-medium">Contact</a>
          </div>
          <p className="text-xs text-muted text-center">
            {(() => { const y = new Date().getFullYear(); return y === 2026 ? `© ${y}` : `© 2026–${y}`; })()}{" "}
            <a href="https://me.giftedtech.co.ke" target="_blank" rel="noopener noreferrer" className="text-emerald-500 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors font-medium">Gifted Tech</a>
            {" "}· All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
