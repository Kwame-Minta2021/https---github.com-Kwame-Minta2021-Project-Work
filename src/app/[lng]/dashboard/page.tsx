
import DashboardClientContent from '@/components/dashboard/dashboard-client-content';
import AIAnalyzerSection from '@/components/dashboard/ai-analyzer-section';
import { MOCK_AIR_QUALITY_DATA } from '@/lib/constants';
import { analyzeAirQuality, type AnalyzeAirQualityOutput, type AnalyzeAirQualityInput } from '@/ai/flows/analyze-air-quality';
import type { SetPrintHandlerType } from './layout'; 
import type { AirQualityData } from '@/types';

interface DashboardPageProps {
  setPrintHandler?: SetPrintHandlerType;
  params: { lng: string }; 
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

export default async function DashboardPage({ setPrintHandler, params: { lng } }: DashboardPageProps) {
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
    >
      <AIAnalyzerSection readings={rawSensorReadingsForAnalyzer} lng={lng} />
    </DashboardClientContent>
  );
}
