import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, Monitor, User, Users, Settings,
  MessageSquare, LogOut, Menu, X, Shield, ChevronDown
} from "lucide-react";
import { ModeToggle } from "@/components/ui";
import { useAuthStore } from "@/store";
import clsx from "clsx";

const userNav = [
  { to: "/dashboard",  label: "Dashboard",  icon: LayoutDashboard },
  { to: "/monitors",   label: "Monitors",   icon: Monitor },
  { to: "/profile",    label: "Profile",    icon: User },
];

const adminNav = [
  { to: "/admin/dashboard", label: "Dashboard",      icon: LayoutDashboard },
  { to: "/admin/users",     label: "Users",          icon: Users },
  { to: "/admin/monitors",  label: "Monitors (All)", icon: Settings },
  { to: "/admin/messages",  label: "Messages",       icon: MessageSquare },
];

function NavLink({ to, label, icon: Icon, onClick }: { to: string; label: string; icon: React.ElementType; onClick?: () => void }) {
  const { pathname } = useLocation();
  const active = pathname === to || (to !== "/dashboard" && pathname.startsWith(to));
  return (
    <Link
      to={to}
      onClick={onClick}
      className={clsx(
        "flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all",
        active
          ? "bg-emerald-500 text-white"
          : "text-muted hover:text-main hover:bg-foreground"
      )}
    >
      <Icon size={16} />
      <span>{label}</span>
    </Link>
  );
}

interface AppLayoutProps { children: React.ReactNode; }

