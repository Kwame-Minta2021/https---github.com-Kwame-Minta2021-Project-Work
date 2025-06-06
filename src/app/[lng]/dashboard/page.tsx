
// src/app/[lng]/dashboard/page.tsx
import React from 'react';
import DashboardClientContent from '@/components/dashboard/dashboard-client-content';
import AIAnalyzerSection from '@/components/dashboard/ai-analyzer-section';
import { MOCK_AIR_QUALITY_DATA } from '@/lib/constants';
import type { AnalyzeAirQualityInput } from '@/ai/flows/analyze-air-quality';
import type { CustomAlertSettings } from '@/types'; 


interface DashboardPageProps {
  params: { lng: string }; 
  customAlertSettings?: CustomAlertSettings; // Passed from layout
}


export default async function DashboardPage({ params, customAlertSettings }: DashboardPageProps) {
  const { lng } = await params;
  
  const rawSensorReadingsForAnalyzer: Omit<AnalyzeAirQualityInput, 'language'> = {
    co: MOCK_AIR_QUALITY_DATA.co.value,
    vocs: MOCK_AIR_QUALITY_DATA.vocs.value,
    ch4Lpg: MOCK_AIR_QUALITY_DATA.ch4Lpg.value,
    pm10: MOCK_AIR_QUALITY_DATA.pm1_0.value,
    pm25: MOCK_AIR_QUALITY_DATA.pm2_5.value,
    pm100: MOCK_AIR_QUALITY_DATA.pm10.value,
  };

  return (
    <DashboardClientContent 
      lng={lng}
      initialCustomAlertSettings={customAlertSettings || {}}
    >
      <AIAnalyzerSection readings={rawSensorReadingsForAnalyzer} lng={lng} />
    </DashboardClientContent>
  );
}
