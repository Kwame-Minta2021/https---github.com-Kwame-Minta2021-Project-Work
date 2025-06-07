// src/components/report/view-report-client.tsx
"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ArrowLeft, Download, Loader2 } from 'lucide-react';
import type { AnalyzeAirQualityOutput } from '@/ai/flows/analyze-air-quality';
import type { GenerateLocalityReportOutput } from '@/ai/flows/generate-locality-report-flow';
import type { ForecastAirQualityOutput } from '@/ai/flows/forecast-air-quality-flow';
import { Skeleton } from '../ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { fr, enUS } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface AirQualityReading {
  value: number;
  unit: string;
}

interface AirQualityData {
  co: AirQualityReading;
  vocs: AirQualityReading;
  ch4Lpg: AirQualityReading;
  pm1_0: AirQualityReading;
  pm2_5: AirQualityReading;
  pm10: AirQualityReading;
}

interface ViewReportClientProps {
  currentReadings: AirQualityData;
  aiAnalysis: AnalyzeAirQualityOutput | null;
  localityReport: GenerateLocalityReportOutput | null;
  weeklyForecast: ForecastAirQualityOutput | null;
  lng: string;
  translations: {
    pageTitle: string;
    aiAnalyzerTitle: string;
    rlModelAnalysisTitle: string;
    effectOnHumanHealthTitle: string;
    bestActionToReducePresenceTitle: string;
    localityReportTitle: string;
    airQualityForecastTitle: string;
    fetchingForecast: string;
    forecastNotAvailable: string;
    reportNoHealthImpactData: string;
    reportNoRecommendationsData: string;
    localityReportNotAvailable: string;
    backToDashboard: string;
    downloadReport: string;
    downloadingPdf: string;
    pdfDownloadedSuccess: string;
    pdfDownloadFailed: string;
    reportGeneratedOn: string;
  };
}

