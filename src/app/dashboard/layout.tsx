"use client";

import * as React from "react";
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
import { Button } from "@/components/ui/button";
import { LogOut, Settings, Sun, Moon, Laptop } from "lucide-react";
import AIChatbot from "@/components/dashboard/ai-chatbot"; 
import { MOCK_AIR_QUALITY_DATA } from "@/lib/constants";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { useTheme } from "next-themes";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";


export type PrintHandler = () => void;

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const printRef = React.useRef<PrintHandler | null>(null);
  const [isChatbotOpen, setIsChatbotOpen] = React.useState(false);
  const { setTheme } = useTheme();

  const handlePrint = () => {
    if (printRef.current) {
      printRef.current();
    }
  };
  
  const toggleChatbot = () => setIsChatbotOpen(!isChatbotOpen);

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
          <SidebarNav />
        </SidebarContent>
        <SidebarFooter className="p-2">
           <SidebarMenu>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuItem>
                  <SidebarMenuButton tooltip={{children: "Change Theme", side: "right", align: "center"}}>
                    <Settings />
                    <span>Theme</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </DropdownMenuTrigger>
              <DropdownMenuContent side="right" align="start" sideOffset={5} className="w-40 ml-1 mb-1 md:ml-0 md:mb-0">
                <DropdownMenuItem onClick={() => setTheme("light")}>
                  <Sun className="mr-2 h-4 w-4" />
                  <span>Light</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("dark")}>
                  <Moon className="mr-2 h-4 w-4" />
                  <span>Dark</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("system")}>
                  <Laptop className="mr-2 h-4 w-4" />
                  <span>System</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <SidebarMenuItem>
              <SidebarMenuButton tooltip={{children: "Log Out", side: "right", align: "center"}}>
                <LogOut />
                <span>Log Out</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <Header onPrint={handlePrint} onToggleChatbot={toggleChatbot} />
        {React.cloneElement(children as React.ReactElement, { setPrintHandler: (handler: PrintHandler) => printRef.current = handler })}
      </SidebarInset>

      <Sheet open={isChatbotOpen} onOpenChange={setIsChatbotOpen}>
        <SheetContent side="right" className="w-full sm:max-w-lg p-0">
          <SheetHeader className="p-6 pb-2">
            <SheetTitle>AI Chatbot</SheetTitle>
            <SheetDescription>
              Ask questions about air quality, sensor readings, and health impacts.
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
          />
        </SheetContent>
      </Sheet>
    </SidebarProvider>
  );
}
