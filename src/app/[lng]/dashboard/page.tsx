
import DashboardClientContent from '@/components/dashboard/dashboard-client-content';
import AIAnalyzerSection from '@/components/dashboard/ai-analyzer-section';
import { MOCK_AIR_QUALITY_DATA } from '@/lib/constants';
import { analyzeAirQuality, type AnalyzeAirQualityOutput, type AnalyzeAirQualityInput } from '@/ai/flows/analyze-air-quality';
import type { PrintHandler } from './layout'; 
import type { AirQualityData } from '@/types';
import { getTranslations } from '@/i18n';

interface DashboardPageProps {
  setPrintHandler?: (handler: PrintHandler) => void;
  params: { lng: string }; // Add params with lng
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

export default async function DashboardPage({ setPrintHandler, params: { lng } }: DashboardPageProps) {
  const aiAnalysisForReportData = await fetchAIAnalysisForReport();
  const aiInputForAnalyzerData = getAIInput(MOCK_AIR_QUALITY_DATA);
  // const { t } = await getTranslations(lng, 'common'); // t function will be obtained in Client Component

  return (
    <DashboardClientContent 
      setPrintHandler={setPrintHandler}
      aiAnalysisForReport={aiAnalysisForReportData}
      lng={lng}
      // t={t} // Do not pass t function from Server Component
    >
      <AIAnalyzerSection readings={aiInputForAnalyzerData} lng={lng} />
    </DashboardClientContent>
  );
}

// Metadata generation can also be i18n-aware if needed
// export const metadata = {
// title: "Dashboard | BreatheEasy",
// description: "Monitor your air quality in real-time.",
// };
