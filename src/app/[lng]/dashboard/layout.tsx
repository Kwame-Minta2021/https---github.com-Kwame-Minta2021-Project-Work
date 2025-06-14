
"use client";

import React from "react";
import { useParams, useRouter, usePathname } from "next/navigation"; 
import { useTranslation } from 'react-i18next';
import i18next from 'i18next';
import resourcesToBackend from 'i18next-resources-to-backend';
import { getOptions, languages, cookieName } from '@/i18n/config';
import { initReactI18next } from 'react-i18next/initReactI18next';

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
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import { Header } from "@/components/layout/header";
import { SidebarNav } from "@/components/layout/sidebar-nav";
import { Settings, Sun, Moon, Laptop, Languages, BellDot } from "lucide-react"; 
import AIChatbot from "@/components/dashboard/ai-chatbot"; 
import ThresholdSettingsModal from "@/components/dashboard/threshold-settings-modal";
import { MOCK_AIR_QUALITY_DATA } from "@/lib/constants";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { useTheme } from "next-themes";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Cookies from 'js-cookie';
import { useToast } from "@/hooks/use-toast";
import { analyzeAirQuality, type AnalyzeAirQualityInput } from '@/ai/flows/analyze-air-quality';
import { sendSmsReport, type SendSmsReportInput } from '@/ai/flows/send-sms-report-flow';
import type { CustomAlertSettings } from '@/types';

const LS_KEY_CUSTOM_THRESHOLDS = 'breatheEasyCustomAlertThresholds';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({
  children,
}: DashboardLayoutProps) {
  const params = useParams(); 
  const currentLng = params.lng as string; 

  const { t, i18n } = useTranslation();
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();

  React.useEffect(() => {
    if (i18n.resolvedLanguage !== currentLng) {
      i18n.changeLanguage(currentLng);
    }
  }, [currentLng, i18n]);
  
  const [isChatbotOpen, setIsChatbotOpen] = React.useState(false);
  const [isSendingSms, setIsSendingSms] = React.useState(false);
  const [isThresholdModalOpen, setIsThresholdModalOpen] = React.useState(false);
  const [customAlertSettings, setCustomAlertSettings] = React.useState<CustomAlertSettings>({});
  const { setTheme } = useTheme();


  React.useEffect(() => {
    try {
      const storedSettings = localStorage.getItem(LS_KEY_CUSTOM_THRESHOLDS);
      if (storedSettings) {
        setCustomAlertSettings(JSON.parse(storedSettings));
      }
    } catch (error) {
      console.error("Error loading custom alert settings from localStorage:", error);
    }
  }, []);

  const handleSaveThresholdSettings = (settings: CustomAlertSettings) => {
    try {
      localStorage.setItem(LS_KEY_CUSTOM_THRESHOLDS, JSON.stringify(settings));
      setCustomAlertSettings(settings);
    } catch (error) {
      console.error("Error saving custom alert settings to localStorage:", error);
      toast({ variant: "destructive", title: t('errorSavingSettingsTitle'), description: t('errorSavingSettingsDesc') });
    }
  };
  
  const toggleChatbot = () => setIsChatbotOpen(!isChatbotOpen);

  const changeLanguage = (newLng: string) => {
    Cookies.set(cookieName, newLng);
    const newPathname = pathname.replace(`/${currentLng}`, `/${newLng}`);
    router.push(newPathname);
  };

  const handleSendSmsReport = async () => {
    setIsSendingSms(true);
    try {
      const aiInputForAnalysis: AnalyzeAirQualityInput = {
        co: MOCK_AIR_QUALITY_DATA.co.value,
        vocs: MOCK_AIR_QUALITY_DATA.vocs.value,
        ch4Lpg: MOCK_AIR_QUALITY_DATA.ch4Lpg.value,
        pm10: MOCK_AIR_QUALITY_DATA.pm1_0.value,
        pm25: MOCK_AIR_QUALITY_DATA.pm2_5.value,
        pm100: MOCK_AIR_QUALITY_DATA.pm10.value,
        language: currentLng,
      };
      const analysisResult = await analyzeAirQuality(aiInputForAnalysis);

      const smsFlowInput: SendSmsReportInput = {
        reportDate: new Date().toISOString(),
        language: currentLng,
        currentReadings: {
          co: MOCK_AIR_QUALITY_DATA.co.value,
          vocs: MOCK_AIR_QUALITY_DATA.vocs.value,
          ch4Lpg: MOCK_AIR_QUALITY_DATA.ch4Lpg.value,
          pm1_0: MOCK_AIR_QUALITY_DATA.pm1_0.value,
          pm2_5: MOCK_AIR_QUALITY_DATA.pm2_5.value,
          pm10: MOCK_AIR_QUALITY_DATA.pm10.value,
        },
        aiAnalysis: analysisResult,
      };

      const result = await sendSmsReport(smsFlowInput);
      toast({
        title: t('smsReportStatus'),
        description: result.status,
      });

    } catch (error) {
      console.error("Failed to send SMS report:", error);
      toast({
        variant: "destructive",
        title: t('smsReportErrorTitle'),
        description: t('smsReportErrorDescription') + (error instanceof Error ? `: ${error.message}` : ''),
      });
    } finally {
      setIsSendingSms(false);
    }
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
             <SidebarMenuItem onClick={() => setIsThresholdModalOpen(true)}>
                <SidebarMenuButton tooltip={{children: t('notificationSettingsTooltip'), side: "right", align: "center"}}>
                    <BellDot />
                    <span>{t('notificationSettings')}</span>
                </SidebarMenuButton>
            </SidebarMenuItem>

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
                    <Languages /> 
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
              </DropdownMenuContent>
            </DropdownMenu>

          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <Header 
          onToggleChatbot={toggleChatbot}
          onSendSmsReport={handleSendSmsReport} 
          isSendingSms={isSendingSms} 
          lng={currentLng}
        />
        {React.cloneElement(children as React.ReactElement, { 
          lng: currentLng,
          customAlertSettings: customAlertSettings
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
      <ThresholdSettingsModal
        isOpen={isThresholdModalOpen}
        onOpenChange={setIsThresholdModalOpen}
        initialSettings={customAlertSettings}
        onSettingsSave={handleSaveThresholdSettings}
      />
    </SidebarProvider>
  );
}
