
// src/components/dashboard/dashboard-client-content.tsx
'use client';

import React from 'react';
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
import type { SetPrintHandlerType } from '@/app/[lng]/dashboard/layout'; 
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
  const reportContentRef = React.useRef<HTMLDivElement>(null);
  
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
          console.warn("DashboardClientContent: Error parsing historical data timestamp", point.timestamp, e);
          return false;
        }
      });
    } else {
      // Default to last 7 days if date range is not fully set
      const defaultStartDate = startOfDay(subDays(new Date(), 6));
      const defaultEndDate = endOfDay(new Date());
       newFilteredData = ALL_MOCK_HISTORICAL_DATA.filter(point => {
        try {
          const pointDate = parseISO(point.timestamp);
          return isWithinInterval(pointDate, { start: defaultStartDate, end: defaultEndDate });
        } catch (e) {
          console.warn("DashboardClientContent: Error parsing historical data timestamp (default range)", point.timestamp, e);
          return false;
        }
      });
    }
    setFilteredHistoricalData(newFilteredData);
  }, [date]);

  React.useEffect(() => {
    console.log("DashboardClientContent: useEffect for print handler setup. typeof setPrintHandler:", typeof setPrintHandler, "reportContentRef.current available:", !!reportContentRef.current, "lng:", lng);

    if (typeof setPrintHandler === 'function') {
      if (reportContentRef.current) {
        const handleGeneratePdf = async () => {
          console.log("DashboardClientContent: Attempting to generate PDF with html2pdf.js. reportContentRef exists:", !!reportContentRef.current);
          
          const html2pdfModule = await import('html2pdf.js');
          const html2pdf = html2pdfModule.default;

          if (reportContentRef.current && html2pdf) {
            const element = reportContentRef.current;
            const timestamp = format(new Date(), 'yyyyMMdd_HHmmss');
            const filename = `BreatheEasy_Report_${timestamp}.pdf`;
            
            console.log("DashboardClientContent: html2pdf.js loaded. Element to print:", element);

            const opt = {
              margin:       0.5, // inches
              filename:     filename,
              image:        { type: 'jpeg', quality: 0.98 },
              html2canvas:  { scale: 2, useCORS: true, logging: false, letterRendering: true, width: element.scrollWidth, height: element.scrollHeight },
              jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' },
              pagebreak:    { mode: ['avoid-all', 'css', 'legacy'] }
            };

            try {
              await html2pdf().from(element).set(opt).save();
              console.log("DashboardClientContent: PDF generation and download initiated.");
            } catch (pdfError) {
              console.error("DashboardClientContent: html2pdf.js error:", pdfError);
              alert(t('pdfGenerationErrorGeneric') || "An error occurred while generating the PDF.");
            }
          } else {
            console.error('DashboardClientContent: Printable report content ref is not available or html2pdf failed to load. reportContentRef:', reportContentRef.current, "html2pdf library:", html2pdf);
            alert(t('reportContentMissingError') || 'Error: Report content not found or PDF library failed. Cannot generate PDF.');
          }
        };
        
        setPrintHandler(handleGeneratePdf);
        console.log("DashboardClientContent: PDF generation handler (using html2pdf.js) has been SET.");
        
        return () => {
          setPrintHandler(null);
          console.log("DashboardClientContent: PDF generation handler has been UNSET (cleanup).");
        };
      } else {
        console.warn("DashboardClientContent: reportContentRef.current is NOT available YET. Print handler not set. This is normal on initial mount or if child hasn't rendered ref yet.");
        setPrintHandler(null); 
      }
    } else {
      console.warn("DashboardClientContent: setPrintHandler prop is not a function. Print functionality will be disabled.");
      if (typeof setPrintHandler === 'function') { // Defensive check, though covered by outer if
        setPrintHandler(null);
      }
    }
  // Using lng and t in the dependency array for cases where translations might affect the PDF filename or error messages.
  // setPrintHandler is also a dependency.
  // We deliberately EXCLUDE aiAnalysisForReport to prevent re-setting the handler unnecessarily when only AI data changes.
  // The PDF report will re-render with new aiAnalysisForReport via normal React rendering flow.
  }, [setPrintHandler, t, lng, reportContentRef]); 

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
      
      <div style={{ position: 'absolute', left: '-9999px', top: '-9999px', width: '8.5in', backgroundColor: 'white', color: '#333' }}>
        <PrintableReport ref={reportContentRef} airQualityData={MOCK_AIR_QUALITY_DATA} aiAnalysis={aiAnalysisForReport} lng={lng} />
      </div>
    </div>
  );
}

