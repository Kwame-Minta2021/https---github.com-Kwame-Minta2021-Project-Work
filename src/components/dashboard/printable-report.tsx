
"use client"; 
import React, { useState, useEffect } from 'react';
import type { AirQualityData } from '@/types';
import type { AnalyzeAirQualityOutput } from '@/ai/flows/analyze-air-quality';
import { format } from 'date-fns';
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
      // Set timestamp once when component mounts or lng/t changes (which implies a re-render for language)
      setGeneratedOnTimestamp(format(new Date(), 'MMMM dd, yyyy HH:mm:ss'));
    }, [t, lng]); // Update if translations or language change for the "Generated on" string

    const sensorReadings = [
      airQualityData.co,
      airQualityData.vocs,
      airQualityData.ch4Lpg,
      airQualityData.pm1_0,
      airQualityData.pm2_5,
      airQualityData.pm10,
    ];

    const styles = {
      page: { fontFamily: 'Arial, sans-serif', fontSize: '10pt', color: '#333333', backgroundColor: '#ffffff', padding: '0.5in', width: '100%' },
      header: { textAlign: 'center' as 'center', marginBottom: '20px' },
      h1: { fontSize: '20pt', fontWeight: 'bold', color: '#2C5282', marginBottom: '5px' }, 
      h2: { fontSize: '16pt', fontWeight: 'bold', color: '#2C5282', marginTop: '20px', marginBottom: '10px', borderBottom: '1px solid #CBD5E0', paddingBottom: '3px' },
      h3: { fontSize: '12pt', fontWeight: 'bold', color: '#4A5568', marginBottom: '5px' }, 
      p: { marginBottom: '10px', lineHeight: '1.4' },
      table: { width: '100%', borderCollapse: 'collapse' as 'collapse', marginBottom: '20px', fontSize: '9pt' },
      th: { border: '1px solid #CBD5E0', padding: '8px', textAlign: 'left' as 'left', backgroundColor: '#EBF4FF', fontWeight: 'bold' }, 
      td: { border: '1px solid #CBD5E0', padding: '8px', textAlign: 'left' as 'left' },
      textRight: { textAlign: 'right' as 'right' },
      footer: { marginTop: '30px', paddingTop: '10px', borderTop: '1px solid #E2E8F0', textAlign: 'center' as 'center', fontSize: '8pt', color: '#718096' },
      preLine: { whiteSpace: 'pre-line' as 'pre-line', wordWrap: 'break-word' as 'break-word' },
      flexCenter: { display: 'flex', alignItems: 'center' },
      icon: { marginRight: '8px', width: '20px', height: '20px', fill: '#2C5282'}, // Adjusted icon size
      reportContainer: { width: '7.5in', margin: '0 auto' } // Ensures content fits within typical letter page width minus margins
    };


    return (
      <div ref={ref} style={styles.page} id="printable-report-content-wrapper">
        <div style={styles.reportContainer}> {/* Inner container for content width control */}
            <header style={styles.header}>
            <h1 style={styles.h1}>
                {/* Gas Analysis Report - Consider adding a logo here if available */}
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
                {t('reportSensorReadingsTitle')} {/* Gases Results */}
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
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" style={styles.icon} fill="currentColor">
                    <path d="M12 2a2.5 2.5 0 00-2.5 2.5V7a2.5 2.5 0 005 0V4.5A2.5 2.5 0 0012 2zM6.5 2A2.5 2.5 0 004 4.5V7a2.5 2.5 0 005 0V4.5A2.5 2.5 0 006.5 2zM17.5 2a2.5 2.5 0 00-2.5 2.5V7a2.5 2.5 0 005 0V4.5A2.5 2.5 0 0017.5 2zM2 12a2.5 2.5 0 00-2.5 2.5V17a2.5 2.5 0 005 0v-2.5A2.5 2.5 0 002 12zm4.5 0a2.5 2.5 0 00-2.5 2.5V17a2.5 2.5 0 005 0v-2.5A2.5 2.5 0 004.5 12zm7.5 0a2.5 2.5 0 00-2.5 2.5V17a2.5 2.5 0 005 0v-2.5A2.5 2.5 0 0012 12zm5 0a2.5 2.5 0 00-2.5 2.5V17a2.5 2.5 0 005 0v-2.5A2.5 2.5 0 0017 12zm-10.5 5a2.5 2.5 0 00-2.5 2.5V22a2.5 2.5 0 005 0v-2.5a2.5 2.5 0 00-2.5-2.5zm5.5 0a2.5 2.5 0 00-2.5 2.5V22a2.5 2.5 0 005 0v-2.5A2.5 2.5 0 0012 17z"></path>
                </svg>
                {t('rlModelAnalysis')} {/* AI Recommendation & Actions */}
                </h2>
                <div style={{marginBottom: '15px'}}>
                <h3 style={styles.h3}>{t('effectOnHumanHealth')}</h3> {/* AI Recommendation */}
                <p style={{...styles.p, ...styles.preLine}}>
                    {aiAnalysis.effectOnHumanHealth || t('reportNoHealthImpactData')}
                </p>
                </div>
                <div>
                <h3 style={styles.h3}>{t('bestActionToReducePresence')}</h3> {/* Actions to be Taken */}
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
      </div>
    );
  }
);

PrintableReport.displayName = 'PrintableReport';
export default PrintableReport;

    