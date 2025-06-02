
// src/components/dashboard/dashboard-client-content.tsx
'use client';

import * as React from 'react';
import { Suspense } from 'react';
import { DateRange } from 'react-day-picker';
import { subDays, format, parseISO, isWithinInterval, startOfDay, endOfDay } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next'; 

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import RealtimeDataGrid from '@/components/dashboard/realtime-data-grid';
import DataVisualization from '@/components/dashboard/data-visualization';
import PrintableReport from '@/components/dashboard/printable-report';
import { MOCK_AIR_QUALITY_DATA, MOCK_HISTORICAL_DATA as ALL_MOCK_HISTORICAL_DATA } from '@/lib/constants';
import type { HistoricalDataPoint } from '@/types';
import type { AnalyzeAirQualityOutput } from '@/ai/flows/analyze-air-quality';
import type { PrintHandler, SetPrintHandlerType } from '@/app/[lng]/dashboard/layout'; 
import { cn } from '@/lib/utils';

interface DashboardClientContentProps {
  setPrintHandler?: SetPrintHandlerType; 
  aiAnalysisForReport: AnalyzeAirQualityOutput | null;
  children: React.ReactNode; 
  lng: string;
}

function AIAnalyzerSkeleton({ t }: { t: (key: string) => string }) {
  return (
    <section id="analyzer-skeleton" className="mb-8 scroll-mt-20">
      <h2 className="text-2xl font-semibold tracking-tight mb-4">{t('aiAnalyzer')}</h2>
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>{t('rlModelAnalysis')}</CardTitle>
          <CardDescription>
            {t('rlModelAnalysisDesc')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="font-semibold text-lg mb-2">{t('effectOnHumanHealth')}</h3>
            <Skeleton className="h-4 w-3/4 mb-2" />
            <Skeleton className="h-4 w-1/2" />
          </div>
          <hr className="my-4" />
          <div>
            <h3 className="font-semibold text-lg mb-2">{t('bestActionToReducePresence')}</h3>
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-5/6 mb-2" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </CardContent>
      </Card>
    </section>
  );
}

export default function DashboardClientContent({ 
  setPrintHandler, 
  aiAnalysisForReport,
  children,
  lng, 
}: DashboardClientContentProps) {
  const { t } = useTranslation(); 
  
  const [date, setDate] = React.useState<DateRange | undefined>({
    from: startOfDay(subDays(new Date(), 6)), 
    to: endOfDay(new Date()),
  });

  const [filteredHistoricalData, setFilteredHistoricalData] = React.useState<HistoricalDataPoint[]>([]);

  React.useEffect(() => {
    let newFilteredData: HistoricalDataPoint[] = [];
    if (date?.from && date?.to) {
      const startDate = startOfDay(date.from);
      const endDate = endOfDay(date.to);
      newFilteredData = ALL_MOCK_HISTORICAL_DATA.filter(point => {
        try {
          const pointDate = parseISO(point.timestamp);
          return isWithinInterval(pointDate, { start: startDate, end: endDate });
        } catch (e) {
          return false;
        }
      });
    } else {
      const defaultStartDate = startOfDay(subDays(new Date(), 6));
      const defaultEndDate = endOfDay(new Date());
       newFilteredData = ALL_MOCK_HISTORICAL_DATA.filter(point => {
        try {
          const pointDate = parseISO(point.timestamp);
          return isWithinInterval(pointDate, { start: defaultStartDate, end: defaultEndDate });
        } catch (e) {
          return false;
        }
      });
    }
    setFilteredHistoricalData(newFilteredData);
  }, [date]);

  React.useEffect(() => {
    if (typeof setPrintHandler === 'function') {
      const handlePrintRequest: PrintHandler = () => {
        console.log("DashboardClientContent: Attempting to print report...");
        const printWindow = window.open('', '_blank', 'width=800,height=600,scrollbars=yes,resizable=yes');

        if (printWindow) {
          console.log("DashboardClientContent: Print window opened successfully.");
          const reportElement = document.getElementById('printable-report-content-client');

          if (!reportElement) {
            console.error('DashboardClientContent: Printable report content element not found (id: printable-report-content-client).');
            try { printWindow.alert('Error: Report content not found. Please try again.');} catch(e) {console.error("Failed to alert in print window",e);}
            try { printWindow.close(); } catch(e) {console.error("Failed to close print window",e);}
            return;
          }

          const reportHTMLContent = reportElement.innerHTML;
          console.log("DashboardClientContent: Report HTML captured. Length:", reportHTMLContent.length);

          if (reportHTMLContent.trim() === "") {
              console.error('DashboardClientContent: Report content is empty.');
              try {printWindow.alert('Error: Report content is empty. Cannot print.');} catch(e) {console.error("Failed to alert in print window",e);}
              try {printWindow.close();} catch(e) {console.error("Failed to close print window",e);}
              return;
          }
          
          printWindow.document.open();
          
          let htmlDocument = '<html><head>';
          htmlDocument += '<title>' + (t('reportTitle') || 'BreatheEasy Air Quality Report').replace(/</g, '&lt;').replace(/>/g, '&gt;') + '</title>';
          htmlDocument += '<style>';
          htmlDocument += `
            body { font-family: Arial, Helvetica, sans-serif; margin: 25px; line-height: 1.6; color: #333; background-color: #fff; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
            th, td { border: 1px solid #ccc; padding: 10px; text-align: left; vertical-align: top; }
            th { background-color: #f0f4f7; font-weight: bold; color: #333; }
            h1, h2, h3 { color: #64B5F6; margin-block-start: 1em; margin-block-end: 0.67em; }
            h1 { font-size: 26px; font-weight: bold; text-align: center; margin-bottom: 15px; }
            h2 { font-size: 22px; font-weight: bold; margin-bottom: 12px; border-bottom: 2px solid #64B5F6; padding-bottom: 6px;}
            h3 { font-size: 18px; font-weight: bold; margin-bottom: 8px; color: #444;}
            p { margin-bottom: 12px; }
            .whitespace-pre-line { white-space: pre-line; }
            header, section, footer { margin-bottom: 25px; }
            footer { text-align: center; font-size: 13px; color: #777; margin-top: 30px; padding-top: 15px; border-top: 1px solid #eee; }
            /* Specific classes from PrintableReport for better fidelity */
            .text-gray-600 { color: #555; }
            .text-primary { color: #64B5F6; }
            .font-bold { font-weight: bold; }
            .font-semibold { font-weight: 600; }
            .text-xl { font-size: 20px; }
            .text-3xl { font-size: 28px; }
            .border-b-2 { border-bottom-width: 2px; }
            /* .border-primary { border-bottom-color: #64B5F6; } */ /* Simplified, already commented out in previous version */
            .pb-2 { padding-bottom: 8px; }
            .leading-relaxed { line-height: 1.75; }
            .flex { display: flex; }
            .items-center { align-items: center; }
            .mr-2 { margin-right: 8px; } /* For potential icons in report */
            .bg-gray-100 { background-color: #f9f9f9; } /* For table header row */
            .text-sm { font-size: 14px; }
            .text-xs { font-size: 12px; }
          `;
          htmlDocument += '</style></head><body>';
          htmlDocument += reportHTMLContent;
          htmlDocument += '</body></html>';

          printWindow.document.write(htmlDocument);
          printWindow.document.close();

          setTimeout(() => {
            try {
              printWindow.focus(); 
              printWindow.print();
              console.log("DashboardClientContent: Print dialog initiated.");
            } catch (e) {
              console.error("DashboardClientContent: Error initiating print dialog.", e);
              alert("Could not initiate print. Please try again or check browser console.");
            }
          }, 300);

          printWindow.onafterprint = () => {
            console.log("DashboardClientContent: onafterprint event fired.");
            try { printWindow.close(); } catch(e) {console.error("Failed to close print window post-print",e);}
          };

        } else {
          console.error("DashboardClientContent: Failed to open print window. It might have been blocked by a popup blocker.");
          alert(t('popupBlockerWarning') || "Failed to open print window. Please disable popup blockers for this site and try again.");
        }
      };
      setPrintHandler(handlePrintRequest);
      console.log("DashboardClientContent: Print handler callback has been SET.");
      
      return () => {
        setPrintHandler(null);
        console.log("DashboardClientContent: Print handler callback has been UNSET.");
      };

    } else {
      console.warn("DashboardClientContent: setPrintHandler was not a function. Print functionality will be disabled.");
    }
  }, [setPrintHandler, aiAnalysisForReport, t, lng]); 

  return (
    <div className="flex-1 space-y-6 p-4 md:p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row justify-end items-center gap-4 mb-6">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              id="date"
              variant={"outline"}
              className={cn(
                "w-full sm:w-[260px] justify-start text-left font-normal",
                !date && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date?.from ? (
                date.to ? (
                  <>
                    {format(date.from, "LLL dd, y")} -{" "}
                    {format(date.to, "LLL dd, y")}
                  </>
                ) : (
                  format(date.from, "LLL dd, y")
                )
              ) : (
                <span>{t('pickDateRange')}</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="end">
            <Calendar
              initialFocus
              mode="range"
              defaultMonth={date?.from}
              selected={date}
              onSelect={setDate}
              numberOfMonths={2}
              disabled={(d) => d > new Date() || d < subDays(new Date(), 60)}
            />
          </PopoverContent>
        </Popover>
      </div>

      <RealtimeDataGrid data={MOCK_AIR_QUALITY_DATA} />
      <DataVisualization historicalData={filteredHistoricalData} />
      <Suspense fallback={<AIAnalyzerSkeleton t={t} />}>
        {children}
      </Suspense>
      
      <div id="printable-report-content-client" style={{ display: 'none' }}>
        <PrintableReport airQualityData={MOCK_AIR_QUALITY_DATA} aiAnalysis={aiAnalysisForReport} lng={lng} />
      </div>
    </div>
  );
}

