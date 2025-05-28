import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuBadge,
} from "@/components/ui/sidebar";
import { LayoutDashboard, Activity, BarChart3, Brain, MessageCircle, Settings } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "#realtime", label: "Real-time Data", icon: Activity },
  { href: "#visualizations", label: "Visualizations", icon: BarChart3 },
  { href: "#analyzer", label: "AI Analyzer", icon: Brain },
  // Chatbot is a modal/drawer, not a section to scroll to via sidebar
  // { href: "#chatbot", label: "AI Chatbot", icon: MessageCircle }, 
];

export function SidebarNav() {
  const pathname = usePathname();

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (href.startsWith("#")) {
      e.preventDefault();
      const targetId = href.substring(1);
      const targetElement = document.getElementById(targetId);
      if (targetElement) {
        targetElement.scrollIntoView({ behavior: "smooth" });
      }
    }
    // For actual page links, NextLink will handle navigation
  };


  return (
    <SidebarMenu>
      {navItems.map((item) => (
        <SidebarMenuItem key={item.label}>
          <Link href={item.href} passHref legacyBehavior>
            <SidebarMenuButton
              asChild
              isActive={item.href.startsWith("#") ? false : pathname === item.href}
              tooltip={{ children: item.label, side: "right", align: "center" }}
              onClick={(e) => handleClick(e as unknown as React.MouseEvent<HTMLAnchorElement>, item.href)}
            >
              <a>
                <item.icon />
                <span>{item.label}</span>
              </a>
            </SidebarMenuButton>
          </Link>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );
}
