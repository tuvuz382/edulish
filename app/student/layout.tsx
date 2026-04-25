import DashboardShell, { NavItem } from "../components/layout/DashboardShell";

const studentNav: NavItem[] = [
  { href: "/student/dashboard",       icon: "🏠", label: "Trang chủ"             },
  { href: "/student/daily-question",  icon: "📅", label: "Câu hỏi hàng ngày", badge: 1 },
  { href: "/student/random-test",     icon: "🎲", label: "Luyện tập ngẫu nhiên" },
  { href: "/student/dictionary",      icon: "📖", label: "Từ điển"               },
  { href: "/student/class-info",      icon: "🏫", label: "Thông tin lớp"         },
  { href: "/student/materials",       icon: "📚", label: "Tài liệu học tập"      },
  { href: "/student/messages",        icon: "💬", label: "Tin nhắn", badge: 2    },
  { href: "/student/profile",         icon: "👤", label: "Hồ sơ cá nhân"         },
];

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardShell navItems={studentNav} roleName="Cổng Học Sinh" roleIcon="🎓" variant="student">
      {children}
    </DashboardShell>
  );
}