export default function AppLayout({ children }: AppLayoutProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [adminOpen, setAdminOpen] = useState(false);
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const isAdmin = user?.is_admin || user?.is_superadmin;
  const isAdminRoute = adminNav.some(n => pathname.startsWith(n.to));
  const [mobileAdminOpen, setMobileAdminOpen] = useState(isAdminRoute);

  // Lock scroll when mobile menu open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  // Close mobile menu on route change
  useEffect(() => { setMobileOpen(false); }, [pathname]);

  const handleLogout = () => { logout(); navigate("/login"); };

  return (
    <div className="min-h-screen bg-background flex flex-col">

      {/* ── Top Navigation Bar ───────────────────────────────────────── */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-line rounded-b-2xl">
        <div className="flex items-center justify-between px-4 lg:px-6 h-14">

          {/* Logo */}
          <Link to="/dashboard" className="flex items-center gap-2 font-bold text-sm font-outfit shrink-0">
            <img
              src="https://files.giftedtech.co.ke/image/u2wvoimage.jpg"
              alt="Gifted Monitor"
              className="w-8 h-8 rounded-full object-cover shrink-0"
            />
            <span><span className="text-emerald-500">Gifted</span> Monitor</span>
          </Link>

          {/* Desktop nav links */}
          <nav className="hidden md:flex items-center gap-1 mx-4">
            {userNav.map(n => <NavLink key={n.to} {...n} />)}

            {/* Admin dropdown */}
            {isAdmin && (
              <div className="relative">
                <button
                  onClick={() => setAdminOpen(o => !o)}
                  className={clsx(
                    "flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all",
                    adminNav.some(n => pathname.startsWith(n.to))
                      ? "bg-emerald-500 text-white"
                      : "text-muted hover:text-main hover:bg-foreground"
                  )}
                >
                  <Shield size={16} />
                  <span>Admin</span>
                  <ChevronDown size={14} className={clsx("transition-transform", adminOpen && "rotate-180")} />
                </button>
                <AnimatePresence>
                  {adminOpen && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setAdminOpen(false)} />
                      <motion.div
                        initial={{ opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        transition={{ duration: 0.15 }}
                        className="absolute top-full left-0 mt-1.5 w-44 bg-background border border-line rounded-xl shadow-lg z-20 py-1 overflow-hidden"
                      >
                        {adminNav.map(n => (
                          <Link
                            key={n.to}
                            to={n.to}
                            onClick={() => setAdminOpen(false)}
                            className={clsx(
                              "flex items-center gap-2.5 px-3 py-2.5 text-sm transition-colors",
                              pathname.startsWith(n.to)
                                ? "text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-50 dark:bg-emerald-950/20"
                                : "text-muted hover:text-main hover:bg-foreground"
                            )}
                          >
                            <n.icon size={15} />
                            {n.label}
                          </Link>
                        ))}
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            )}
          </nav>

          {/* Right: user + actions */}
          <div className="flex items-center gap-2 shrink-0">
            <ModeToggle />

            {/* User chip (desktop) */}
            <div className="hidden md:flex items-center gap-2 pl-2 border-l border-line">
              <div className="flex items-center gap-2">
                {user?.avatar ? (
                  <img src={user.avatar} alt={user.name} className="w-7 h-7 rounded-full object-cover" />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-emerald-500/15 center text-xs font-bold text-emerald-600 dark:text-emerald-400">
                    {user?.name?.charAt(0).toUpperCase()}
                  </div>
                )}
                <span className="text-sm font-medium hidden lg:inline">{user?.name?.split(" ")[0]}</span>
              </div>
              <button
                onClick={handleLogout}
                title="Log out"
                className="btn h-8 w-8 rounded-xl hover:bg-red-50 dark:hover:bg-red-950/20 text-muted hover:text-red-500 transition-colors"
              >
                <LogOut size={16} />
              </button>
            </div>

            {/* Mobile hamburger */}
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

      {/* ── Mobile Drawer ─────────────────────────────────────────────── */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm"
            />
            <motion.aside
              initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed top-0 left-0 h-screen w-72 bg-background border-r border-line z-50 md:hidden flex flex-col rounded-r-2xl shadow-xl"
            >
              {/* Drawer header */}
              <div className="flex items-center justify-between px-5 h-14 border-b border-line shrink-0">
                <Link to="/dashboard" onClick={() => setMobileOpen(false)} className="flex items-center gap-2 font-bold text-sm font-outfit">
                  <img
                    src="https://files.giftedtech.co.ke/image/u2wvoimage.jpg"
                    alt="Gifted Monitor"
                    className="w-7 h-7 rounded-full object-cover shrink-0"
                  />
                  <span><span className="text-emerald-500">Gifted</span> Monitor</span>
                </Link>
                <button onClick={() => setMobileOpen(false)} className="btn h-8 w-8 rounded-xl bg-foreground">
                  <X size={16} />
                </button>
              </div>

              {/* Nav */}
              <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
                {userNav.map(n => <NavLink key={n.to} {...n} onClick={() => setMobileOpen(false)} />)}

                {isAdmin && (
                  <div className="pt-3">
                    <button
                      onClick={() => setMobileAdminOpen(o => !o)}
                      className="w-full flex items-center gap-2 px-3 py-1.5 mb-1 rounded-xl hover:bg-foreground transition-colors"
                    >
                      <Shield size={13} className="text-muted" />
                      <span className="text-[11px] font-semibold text-muted uppercase tracking-wider flex-1 text-left">Admin</span>
                      <ChevronDown size={13} className={clsx("text-muted transition-transform", mobileAdminOpen && "rotate-180")} />
                    </button>
                    {mobileAdminOpen && (
                      <div className="space-y-0.5 pl-2">
                        {adminNav.map(n => <NavLink key={n.to} {...n} onClick={() => setMobileOpen(false)} />)}
                      </div>
                    )}
                  </div>
                )}
              </nav>

              {/* User footer */}
              <div className="px-4 py-4 border-t border-line shrink-0">
                <div className="flex items-center gap-3 px-3 py-2 mb-2">
                  {user?.avatar ? (
                    <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full object-cover" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-emerald-500/15 center text-sm font-bold text-emerald-600 dark:text-emerald-400">
                      {user?.name?.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="text-sm font-semibold truncate">{user?.name}</p>
                    <p className="text-xs text-muted truncate">@{user?.username}</p>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
                  style={{ justifyContent: "flex-start" }}
                >
                  <LogOut size={16} />
                  <span>Log out</span>
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* ── Page content ──────────────────────────────────────────────── */}
      <main className="flex-1 p-4 lg:p-6">
        {children}
      </main>

      <footer className="mx-4 lg:mx-6 mb-4 py-2.5 px-4 border border-line rounded-2xl">
        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5">
            <a href="/about"   className="text-[11px] text-emerald-500 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors font-medium">About</a>
            <a href="/terms"   className="text-[11px] text-emerald-500 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors font-medium">Terms</a>
            <a href="/privacy" className="text-[11px] text-emerald-500 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors font-medium">Privacy</a>
            <a href="/contact" className="text-[11px] text-emerald-500 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors font-medium">Contact</a>
          </div>
          <p className="text-[11px] text-muted">
            {(() => { const y = new Date().getFullYear(); return y === 2026 ? `© ${y}` : `© 2026–${y}`; })()}{" "}
            <a href="https://me.giftedtech.co.ke" target="_blank" rel="noopener noreferrer" className="text-emerald-500 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors font-medium">Gifted Tech</a>
            {" "}· All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
