
"use client";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { FileDown, Bot } from "lucide-react";
import type { PrintHandler } from '@/app/[lng]/dashboard/layout'; // Adjusted path
import { useTranslation } from 'react-i18next';

interface HeaderProps {
  onPrint: PrintHandler;
  onToggleChatbot: () => void;
  lng: string; // Add lng prop
}

export function Header({ onPrint, onToggleChatbot, lng }: HeaderProps) {
  const { t } = useTranslation();
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur-md sm:px-6">
      <SidebarTrigger className="md:hidden" />
      <div className="flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-7 w-7 text-primary">
          <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/>
          <path d="M12 12c-3 0-5 2.5-5 5s2 5 5 5 5-2.5 5-5-2-5-5-5z"/>
          <path d="M12 2a2.5 2.5 0 00-2.5 2.5V7a2.5 2.5 0 005 0V4.5A2.5 2.5 0 0012 2z" />
          <path d="M12 12a2.5 2.5 0 00-2.5-2.5H7a2.5 2.5 0 000 5h2.5A2.5 2.5 0 0012 12z"/>
          <path d="M22 12a2.5 2.5 0 00-2.5-2.5H17a2.5 2.5 0 000 5h2.5A2.5 2.5 0 0022 12z"/>
        </svg>
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          {t('dashboardTitle')}
        </h1>
      </div>
      <div className="ml-auto flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={onToggleChatbot}>
          <Bot className="mr-2 h-4 w-4" />
          {t('aiChatbot')}
        </Button>
        <Button variant="outline" size="sm" onClick={onPrint}>
          <FileDown className="mr-2 h-4 w-4" />
          {t('generatePdf')}
        </Button>
      </div>
    </header>
  );
}
