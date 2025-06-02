
// src/components/report/view-report-client.tsx
"use client";

import React from 'react';
import Image from 'next/image';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import RealtimeDataCard from '@/components/dashboard/realtime-data-card';
import { Brain, MapPin, AlertCircle, CheckCircle2, CalendarDays, Thermometer } from 'lucide-react';
import type { AirQualityData } from '@/types';
import type { AnalyzeAirQualityOutput } from '@/ai/flows/analyze-air-quality';
import type { GenerateLocalityReportOutput } from '@/ai/flows/generate-locality-report-flow';
import type { ForecastAirQualityOutput } from '@/ai/flows/forecast-air-quality-flow';
import { Skeleton } from '../ui/skeleton';

interface ViewReportClientProps {
  currentReadings: AirQualityData;
  aiAnalysis: AnalyzeAirQualityOutput | null;
  localityReport: GenerateLocalityReportOutput | null;
  weeklyForecast: ForecastAirQualityOutput | null;
  lng: string; // For potential client-side translations if needed, though primarily using passed translations
  translations: {
    pageTitle: string;
    mapPlaceholderText: string;
    currentSensorReadingsTitle: string;
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
  const sensorReadingsArray = [
    currentReadings.co,
    currentReadings.vocs,
    currentReadings.ch4Lpg,
    currentReadings.pm1_0,
    currentReadings.pm2_5,
    currentReadings.pm10,
  ];

  return (
    <div className="flex-1 space-y-8 p-4 md:p-6 lg:p-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">{translations.pageTitle}</h1>
      </header>

      {/* Map Placeholder Section */}
      <section id="map-location" className="scroll-mt-20">
        <Card className="shadow-lg overflow-hidden">
          <CardHeader>
            <CardTitle className="flex items-center">
              <MapPin className="h-6 w-6 mr-2 text-primary" />
              Current Location
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="aspect-video bg-muted flex items-center justify-center">
              <Image
                src="https://placehold.co/800x450.png/EBF4FF/2C5282?text=Map+Placeholder"
                alt={translations.mapPlaceholderText}
                width={800}
                height={450}
                className="object-cover w-full h-full"
                data-ai-hint="world map"
              />
            </div>
            <p className="p-4 text-sm text-muted-foreground">{translations.mapPlaceholderText} Further development needed for live map integration.</p>
          </CardContent>
        </Card>
      </section>

      {/* Current Readings Section */}
      <section id="current-readings" className="scroll-mt-20">
        <h2 className="text-2xl font-semibold tracking-tight mb-4">{translations.currentSensorReadingsTitle}</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {sensorReadingsArray.map((reading) => (
            <RealtimeDataCard key={reading.id} reading={reading} />
          ))}
        </div>
      </section>

      {/* AI Analysis Section */}
      <section id="ai-analysis" className="scroll-mt-20">
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
      <section id="weekly-forecast" className="scroll-mt-20">
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
  );
}

