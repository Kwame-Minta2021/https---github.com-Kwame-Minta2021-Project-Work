// src/components/report/view-report-client.tsx
"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Brain, AlertCircle, CheckCircle2, CalendarDays, Thermometer, ArrowLeft, Download, Loader2 } from 'lucide-react';
import type { AirQualityData } from '@/types';
import type { AnalyzeAirQualityOutput } from '@/ai/flows/analyze-air-quality';
import type { GenerateLocalityReportOutput } from '@/ai/flows/generate-locality-report-flow';
import type { ForecastAirQualityOutput } from '@/ai/flows/forecast-air-quality-flow';
import { Skeleton } from '../ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import html2pdf from 'html2pdf.js';
import { format } from 'date-fns';

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

  const handleDownloadPdf = () => {
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

    html2pdf().from(element).set(options).save()
      .then(() => {
        toast({
          title: translations.pdfDownloadedSuccess,
          description: `${filename} has been downloaded.`,
        });
      })
      .catch((error) => {
        console.error("PDF Download Error:", error);
        toast({
          variant: "destructive",
          title: translations.pdfDownloadFailed,
          description: error?.message || "An unknown error occurred.",
        });
      })
      .finally(() => {
        setIsDownloadingPdf(false);
      });
  };

  return (
    <div className="flex-1 space-y-8 p-4 md:p-6 lg:p-8">
      <header className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <Link href={`/${lng}/dashboard`} passHref>
            <Button variant="outline" size="icon" aria-label={translations.backToDashboard}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{translations.pageTitle}</h1>
            <p className="text-sm text-muted-foreground">
              {translations.reportGeneratedOn} {format(new Date(), 'PPpp', { locale: lng === 'fr' ? require('date-fns/locale/fr') : require('date-fns/locale/en-US') })}
            </p>
          </div>
        </div>
        <Button onClick={handleDownloadPdf} disabled={isDownloadingPdf} className="mt-4 sm:mt-0 w-full sm:w-auto">
          {isDownloadingPdf ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Download className="mr-2 h-4 w-4" />
          )}
          {translations.downloadReport}
        </Button>
      </header>

      <div id="report-content-area">
        {/* AI Analysis Section */}
        <section id="ai-analysis" className="scroll-mt-20 mb-8">
          <h2 className="text-2xl font-semibold tracking-tight mb-4">{translations.aiAnalyzerTitle}</h2>
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-6 w-6 text-primary" />
                {translations.rlModelAnalysisTitle}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {aiAnalysis ? (
                <>
                  <div>
                    <h3 className="font-semibold text-lg mb-2 flex items-center">
                      <AlertCircle className="h-5 w-5 mr-2 text-amber-600" />
                      {translations.effectOnHumanHealthTitle}
                    </h3>
                    <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-line">
                      {aiAnalysis.effectOnHumanHealth || translations.reportNoHealthImpactData}
                    </p>
                  </div>
                  <hr className="my-4 border-border" />
                  <div>
                    <h3 className="font-semibold text-lg mb-2 flex items-center">
                      <CheckCircle2 className="h-5 w-5 mr-2 text-green-600" />
                      {translations.bestActionToReducePresenceTitle}
                    </h3>
                    <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-line">
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
        <section id="weekly-forecast" className="scroll-mt-20 mb-8">
          <h2 className="text-2xl font-semibold tracking-tight mb-4">{translations.airQualityForecastTitle}</h2>
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarDays className="h-6 w-6 text-primary" />
                {translations.airQualityForecastTitle}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {weeklyForecast ? (
                <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-line">
                  {weeklyForecast.weeklyForecast || translations.forecastNotAvailable}
                </p>
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
          <h2 className="text-2xl font-semibold tracking-tight mb-4">{translations.localityReportTitle}</h2>
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Thermometer className="h-6 w-6 text-primary" />
                {translations.localityReportTitle}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {localityReport ? (
                <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-line">
                  {localityReport.localitySpecificAdvice || translations.localityReportNotAvailable}
                </p>
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
  );
}
