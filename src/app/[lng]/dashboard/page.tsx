
// src/app/[lng]/dashboard/page.tsx
import React from 'react';
import DashboardClientContent from '@/components/dashboard/dashboard-client-content';
import AIAnalyzerSection from '@/components/dashboard/ai-analyzer-section';
import { MOCK_AIR_QUALITY_DATA } from '@/lib/constants';
import { analyzeAirQuality, type AnalyzeAirQualityOutput, type AnalyzeAirQualityInput } from '@/ai/flows/analyze-air-quality';
import { sendShortAlertSms, type SendShortAlertInput } from '@/ai/flows/send-short-alert-sms-flow';
import type { SetPrintHandlerType } from './layout'; 
import type { AirQualityData, CustomAlertSettings } from '@/types';
import { toast } from '@/hooks/use-toast'; // Direct import for server component usage (will be used client-side effectively)
import { getTranslations } from '@/i18n';


interface DashboardPageProps {
  setPrintHandler?: SetPrintHandlerType;
  params: { lng: string }; 
  // This prop will be passed from DashboardLayout after being cloned
  customAlertSettings?: CustomAlertSettings; 
}

const getAIInput = (data: AirQualityData, language: string): AnalyzeAirQualityInput => ({
  co: data.co.value,
  vocs: data.vocs.value,
  ch4Lpg: data.ch4Lpg.value,
  pm10: data.pm1_0.value, 
  pm25: data.pm2_5.value,
  pm100: data.pm10.value,
  language: language,
});

async function fetchAIAnalysisForReport(lng: string): Promise<AnalyzeAirQualityOutput | null> {
  const aiInput = getAIInput(MOCK_AIR_QUALITY_DATA, lng);
  try {
    const analysis = await analyzeAirQuality(aiInput);
    return analysis;
  } catch (error: any) {
    console.error("Failed to fetch AI analysis for report. Raw error object:", error);
    if (error instanceof Error) {
      console.error("Error message:", error.message);
      console.error("Error name:", error.name);
      if (error.stack) {
        console.error("Error stack:", error.stack);
      }
    } else if (typeof error === 'object' && error !== null) {
      for (const key in error) {
        if (Object.prototype.hasOwnProperty.call(error, key)) {
          console.error(`Error property - ${key}:`, (error as any)[key]);
        }
      }
    }
    return null;
  }
}

// This function will effectively run on the client after hydration because of toast and localStorage access.
// We'll manage its invocation from a client component or useEffect within DashboardClientContent.
const checkAlertsAndNotify = (
  lng: string, 
  currentSettings: CustomAlertSettings, 
  airData: AirQualityData,
  t: (key: string, options?: any) => string
) => {
  // Check custom CO threshold
  if (currentSettings.co?.enabled && airData.co.value > currentSettings.co.threshold) {
    toast({
      title: t('customThresholdAlertTitle'),
      description: t('customCOAlertDesc', { 
        value: airData.co.value.toFixed(2), 
        threshold: currentSettings.co.threshold.toFixed(2),
        unit: 'ppm' 
      }),
      variant: 'warning', 
    });
  }

  // Check custom PM2.5 threshold
  if (currentSettings.pm2_5?.enabled && airData.pm2_5.value > currentSettings.pm2_5.threshold) {
    toast({
      title: t('customThresholdAlertTitle'),
      description: t('customPM25AlertDesc', { 
        value: airData.pm2_5.value.toFixed(0), 
        threshold: currentSettings.pm2_5.threshold.toFixed(0),
        unit: 'µg/m³'
      }),
      variant: 'warning',
    });
  }

  // Check for predefined unhealthy thresholds for SMS
  Object.values(airData).forEach(pollutant => {
    if (typeof pollutant === 'object' && pollutant.thresholds?.unhealthy && pollutant.value > pollutant.thresholds.unhealthy) {
      const smsInput: SendShortAlertInput = {
        pollutantName: pollutant.name.split(' ')[0], // e.g., "CO" from "CO (MQ-9)"
        currentValue: pollutant.value,
        thresholdValue: pollutant.thresholds.unhealthy,
        unit: pollutant.unit,
        language: lng,
      };
      sendShortAlertSms(smsInput)
        .then(result => {
          console.log(`SMS alert attempt for ${pollutant.name}: ${result.status}`);
          // Optionally toast about SMS attempt, but might be too noisy
          // toast({ title: t('smsAlertAttemptTitle'), description: t('smsAlertAttemptDesc', { pollutant: pollutant.name, status: result.status }) });
        })
        .catch(error => {
          console.error(`Failed to send SMS alert for ${pollutant.name}:`, error);
        });
    }
  });
};


export default async function DashboardPage({ setPrintHandler, params: { lng }, customAlertSettings }: DashboardPageProps) {
  const { t } = await getTranslations(lng, 'common');
  const aiAnalysisForReportData = await fetchAIAnalysisForReport(lng);
  
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
      setPrintHandler={setPrintHandler}
      aiAnalysisForReport={aiAnalysisForReportData}
      lng={lng}
      initialCustomAlertSettings={customAlertSettings || {}} // Pass down settings from layout
      onInitialLoad={(settings) => {
         // This callback allows DashboardClientContent to trigger checks after it mounts
         checkAlertsAndNotify(lng, settings, MOCK_AIR_QUALITY_DATA, t);
         if(aiAnalysisForReportData) {
            toast({ title: t('aiAnalysisUpdatedTitle'), description: t('aiAnalysisUpdatedDesc') });
         }
      }}
    >
      <AIAnalyzerSection readings={rawSensorReadingsForAnalyzer} lng={lng} />
    </DashboardClientContent>
  );
}
