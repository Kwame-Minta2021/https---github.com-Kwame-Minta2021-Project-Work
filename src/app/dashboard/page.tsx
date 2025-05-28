import { Suspense } from 'react';
import RealtimeDataGrid from '@/components/dashboard/realtime-data-grid';
import DataVisualization from '@/components/dashboard/data-visualization';
import AIAnalyzerSection from '@/components/dashboard/ai-analyzer-section';
import PrintableReport from '@/components/dashboard/printable-report';
import { MOCK_AIR_QUALITY_DATA } from '@/lib/constants';
import { analyzeAirQuality, type AnalyzeAirQualityOutput } from '@/ai/flows/analyze-air-quality';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import type { PrintHandler } from './layout'; // Assuming type is exported from layout

interface DashboardPageProps {
  setPrintHandler?: (handler: PrintHandler) => void;
}

// Helper to prepare AI input from MOCK_AIR_QUALITY_DATA
const getAIInput = (data: typeof MOCK_AIR_QUALITY_DATA) => ({
  co: data.co.value,
  vocs: data.vocs.value,
  ch4Lpg: data.ch4Lpg.value,
  pm10: data.pm1_0.value, // Note: schema uses pm10 for PM1.0, pm25 for PM2.5, pm100 for PM10
  pm25: data.pm2_5.value,
  pm100: data.pm10.value,
});

// Server component to fetch AI analysis data
async function AIAnalysisDataFetcher() {
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
  const aiInputForAnalyzer = getAIInput(MOCK_AIR_QUALITY_DATA);
  const aiAnalysisForReport = await AIAnalysisDataFetcher();

  if (typeof setPrintHandler === 'function') {
    const handlePrintRequest = () => {
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write('<html><head><title>BreatheEasy Report</title>');
        // It's tricky to apply full Tailwind styling here easily.
        // For a real app, use a dedicated CSS for print or a library that converts HTML to PDF with styles.
        printWindow.document.write('<style>body { font-family: sans-serif; margin: 20px; } table { width: 100%; border-collapse: collapse; } th, td { border: 1px solid #ddd; padding: 8px; text-align: left; } h1,h2,h3 { color: #64B5F6; } .whitespace-pre-line { white-space: pre-line; } </style>');
        printWindow.document.write('</head><body>');
        
        // This is a simplified approach. For complex components, you'd need to render them to string or use a library.
        // For now, we extract data and structure it manually for the print window.
        
        const reportElement = document.getElementById('printable-report-content');
        if (reportElement) {
            printWindow.document.write(reportElement.innerHTML);
        } else {
            // Fallback if the hidden div is not found (should not happen)
            printWindow.document.write('<h1>Report Content Not Found</h1>');
        }

        printWindow.document.write('</body></html>');
        printWindow.document.close();
        printWindow.print();
      }
    };
    setPrintHandler(handlePrintRequest);
  }


  return (
    <div className="flex-1 space-y-6 p-4 md:p-6 lg:p-8">
      <RealtimeDataGrid data={MOCK_AIR_QUALITY_DATA} />
      <DataVisualization />
      <Suspense fallback={<AIAnalyzerSkeleton />}>
        <AIAnalyzerSection readings={aiInputForAnalyzer} />
      </Suspense>
      
      {/* Hidden div for report content */}
      <div id="printable-report-content" style={{ display: 'none' }}>
        <PrintableReport airQualityData={MOCK_AIR_QUALITY_DATA} aiAnalysis={aiAnalysisForReport} />
      </div>
    </div>
  );
}


function AIAnalyzerSkeleton() {
  return (
    <section id="analyzer-skeleton" className="mb-8 scroll-mt-20">
      <h2 className="text-2xl font-semibold tracking-tight mb-4">AI Analyzer</h2>
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Health Impact & Recommendations</CardTitle>
          <CardDescription>
            AI-powered insights based on current air quality readings.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="font-semibold text-lg mb-2">Potential Health Impact</h3>
            <Skeleton className="h-4 w-3/4 mb-2" />
            <Skeleton className="h-4 w-1/2" />
          </div>
          <hr className="my-4" />
          <div>
            <h3 className="font-semibold text-lg mb-2">Recommended Actions</h3>
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-5/6 mb-2" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </CardContent>
      </Card>
    </section>
  );
}

// Ensure metadata for this page if needed, though layout.tsx covers global metadata.
export const metadata = {
  title: "Dashboard | BreatheEasy",
  description: "Monitor your air quality in real-time.",
};
