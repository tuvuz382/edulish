"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

interface AuthUser {
  id:    number;
  name:  string;
  email: string;
  role:  string;
}

export interface NavItem {
  href: string;
  icon: string;
  label: string;
  badge?: number;
}

interface DashboardShellProps {
  children: React.ReactNode;
  navItems: NavItem[];
  roleName: string;
  roleIcon: string;
  variant: "student" | "teacher" | "admin";
}

/* ── Static variant styles (full strings so Tailwind can detect) ── */
const VARIANTS = {
  student: {
    sidebar:  "from-blue-600 to-blue-800",
    avatarBg: "bg-blue-500",
    ring:     "ring-blue-400",
  },
  teacher: {
    sidebar:  "from-emerald-600 to-emerald-800",
    avatarBg: "bg-emerald-500",
    ring:     "ring-emerald-400",
  },
  admin: {
    sidebar:  "from-violet-600 to-violet-800",
    avatarBg: "bg-violet-500",
    ring:     "ring-violet-400",
  },
};

export default function DashboardShell({
  children,
  navItems,
  roleName,
  roleIcon,
  variant,
}: DashboardShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser]               = useState<AuthUser | null>(null);
  const pathname = usePathname();
  const router   = useRouter();
  const styles   = VARIANTS[variant];

  // Lấy thông tin user từ cookie JWT khi component mount
  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((data) => {
        if (data.success && data.user) setUser(data.user);
      })
      .catch(() => {}); // Không cần báo lỗi — chưa đăng nhập thật
  }, []);

  /* Derive page title from nav items */
  const currentPage = navItems.find(
    (item) => pathname === item.href || pathname.startsWith(item.href + "/")
  );
  const pageTitle = currentPage?.label ?? "Tổng quan";

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch { /* bỏ qua lỗi mạng */ }
    router.push("/login");
    router.refresh();
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-100">
      {/* ── Mobile overlay ── */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/50 backdrop-blur-sm lg:hidden animate-fade-in"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ════════════════════ SIDEBAR ════════════════════ */}
      <aside
        className={[
          "fixed inset-y-0 left-0 z-30 flex w-64 flex-shrink-0 flex-col",
          "bg-gradient-to-b",
          styles.sidebar,
          "transition-transform duration-300 ease-in-out",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
          "lg:static lg:translate-x-0",
        ].join(" ")}
      >
        {/* Logo */}
        <div className="flex h-16 flex-shrink-0 items-center gap-3 border-b border-white/10 px-5">
          <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-white/20 text-xl shadow-inner">
            🦉
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-white text-base leading-none">Edulish</p>
            <p className="mt-0.5 text-xs text-white/60 truncate">{roleName}</p>
          </div>
          {/* Mobile close */}
          <button
            onClick={() => setSidebarOpen(false)}
            className="ml-auto rounded-lg p-1 text-white/50 hover:text-white transition-colors lg:hidden"
          >
            ✕
          </button>
        </div>

        {/* Nav items */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-0.5">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={[
                  "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150",
                  isActive
                    ? "bg-white/20 text-white shadow-sm"
                    : "text-white/65 hover:bg-white/10 hover:text-white",
                ].join(" ")}
              >
                <span className="w-5 flex-shrink-0 text-center text-base transition-transform group-hover:scale-110">
                  {item.icon}
                </span>
                <span className="flex-1">{item.label}</span>
                {item.badge != null && item.badge > 0 && (
                  <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-red-400 px-1 text-[11px] font-bold text-white">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* User info + logout */}
        <div className="flex-shrink-0 space-y-1 border-t border-white/10 p-3">
          <div className="flex items-center gap-3 px-3 py-2">
            <div
              className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl ${styles.avatarBg} text-sm font-bold text-white ring-2 ring-white/20`}
            >
              {roleIcon}
            </div>
            <div className="flex-1 min-w-0">
              <p className="truncate text-sm font-medium text-white">
                {user?.name ?? "Người dùng"}
              </p>
              <p className="truncate text-xs text-white/50">{roleName}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-white/65 transition-all duration-150 hover:bg-white/10 hover:text-white"
          >
            <span className="w-5 flex-shrink-0 text-center text-base">🚪</span>
            Đăng xuất
          </button>
        </div>
      </aside>

      {/* ════════════════════ MAIN ════════════════════ */}
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        {/* Top bar */}
        <header className="flex h-16 flex-shrink-0 items-center gap-4 border-b border-slate-200 bg-white px-4 lg:px-6">
          {/* Hamburger (mobile) */}
          <button
            onClick={() => setSidebarOpen(true)}
            aria-label="Mở menu"
            className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700 lg:hidden"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          {/* Page title */}
          <h1 className="flex-1 truncate text-base font-bold text-slate-800 lg:text-lg">
            {pageTitle}
          </h1>

          {/* Right actions */}
          <div className="flex flex-shrink-0 items-center gap-2">
            {/* Bell */}
            <button className="relative flex h-9 w-9 items-center justify-center rounded-xl text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
            </button>

            {/* Avatar */}
            <div className="flex items-center gap-2 border-l border-slate-200 pl-3">
              <div
                className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl ${styles.avatarBg} text-sm font-bold text-white`}
              >
                {roleIcon}
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-semibold text-slate-800 leading-tight">
                  {user?.name ?? "Người dùng"}
                </p>
                <p className="text-xs text-slate-500 leading-tight">{user?.email ?? roleName}</p>
              </div>
            </div>
          </div>
        </header>

        {/* Scrollable content */}
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
