import DashboardShell, { NavItem } from "../components/layout/DashboardShell";

const adminNav: NavItem[] = [
  { href: "/admin/dashboard",  icon: "🏠", label: "Tổng quan"           },
  { href: "/admin/users",      icon: "👥", label: "Người dùng"          },
  { href: "/admin/classes",    icon: "🏫", label: "Lớp học"             },
  { href: "/admin/questions",  icon: "❓", label: "Ngân hàng câu hỏi"  },
  { href: "/admin/materials",  icon: "📚", label: "Tài liệu học tập"    },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardShell navItems={adminNav} roleName="Quản Trị Viên" roleIcon="⚙️" variant="admin">
      {children}
    </DashboardShell>
  );
}
