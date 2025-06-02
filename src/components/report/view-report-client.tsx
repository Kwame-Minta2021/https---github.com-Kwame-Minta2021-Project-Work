
// src/components/report/view-report-client.tsx
"use client";

import React, { useEffect, useRef, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import RealtimeDataCard from '@/components/dashboard/realtime-data-card';
import { Brain, MapPin, AlertCircle, CheckCircle2, CalendarDays, Thermometer, Video, AlertTriangle, Loader2 } from 'lucide-react';
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
  lng: string;
  translations: {
    pageTitle: string;
    mapPlaceholderText: string; // Will be replaced by aerial view title
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
    aerialViewMapTitle: string;
    aerialViewLoading: string;
    aerialViewProcessing: string;
    aerialViewNotFound: string;
    aerialViewPlayPauseHint: string;
    aerialViewError: string;
  };
}

// Default address for the aerial view demo
const AERIAL_VIEW_ADDRESS = '1600 Amphitheatre Parkway, Mountain View, CA 94043';
const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_API_KEY;

function videoIdOrAddress(value: string) {
  const videoIdRegex = /[0-9a-zA-Z-_]{22}/;
  return value.match(videoIdRegex) ? 'videoId' : 'address';
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

  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoSrc, setVideoSrc] = useState<string | null>(null);
  const [videoMessage, setVideoMessage] = useState<string>(translations.aerialViewLoading);
  const [videoStatusIcon, setVideoStatusIcon] = useState<React.ReactNode>(<Loader2 className="h-6 w-6 animate-spin text-primary" />);


  useEffect(() => {
    const initAerialView = async () => {
      if (!API_KEY) {
        setVideoMessage("API Key is missing. Cannot load Aerial View.");
        setVideoStatusIcon(<AlertTriangle className="h-6 w-6 text-destructive" />);
        console.error("Aerial View API Key is not configured.");
        return;
      }

      const parameterKey = videoIdOrAddress(AERIAL_VIEW_ADDRESS);
      const urlParameter = new URLSearchParams();
      urlParameter.set(parameterKey, AERIAL_VIEW_ADDRESS);
      urlParameter.set('key', API_KEY);

      try {
        const response = await fetch(`https://aerialview.googleapis.com/v1/videos:lookupVideo?${urlParameter.toString()}`);
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          console.error("Aerial View API error response:", response.status, errorData);
          setVideoMessage(translations.aerialViewError + ` (Status: ${response.status})`);
          setVideoStatusIcon(<AlertTriangle className="h-6 w-6 text-destructive" />);
          return;
        }
        const videoResult = await response.json();

        if (videoResult.state === 'PROCESSING') {
          setVideoMessage(translations.aerialViewProcessing);
          setVideoStatusIcon(<Loader2 className="h-6 w-6 animate-spin text-amber-500" />);
        } else if (videoResult.error && videoResult.error.code === 404) {
          setVideoMessage(translations.aerialViewNotFound);
          setVideoStatusIcon(<AlertTriangle className="h-6 w-6 text-destructive" />);
        } else if (videoResult.uris && videoResult.uris.MP4_MEDIUM && videoResult.uris.MP4_MEDIUM.landscapeUri) {
          setVideoSrc(videoResult.uris.MP4_MEDIUM.landscapeUri);
          setVideoMessage(""); // Clear message if video loads
          setVideoStatusIcon(null); // Clear icon
        } else {
          console.error("Aerial View API unexpected response:", videoResult);
          setVideoMessage(translations.aerialViewError);
          setVideoStatusIcon(<AlertTriangle className="h-6 w-6 text-destructive" />);
        }
      } catch (error) {
        console.error("Failed to fetch Aerial View video:", error);
        setVideoMessage(translations.aerialViewError);
        setVideoStatusIcon(<AlertTriangle className="h-6 w-6 text-destructive" />);
      }
    };

    initAerialView();
  }, [translations]);

  const handleVideoClick = () => {
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play();
      } else {
        videoRef.current.pause();
      }
    }
  };

  return (
    <div className="flex-1 space-y-8 p-4 md:p-6 lg:p-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">{translations.pageTitle}</h1>
      </header>

      {/* Aerial View Section */}
      <section id="map-location" className="scroll-mt-20">
        <Card className="shadow-lg overflow-hidden">
          <CardHeader>
            <CardTitle className="flex items-center">
              <MapPin className="h-6 w-6 mr-2 text-primary" />
              {translations.aerialViewMapTitle}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="aspect-video bg-muted flex items-center justify-center relative">
              {videoSrc ? (
                <video
                  ref={videoRef}
                  src={videoSrc}
                  onClick={handleVideoClick}
                  className="w-full h-full object-cover cursor-pointer"
                  controls={false}
                  loop
                  autoPlay
                  muted // Autoplay often requires muted
                />
              ) : (
                <div className="flex flex-col items-center justify-center text-center p-4">
                  {videoStatusIcon}
                  <p className="mt-2 text-sm text-muted-foreground">{videoMessage}</p>
                </div>
              )}
            </div>
            {videoSrc && <p className="p-4 text-xs text-muted-foreground text-center">{translations.aerialViewPlayPauseHint} (Demo address: {AERIAL_VIEW_ADDRESS})</p>}
             {!videoSrc && videoMessage !== translations.aerialViewLoading && <p className="p-4 text-xs text-muted-foreground text-center">(Demo address: {AERIAL_VIEW_ADDRESS})</p>}
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
