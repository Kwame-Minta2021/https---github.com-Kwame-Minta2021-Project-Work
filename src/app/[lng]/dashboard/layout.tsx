
"use client";

import * as React from "react";
import { useParams, useRouter, usePathname } from "next/navigation"; // useParams is already here
import { useTranslation } from 'react-i18next';
import i18next from 'i18next';
import resourcesToBackend from 'i18next-resources-to-backend';
import { getOptions, languages, cookieName } from '@/i18n/config';
import { initReactI18next } from 'react-i18next/initReactI18next';

// Initialize i18next for client components that use useTranslation
if (!i18next.isInitialized) {
  i18next
    .use(initReactI18next)
    .use(resourcesToBackend((language: string, namespace: string) => import(`@/locales/${language}/${namespace}.json`)))
    .init(getOptions());
}


import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarInset,
  SidebarTrigger,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import { Header } from "@/components/layout/header";
import { SidebarNav } from "@/components/layout/sidebar-nav";
import { Settings, Sun, Moon, Laptop, Languages } from "lucide-react"; // Added Languages icon
import AIChatbot from "@/components/dashboard/ai-chatbot"; 
import { MOCK_AIR_QUALITY_DATA } from "@/lib/constants";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { useTheme } from "next-themes";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import Cookies from 'js-cookie';


export type PrintHandler = () => void;

interface DashboardLayoutProps {
  children: React.ReactNode;
  // params: { lng: string }; // Removed params from props
}


export default function DashboardLayout({
  children,
  // params: { lng: currentLng } // Removed params from function signature
}: DashboardLayoutProps) {
  const params = useParams(); // Use the hook to get route parameters
  const currentLng = params.lng as string; // Extract lng from the hook's result

  const { t, i18n } = useTranslation();
  const router = useRouter();
  const pathname = usePathname();

  React.useEffect(() => {
    if (i18n.resolvedLanguage !== currentLng) {
      i18n.changeLanguage(currentLng);
    }
  }, [currentLng, i18n]);
  
  const printRef = React.useRef<PrintHandler | null>(null);
  const [isChatbotOpen, setIsChatbotOpen] = React.useState(false);
  const { setTheme } = useTheme();

  const handlePrint = () => {
    if (printRef.current) {
      printRef.current();
    }
  };
  
  const toggleChatbot = () => setIsChatbotOpen(!isChatbotOpen);

  const changeLanguage = (newLng: string) => {
    Cookies.set(cookieName, newLng);
    // Replace the current path's language segment
    const newPathname = pathname.replace(`/${currentLng}`, `/${newLng}`);
    router.push(newPathname);
  };


  return (
    <SidebarProvider defaultOpen>
      <Sidebar collapsible="icon" side="left" variant="sidebar" className="border-r">
        <SidebarHeader className="p-4">
          <div className="flex items-center gap-2 group-data-[collapsible=icon]:justify-center">
             <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-8 w-8 text-primary">
                <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/>
                <path d="M12 12c-3 0-5 2.5-5 5s2 5 5 5 5-2.5 5-5-2-5-5-5z"/>
                <path d="M12 2a2.5 2.5 0 00-2.5 2.5V7a2.5 2.5 0 005 0V4.5A2.5 2.5 0 0012 2z" />
                <path d="M12 12a2.5 2.5 0 00-2.5-2.5H7a2.5 2.5 0 000 5h2.5A2.5 2.5 0 0012 12z"/>
                <path d="M22 12a2.5 2.5 0 00-2.5-2.5H17a2.5 2.5 0 000 5h2.5A2.5 2.5 0 0022 12z"/>
             </svg>
            <span className="text-lg font-semibold group-data-[collapsible=icon]:hidden">
              BreatheEasy
            </span>
          </div>
        </SidebarHeader>
        <SidebarContent className="p-2">
          <SidebarNav lng={currentLng} />
        </SidebarContent>
        <SidebarFooter className="p-2">
           <SidebarMenu>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuItem>
                  <SidebarMenuButton tooltip={{children: t('theme'), side: "right", align: "center"}}>
                    <Settings />
                    <span>{t('theme')}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </DropdownMenuTrigger>
              <DropdownMenuContent side="right" align="start" sideOffset={5} className="w-40 ml-1 mb-1 md:ml-0 md:mb-0">
                <DropdownMenuItem onClick={() => setTheme("light")}>
                  <Sun className="mr-2 h-4 w-4" />
                  <span>{t('light')}</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("dark")}>
                  <Moon className="mr-2 h-4 w-4" />
                  <span>{t('dark')}</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("system")}>
                  <Laptop className="mr-2 h-4 w-4" />
                  <span>{t('system')}</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuItem>
                  <SidebarMenuButton tooltip={{children: t('changeLanguage'), side: "right", align: "center"}}>
                    <Languages /> {/* Using Languages icon */}
                    <span>{t('changeLanguage')}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </DropdownMenuTrigger>
              <DropdownMenuContent side="right" align="start" sideOffset={5} className="w-40 ml-1 mb-1 md:ml-0 md:mb-0">
                <DropdownMenuItem onClick={() => changeLanguage('en')} disabled={currentLng === 'en'}>
                  {t('english')}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => changeLanguage('fr')} disabled={currentLng === 'fr'}>
                  {t('french')}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => changeLanguage('tw')} disabled={currentLng === 'tw'}>
                  {t('twi')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <Header 
          onPrint={handlePrint} 
          onToggleChatbot={toggleChatbot}
          lng={currentLng}
        />
        {React.cloneElement(children as React.ReactElement, { 
          setPrintHandler: (handler: PrintHandler) => printRef.current = handler,
          lng: currentLng // Pass lng to children of layout (e.g. page.tsx)
        })}
      </SidebarInset>

      <Sheet open={isChatbotOpen} onOpenChange={setIsChatbotOpen}>
        <SheetContent side="right" className="w-full sm:max-w-lg p-0">
          <SheetHeader className="p-6 pb-2">
            <SheetTitle>{t('chatbotSheetTitle')}</SheetTitle>
            <SheetDescription>
              {t('chatbotSheetDescription')}
            </SheetDescription>
          </SheetHeader>
          <AIChatbot
            currentReadings={{
              coLevel: MOCK_AIR_QUALITY_DATA.co.value,
              vocLevel: MOCK_AIR_QUALITY_DATA.vocs.value,
              ch4LpgLevel: MOCK_AIR_QUALITY_DATA.ch4Lpg.value,
              pm1Level: MOCK_AIR_QUALITY_DATA.pm1_0.value,
              pm25Level: MOCK_AIR_QUALITY_DATA.pm2_5.value,
              pm10Level: MOCK_AIR_QUALITY_DATA.pm10.value,
            }}
            lng={currentLng}
          />
        </SheetContent>
      </Sheet>
    </SidebarProvider>
  );
}
