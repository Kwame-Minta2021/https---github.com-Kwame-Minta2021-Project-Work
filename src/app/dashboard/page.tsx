import DashboardClientContent from '@/components/dashboard/dashboard-client-content';
import { MOCK_AIR_QUALITY_DATA } from '@/lib/constants';
import { analyzeAirQuality, type AnalyzeAirQualityOutput, type AnalyzeAirQualityInput } from '@/ai/flows/analyze-air-quality';
import type { PrintHandler } from './layout'; 
import type { AirQualityData } from '@/types';

interface DashboardPageProps {
  setPrintHandler?: (handler: PrintHandler) => void;
}

const getAIInput = (data: AirQualityData): AnalyzeAirQualityInput => ({
  co: data.co.value,
  vocs: data.vocs.value,
  ch4Lpg: data.ch4Lpg.value,
  pm10: data.pm1_0.value, 
  pm25: data.pm2_5.value,
  pm100: data.pm10.value,
});

async function fetchAIAnalysisForReport(): Promise<AnalyzeAirQualityOutput | null> {
  const aiInput = getAIInput(MOCK_AIR_QUALITY_DATA);
  try {
    const analysis = await analyzeAirQuality(aiInput);
    return analysis;
  } catch (error) {
    console.error("Failed to fetch AI analysis for report:", error);
    return null;
  }
}

export default async function DashboardPage({ setPrintHandler }: DashboardPageProps) {
  const aiAnalysisForReportData = await fetchAIAnalysisForReport();
  const aiInputForAnalyzerData = getAIInput(MOCK_AIR_QUALITY_DATA);

  return (
    <DashboardClientContent 
      setPrintHandler={setPrintHandler}
      aiAnalysisForReport={aiAnalysisForReportData}
      aiInputForAnalyzer={aiInputForAnalyzerData}
    />
  );
}

export const metadata = {
  title: "Dashboard | BreatheEasy",
  description: "Monitor your air quality in real-time.",
};