export default function ViewReportClient({
  currentReadings,
  aiAnalysis,
  localityReport,
  weeklyForecast,
  lng,
  translations,
}: ViewReportClientProps) {
  const { toast } = useToast();
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [reportGeneratedTimestamp, setReportGeneratedTimestamp] = useState<string | null>(null);

  useEffect(() => {
    // This effect runs only on the client after hydration
    setReportGeneratedTimestamp(
      format(new Date(), 'PPpp', { locale: lng === 'fr' ? fr : enUS })
    );
  }, [lng]); // Re-run if lng changes, though unlikely on this page

  const handleDownloadPdf = async () => {
    const element = document.getElementById('report-content-area');
    if (!element) {
      toast({
        variant: "destructive",
        title: translations.pdfDownloadFailed,
        description: "Report content area not found.",
      });
      return;
    }

    setIsDownloadingPdf(true);
    toast({
      title: translations.downloadingPdf,
      description: "Please wait while the PDF is being generated...",
    });

    try {
      // Dynamically import html2pdf.js only on the client-side
      const html2pdf = (await import('html2pdf.js')).default;

      const currentDate = format(new Date(), 'yyyy-MM-dd_HH-mm');
      const filename = `BreatheEasy_AirQualityReport_${currentDate}.pdf`;

      const options = {
        margin: [0.5, 0.5, 0.5, 0.5], // inches: top, left, bottom, right
        filename: filename,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, logging: false },
        jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' },
        pagebreak: { mode: ['avoid-all', 'css', 'legacy'] as any }
      };

      await html2pdf().from(element).set(options).save();
      
      toast({
        title: translations.pdfDownloadedSuccess,
        description: `${filename} has been downloaded.`,
      });

    } catch (error: any) {
      console.error("PDF Download Error:", error);
      toast({
        variant: "destructive",
        title: translations.pdfDownloadFailed,
        description: error?.message || "An unknown error occurred.",
      });
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/10">
      <div className="max-w-7xl mx-auto space-y-8 p-4 md:p-6 lg:p-8">
        <header className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-background/80 backdrop-blur-sm p-4 rounded-lg border shadow-sm">
          <div className="flex items-center gap-3">
            <Button asChild variant="ghost" size="icon" className="hover:bg-primary/10" aria-label={translations.backToDashboard}>
              <Link href={`/${lng}/dashboard`}>
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-primary">
                {translations.pageTitle}
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                {translations.reportGeneratedOn} {reportGeneratedTimestamp || '...'}
              </p>
            </div>
          </div>
          <Button 
            onClick={handleDownloadPdf} 
            disabled={isDownloadingPdf} 
            className="mt-4 sm:mt-0 w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            {isDownloadingPdf ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Download className="mr-2 h-4 w-4" />
            )}
            {translations.downloadReport}
          </Button>
        </header>

        <div id="report-content-area" className="space-y-8">
          {/* AI Analysis Section */}
          <section id="ai-analysis" className="scroll-mt-20">
            <h2 className="text-2xl font-semibold tracking-tight mb-4 text-primary">
              {translations.aiAnalyzerTitle}
            </h2>
            <Card className="shadow-lg border-primary/10 hover:shadow-xl transition-shadow duration-300">
              <CardHeader className="bg-primary/5 border-b border-primary/10">
                <CardTitle className="text-primary">
                  {translations.rlModelAnalysisTitle}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 p-6">
                {aiAnalysis ? (
                  <>
                    <div className="bg-muted/50 p-4 rounded-lg border border-border">
                      <h3 className="font-semibold text-lg mb-2 text-foreground">
                        {translations.effectOnHumanHealthTitle}
                      </h3>
                      <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                        {aiAnalysis.effectOnHumanHealth || translations.reportNoHealthImpactData}
                      </p>
                    </div>
                    <div className="bg-muted/50 p-4 rounded-lg border border-border">
                      <h3 className="font-semibold text-lg mb-2 text-foreground">
                        {translations.bestActionToReducePresenceTitle}
                      </h3>
                      <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                        {aiAnalysis.bestActionToReducePresence || translations.reportNoRecommendationsData}
                      </p>
                    </div>
                  </>
                ) : (
                  <div className="space-y-4">
                    <Skeleton className="h-6 w-1/2" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                    <hr className="my-4 border-border" />
                    <Skeleton className="h-6 w-1/2" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                )}
              </CardContent>
            </Card>
          </section>

          {/* Weekly Forecast Section */}
          <section id="weekly-forecast" className="scroll-mt-20">
            <h2 className="text-2xl font-semibold tracking-tight mb-4 text-primary">
              {translations.airQualityForecastTitle}
            </h2>
            <Card className="shadow-lg border-primary/10 hover:shadow-xl transition-shadow duration-300">
              <CardHeader className="bg-primary/5 border-b border-primary/10">
                <CardTitle className="text-primary">
                  {translations.airQualityForecastTitle}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {weeklyForecast ? (
                  <div className="bg-muted/50 p-4 rounded-lg border border-border">
                    <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                      {weeklyForecast.weeklyForecast || translations.forecastNotAvailable}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                    <p className="text-sm text-muted-foreground mt-2">{translations.fetchingForecast}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </section>

          {/* Locality Specific Report Section */}
          <section id="locality-report" className="scroll-mt-20">
            <h2 className="text-2xl font-semibold tracking-tight mb-4 text-primary">
              {translations.localityReportTitle}
            </h2>
            <Card className="shadow-lg border-primary/10 hover:shadow-xl transition-shadow duration-300">
              <CardHeader className="bg-primary/5 border-b border-primary/10">
                <CardTitle className="text-primary">
                  {translations.localityReportTitle}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {localityReport ? (
                  <div className="bg-muted/50 p-4 rounded-lg border border-border">
                    <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                      {localityReport.localitySpecificAdvice || translations.localityReportNotAvailable}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-5/6" />
                    <p className="text-sm text-muted-foreground mt-2">{translations.localityReportNotAvailable}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </section>
        </div>
      </div>
    </div>
  );
}

