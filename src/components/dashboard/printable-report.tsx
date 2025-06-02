
"use client"; 
import React, { useState, useEffect } from 'react';
import type { AirQualityData } from '@/types';
import type { AnalyzeAirQualityOutput } from '@/ai/flows/analyze-air-quality';
import { format } from 'date-fns';
// import { Brain } from 'lucide-react'; // Using SVG to simplify html2pdf.js conversion
import { useTranslation } from 'react-i18next'; 

interface PrintableReportProps {
  airQualityData: AirQualityData;
  aiAnalysis: AnalyzeAirQualityOutput | null;
  lng: string; 
}

// Forwarding ref to the root div of this component
const PrintableReport = React.forwardRef<HTMLDivElement, PrintableReportProps>(
  ({ airQualityData, aiAnalysis, lng }, ref) => {
    const { t } = useTranslation(); 
    const [generatedOnTimestamp, setGeneratedOnTimestamp] = useState<string | null>(null);

    useEffect(() => {
      setGeneratedOnTimestamp(format(new Date(), 'MMMM dd, yyyy HH:mm:ss'));
    }, []); 

    const sensorReadings = [
      airQualityData.co,
      airQualityData.vocs,
      airQualityData.ch4Lpg,
      airQualityData.pm1_0,
      airQualityData.pm2_5,
      airQualityData.pm10,
    ];

    // Basic inline styles for html2pdf.js - it's better at capturing computed styles from simple CSS
    const styles = {
      page: { fontFamily: 'Arial, sans-serif', fontSize: '10pt', color: '#333333', backgroundColor: '#ffffff', padding: '0.5in' },
      header: { textAlign: 'center' as 'center', marginBottom: '20px' },
      h1: { fontSize: '20pt', fontWeight: 'bold', color: '#2C5282', marginBottom: '5px' }, // Muted Blue
      h2: { fontSize: '16pt', fontWeight: 'bold', color: '#2C5282', marginTop: '20px', marginBottom: '10px', borderBottom: '1px solid #2C5282', paddingBottom: '3px' },
      h3: { fontSize: '12pt', fontWeight: 'bold', color: '#4A5568', marginBottom: '5px' }, // Darker Gray
      p: { marginBottom: '10px', lineHeight: '1.4' },
      table: { width: '100%', borderCollapse: 'collapse' as 'collapse', marginBottom: '20px', fontSize: '9pt' },
      th: { border: '1px solid #CBD5E0', padding: '6px', textAlign: 'left' as 'left', backgroundColor: '#EBF4FF', fontWeight: 'bold' }, // Light Muted Blue
      td: { border: '1px solid #CBD5E0', padding: '6px', textAlign: 'left' as 'left' },
      textRight: { textAlign: 'right' as 'right' },
      footer: { marginTop: '30px', paddingTop: '10px', borderTop: '1px solid #E2E8F0', textAlign: 'center' as 'center', fontSize: '8pt', color: '#718096' },
      preLine: { whiteSpace: 'pre-line' as 'pre-line' },
      flexCenter: { display: 'flex', alignItems: 'center' },
      icon: { marginRight: '8px', width: '16px', height: '16px', fill: '#2C5282'},
    };


    return (
      <div ref={ref} style={styles.page} id="actual-report-content"> {/* Added id for clarity */}
        <header style={styles.header}>
          <h1 style={styles.h1}>
            {t('reportTitle')}
          </h1>
          {generatedOnTimestamp && (
            <p style={{...styles.p, fontSize: '9pt', color: '#718096'}}>
              {t('reportGeneratedOn')}: {generatedOnTimestamp}
            </p>
          )}
          <p style={{...styles.p, fontSize: '9pt', color: '#718096'}}>
            {t('reportReadingsTimestamp')}: {format(airQualityData.timestamp, 'MMMM dd, yyyy HH:mm:ss')}
          </p>
        </header>

        <section>
          <h2 style={styles.h2}>
            {t('reportSensorReadingsTitle')}
          </h2>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>{t('reportPollutantHeader')}</th>
                <th style={{...styles.th, ...styles.textRight}}>{t('reportValueHeader')}</th>
                <th style={styles.th}>{t('reportUnitHeader')}</th>
              </tr>
            </thead>
            <tbody>
              {sensorReadings.map((reading) => (
                <tr key={reading.id}>
                  <td style={styles.td}>{reading.name}</td>
                  <td style={{...styles.td, ...styles.textRight}}>{reading.value.toFixed(2)}</td>
                  <td style={styles.td}>{reading.unit}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        {aiAnalysis && (
          <section>
            <h2 style={{...styles.h2, ...styles.flexCenter}}>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" style={styles.icon} fill="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" >
                <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v0A2.5 2.5 0 0 1 9.5 7h-3A2.5 2.5 0 0 1 4 4.5v0A2.5 2.5 0 0 1 6.5 2Z"></path><path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v0A2.5 2.5 0 0 0 14.5 7h3A2.5 2.5 0 0 0 20 4.5v0A2.5 2.5 0 0 0 17.5 2Z"></path><path d="M4.2 7.5A2.5 2.5 0 0 0 2 10v0a2.5 2.5 0 0 0 2.5 2.5H6"></path><path d="M19.8 7.5A2.5 2.5 0 0 1 22 10v0a2.5 2.5 0 0 1-2.5 2.5H18"></path><path d="M6 12.5A2.5 2.5 0 0 0 3.5 15v0A2.5 2.5 0 0 0 6 17.5h3A2.5 2.5 0 0 0 11.5 15v0A2.5 2.5 0 0 0 9 12.5Z"></path><path d="M18 12.5a2.5 2.5 0 0 1 2.5 2.5v0a2.5 2.5 0 0 1-2.5 2.5h-3a2.5 2.5 0 0 1-2.5-2.5v0a2.5 2.5 0 0 1 2.5-2.5Z"></path><path d="M9 17.5A2.5 2.5 0 0 0 6.5 20v0a2.5 2.5 0 0 0 2.5 2.5h3A2.5 2.5 0 0 0 14.5 20v0a2.5 2.5 0 0 0-2.5-2.5Z"></path><path d="M14.5 17.5a2.5 2.5 0 0 1 2.5 2.5v0a2.5 2.5 0 0 1-2.5 2.5h-3a2.5 2.5 0 0 1-2.5-2.5v0a2.5 2.5 0 0 1 2.5-2.5Z"></path>
              </svg>
              {t('rlModelAnalysis')}
            </h2>
            <div style={{marginBottom: '15px'}}>
              <h3 style={styles.h3}>{t('effectOnHumanHealth')}</h3>
              <p style={{...styles.p, ...styles.preLine}}>
                {aiAnalysis.effectOnHumanHealth || t('reportNoHealthImpactData')}
              </p>
            </div>
            <div>
              <h3 style={styles.h3}>{t('bestActionToReducePresence')}</h3>
              <p style={{...styles.p, ...styles.preLine}}>
                {aiAnalysis.bestActionToReducePresence || t('reportNoRecommendationsData')}
              </p>
            </div>
          </section>
        )}

        <footer style={styles.footer}>
          <p>{t('reportFooterText')}</p>
        </footer>
      </div>
    );
  }
);

PrintableReport.displayName = 'PrintableReport';
export default PrintableReport;
