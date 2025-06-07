// src/app/[lng]/view-report/page.tsx
import React from 'react';
import ViewReportClient from '@/components/report/view-report-client';
import { MOCK_AIR_QUALITY_DATA } from '@/lib/constants';
import { analyzeAirQuality, type AnalyzeAirQualityOutput, type AnalyzeAirQualityInput } from '@/ai/flows/analyze-air-quality';
import { generateLocalityReport, type GenerateLocalityReportOutput, type GenerateLocalityReportInput } from '@/ai/flows/generate-locality-report-flow';
import { forecastAirQuality, type ForecastAirQualityOutput, type ForecastAirQualityInput } from '@/ai/flows/forecast-air-quality-flow';
import { getTranslations } from '@/i18n';
import type { Metadata } from 'next';

interface ViewReportPageProps {
  params: {
    lng: string;
  };
  searchParams: { [key: string]: string | string[] | undefined };
}

export async function generateMetadata(
  { params }: ViewReportPageProps
): Promise<Metadata> {
  const { t } = await getTranslations(params.lng, 'common');
  return {
    title: t('viewReportPageTitle'),
  };
}

const getAIInput = (data: typeof MOCK_AIR_QUALITY_DATA, language: string): AnalyzeAirQualityInput => ({
  co: data.co.value,
  vocs: data.vocs.value,
  ch4Lpg: data.ch4Lpg.value,
  pm10: data.pm1_0.value,
  pm25: data.pm2_5.value,
  pm100: data.pm10.value,
  language: language,
});

const getLocalityReportInput = (data: typeof MOCK_AIR_QUALITY_DATA, language: string): GenerateLocalityReportInput => ({
  co: data.co.value,
  vocs: data.vocs.value,
  ch4Lpg: data.ch4Lpg.value,
  pm1_0: data.pm1_0.value,
  pm2_5: data.pm2_5.value,
  pm10: data.pm10.value,
  language: language,
});

const getForecastInput = (data: typeof MOCK_AIR_QUALITY_DATA, language: string): ForecastAirQualityInput => ({
  language: language,
  currentCO: data.co.value,
  currentVOCs: data.vocs.value,
  currentPM25: data.pm2_5.value,
});

async function fetchDataForReport(lng: string): Promise<{
  currentAnalysis: AnalyzeAirQualityOutput | null;
  localityReport: GenerateLocalityReportOutput | null;
  weeklyForecast: ForecastAirQualityOutput | null;
}> {
  const aiInput = getAIInput(MOCK_AIR_QUALITY_DATA, lng);
  const localityInput = getLocalityReportInput(MOCK_AIR_QUALITY_DATA, lng);
  const forecastInput = getForecastInput(MOCK_AIR_QUALITY_DATA, lng);

  let currentAnalysis: AnalyzeAirQualityOutput | null = null;
  let localityReport: GenerateLocalityReportOutput | null = null;
  let weeklyForecast: ForecastAirQualityOutput | null = null;

  try {
    currentAnalysis = await analyzeAirQuality(aiInput);
  } catch (error) {
    console.error("Failed to fetch AI analysis for report:", error);
  }

  try {
    localityReport = await generateLocalityReport(localityInput);
  } catch (error) {
    console.error("Failed to fetch locality report:", error);
  }

  try {
    weeklyForecast = await forecastAirQuality(forecastInput);
  } catch (error) {
    console.error("Failed to fetch weekly forecast:", error);
  }
  
  return { currentAnalysis, localityReport, weeklyForecast };
}

export default async function ViewReportPage({ params: { lng } }: ViewReportPageProps) {
  const { currentAnalysis, localityReport, weeklyForecast } = await fetchDataForReport(lng);
  const { t } = await getTranslations(lng, 'common');

  return (
    <ViewReportClient
      currentReadings={MOCK_AIR_QUALITY_DATA}
      aiAnalysis={currentAnalysis}
      localityReport={localityReport}
      weeklyForecast={weeklyForecast}
      lng={lng}
      translations={{
        pageTitle: t('viewReportPageTitle'),
        aiAnalyzerTitle: t('aiAnalyzer'),
        rlModelAnalysisTitle: t('rlModelAnalysis'),
        effectOnHumanHealthTitle: t('effectOnHumanHealth'),
        bestActionToReducePresenceTitle: t('bestActionToReducePresence'),
        localityReportTitle: t('localityReportTitle'),
        airQualityForecastTitle: t('airQualityForecastTitle'),
        fetchingForecast: t('fetchingForecast'),
        forecastNotAvailable: t('forecastNotAvailable'),
        reportNoHealthImpactData: t('reportNoHealthImpactData'),
        reportNoRecommendationsData: t('reportNoRecommendationsData'),
        localityReportNotAvailable: t('localityReportNotAvailable'),
        backToDashboard: t('backToDashboard'),
        downloadReport: t('downloadReport'),
        downloadingPdf: t('downloadingPdf'),
        pdfDownloadedSuccess: t('pdfDownloadedSuccess'),
        pdfDownloadFailed: t('pdfDownloadFailed'),
        reportGeneratedOn: t('reportGeneratedOn'),
      }}
    />
  );
}
