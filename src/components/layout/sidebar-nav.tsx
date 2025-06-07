"use client";
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import { LayoutDashboard, Activity, BarChart3, Brain } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslation } from 'react-i18next';


interface SidebarNavProps {
  lng: string;
}

export function SidebarNav({ lng }: SidebarNavProps) {
  const pathname = usePathname();
  const { t } = useTranslation();

  const navItems = [
    { href: `/${lng}/dashboard`, labelKey: "sidebarDashboard", icon: LayoutDashboard, sectionId: "" },
    { href: "#realtime", labelKey: "sidebarRealTimeData", icon: Activity, sectionId: "realtime" },
    { href: "#visualizations", labelKey: "sidebarVisualizations", icon: BarChart3, sectionId: "visualizations" },
    { href: `/${lng}/view-report`, labelKey: "sidebarAIAnalyzer", icon: Brain, sectionId: "" },
  ];

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string, sectionId: string) => {
    if (href.startsWith("#")) {
      e.preventDefault();
      const targetElement = document.getElementById(sectionId);
      if (targetElement) {
        targetElement.scrollIntoView({ behavior: "smooth" });
      }
    }
    // For actual page links, NextLink will handle navigation
  };

  return (
    <SidebarMenu>
      {navItems.map((item) => (
        <SidebarMenuItem key={item.labelKey}>
          <Link href={item.href} passHref legacyBehavior>
            <SidebarMenuButton
              asChild
              isActive={item.href.startsWith("#") ? false : pathname === item.href}
              tooltip={{ children: t(item.labelKey), side: "right", align: "center" }}
              onClick={(e) => handleClick(e as unknown as React.MouseEvent<HTMLAnchorElement>, item.href, item.sectionId)}
            >
              <a>
                <item.icon />
                <span suppressHydrationWarning>{t(item.labelKey)}</span>
              </a>
            </SidebarMenuButton>
          </Link>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );
}