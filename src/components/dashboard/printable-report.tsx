
import React, { useState, useEffect } from 'react';
import type { AirQualityData } from '@/types';
import type { AnalyzeAirQualityOutput } from '@/ai/flows/analyze-air-quality';
import { format } from 'date-fns';
import { Brain } from 'lucide-react'; // Assuming Brain icon is appropriate

interface PrintableReportProps {
  airQualityData: AirQualityData;
  aiAnalysis: AnalyzeAirQualityOutput | null;
}

const PrintableReport = React.forwardRef<HTMLDivElement, PrintableReportProps>(
  ({ airQualityData, aiAnalysis }, ref) => {
    const [generatedOnTimestamp, setGeneratedOnTimestamp] = useState<string | null>(null);

    useEffect(() => {
      // Set the timestamp only on the client side after hydration
      setGeneratedOnTimestamp(format(new Date(), 'MMMM dd, yyyy HH:mm:ss'));
    }, []); // Empty dependency array ensures this runs once on mount (client-side)

    const sensorReadings = [
      airQualityData.co,
      airQualityData.vocs,
      airQualityData.ch4Lpg,
      airQualityData.pm1_0,
      airQualityData.pm2_5,
      airQualityData.pm10,
    ];

    return (
      <div ref={ref} className="p-8 font-sans text-sm bg-white text-black">
        <header className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-primary mb-2" style={{ color: '#64B5F6' }}>BreatheEasy Air Quality Report</h1>
          {generatedOnTimestamp && (
            <p className="text-gray-600">
              Generated on: {generatedOnTimestamp}
            </p>
          )}
          <p className="text-gray-600">
            Readings Timestamp: {format(airQualityData.timestamp, 'MMMM dd, yyyy HH:mm:ss')}
          </p>
        </header>

        <section className="mb-8">
          <h2 className="text-xl font-semibold border-b-2 border-primary pb-2 mb-4" style={{ color: '#64B5F6', borderColor: '#64B5F6' }}>
            Sensor Readings
          </h2>
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="border p-2 text-left">Pollutant</th>
                <th className="border p-2 text-right">Value</th>
                <th className="border p-2 text-left">Unit</th>
              </tr>
            </thead>
            <tbody>
              {sensorReadings.map((reading) => (
                <tr key={reading.id}>
                  <td className="border p-2">{reading.name}</td>
                  <td className="border p-2 text-right">{reading.value.toFixed(2)}</td>
                  <td className="border p-2">{reading.unit}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        {aiAnalysis && (
          <section>
            <h2 className="text-xl font-semibold border-b-2 border-primary pb-2 mb-4 flex items-center" style={{ color: '#64B5F6', borderColor: '#64B5F6' }}>
              {/* Using an inline SVG for Brain icon if lucide-react Brain is not directly usable or for style consistency in PDF */}
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v0A2.5 2.5 0 0 1 9.5 7h-3A2.5 2.5 0 0 1 4 4.5v0A2.5 2.5 0 0 1 6.5 2Z"></path><path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v0A2.5 2.5 0 0 0 14.5 7h3A2.5 2.5 0 0 0 20 4.5v0A2.5 2.5 0 0 0 17.5 2Z"></path><path d="M4.2 7.5A2.5 2.5 0 0 0 2 10v0a2.5 2.5 0 0 0 2.5 2.5H6"></path><path d="M19.8 7.5A2.5 2.5 0 0 1 22 10v0a2.5 2.5 0 0 1-2.5 2.5H18"></path><path d="M6 12.5A2.5 2.5 0 0 0 3.5 15v0A2.5 2.5 0 0 0 6 17.5h3A2.5 2.5 0 0 0 11.5 15v0A2.5 2.5 0 0 0 9 12.5Z"></path><path d="M18 12.5a2.5 2.5 0 0 1 2.5 2.5v0a2.5 2.5 0 0 1-2.5 2.5h-3a2.5 2.5 0 0 1-2.5-2.5v0a2.5 2.5 0 0 1 2.5-2.5Z"></path><path d="M9 17.5A2.5 2.5 0 0 0 6.5 20v0a2.5 2.5 0 0 0 2.5 2.5h3A2.5 2.5 0 0 0 14.5 20v0a2.5 2.5 0 0 0-2.5-2.5Z"></path><path d="M14.5 17.5a2.5 2.5 0 0 1 2.5 2.5v0a2.5 2.5 0 0 1-2.5 2.5h-3a2.5 2.5 0 0 1-2.5-2.5v0a2.5 2.5 0 0 1 2.5-2.5Z"></path></svg>
              RL Model Analysis
            </h2>
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-2 text-gray-700">Effect on Human Health</h3>
              <p className="text-gray-800 whitespace-pre-line leading-relaxed">
                {aiAnalysis.effectOnHumanHealth || 'No health impact analysis available.'}
              </p>
            </div>
            <div>
              <h3 className="text-lg font-medium mb-2 text-gray-700">Best Action to Reduce Presence</h3>
              <p className="text-gray-800 whitespace-pre-line leading-relaxed">
                {aiAnalysis.bestActionToReducePresence || 'No recommendations available.'}
              </p>
            </div>
          </section>
        )}

        <footer className="mt-12 pt-4 border-t text-center text-xs text-gray-500">
          <p>BreatheEasy Dashboard - Your partner in healthier environments.</p>
        </footer>
      </div>
    );
  }
);

PrintableReport.displayName = 'PrintableReport';
export default PrintableReport;

