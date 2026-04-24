import DashboardShell, { NavItem } from "../components/layout/DashboardShell";

const teacherNav: NavItem[] = [
  { href: "/teacher/dashboard", icon: "🏠", label: "Tổng quan"         },
  { href: "/teacher/classes",   icon: "🏫", label: "Lớp học"           },
  { href: "/teacher/progress",  icon: "📊", label: "Tiến độ học viên"  },
  { href: "/teacher/messages",  icon: "💬", label: "Tin nhắn", badge: 1 },
  { href: "/teacher/profile",   icon: "👤", label: "Hồ sơ"             },
];

export default function TeacherLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardShell navItems={teacherNav} roleName="Cổng Giáo Viên" roleIcon="👩‍🏫" variant="teacher">
      {children}
    </DashboardShell>
  );
}
