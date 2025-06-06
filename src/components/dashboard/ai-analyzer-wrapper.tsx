
'use client';

import React, { useState, useEffect } from 'react';
import AIAnalyzerSection from './ai-analyzer-section';
import { subscribeToRealtimeData } from '@/lib/firebase-data';
import type { AirQualityData, AnalyzeAirQualityInput } from '@/types';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useTranslation } from 'react-i18next';

interface AIAnalyzerWrapperProps {
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

export default function AIAnalyzerWrapper({ lng }: AIAnalyzerWrapperProps) {
  const { t } = useTranslation();
  const [realtimeData, setRealtimeData] = useState<AirQualityData | null>(null);

  useEffect(() => {
    console.log("AIAnalyzerWrapper: Setting up Firebase real-time data subscription");
    const unsubscribe = subscribeToRealtimeData((data) => {
      if (data) {
        setRealtimeData(data);
        console.log("AIAnalyzerWrapper: Received real-time data for AI analysis:", data);
      }
    });

    return () => {
      console.log("AIAnalyzerWrapper: Cleaning up Firebase subscription");
      unsubscribe();
    };
  }, []);

  if (!realtimeData) {
    return <AIAnalyzerSkeleton t={t} />;
  }

  const rawSensorReadingsForAnalyzer: Omit<AnalyzeAirQualityInput, 'language'> = {
    co: realtimeData.co.value,
    vocs: realtimeData.vocs.value,
    ch4Lpg: realtimeData.ch4Lpg.value,
    pm10: realtimeData.pm1_0.value,
    pm25: realtimeData.pm2_5.value,
    pm100: realtimeData.pm10.value,
  };

  return (
    <AIAnalyzerSection readings={rawSensorReadingsForAnalyzer} lng={lng} />
  );
}
