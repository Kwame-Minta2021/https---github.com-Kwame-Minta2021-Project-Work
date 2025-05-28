import React from 'react';
import type { AirQualityData } from '@/types';
import type { AnalyzeAirQualityOutput } from '@/ai/flows/analyze-air-quality';
import { format } from 'date-fns';

interface PrintableReportProps {
  airQualityData: AirQualityData;
  aiAnalysis: AnalyzeAirQualityOutput | null;
}

const PrintableReport = React.forwardRef<HTMLDivElement, PrintableReportProps>(
  ({ airQualityData, aiAnalysis }, ref) => {
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
          <h1 className="text-3xl font-bold text-primary mb-2">BreatheEasy Air Quality Report</h1>
          <p className="text-gray-600">
            Generated on: {format(new Date(), 'MMMM dd, yyyy HH:mm:ss')}
          </p>
          <p className="text-gray-600">
            Readings Timestamp: {format(airQualityData.timestamp, 'MMMM dd, yyyy HH:mm:ss')}
          </p>
        </header>

        <section className="mb-8">
          <h2 className="text-xl font-semibold border-b-2 border-primary pb-2 mb-4 text-primary">
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
            <h2 className="text-xl font-semibold border-b-2 border-primary pb-2 mb-4 text-primary">
              AI Analysis
            </h2>
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-2 text-gray-700">Potential Health Impact</h3>
              <p className="text-gray-800 whitespace-pre-line leading-relaxed">
                {aiAnalysis.healthImpact || 'No health impact analysis available.'}
              </p>
            </div>
            <div>
              <h3 className="text-lg font-medium mb-2 text-gray-700">Recommended Actions</h3>
              <p className="text-gray-800 whitespace-pre-line leading-relaxed">
                {aiAnalysis.recommendations || 'No recommendations available.'}
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
