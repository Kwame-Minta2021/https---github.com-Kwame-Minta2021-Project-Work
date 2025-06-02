
import type { LucideIcon } from 'lucide-react';
import type { GenerateLocalityReportInput, GenerateLocalityReportOutput } from '@/ai/flows/generate-locality-report-flow';
import type { ForecastAirQualityInput, ForecastAirQualityOutput } from '@/ai/flows/forecast-air-quality-flow';


export interface SensorReadingThresholds {
  moderate: number;
  unhealthy: number;
}

export interface SensorReading {
  id: string;
  name: string;
  value: number;
  unit: string;
  icon?: LucideIcon;
  description?: string;
  color?: string; // Optional base color for charts or UI elements
  thresholds?: SensorReadingThresholds; // Thresholds for color coding
}

export interface AirQualityData {
  co: SensorReading;
  vocs: SensorReading;
  ch4Lpg: SensorReading;
  pm1_0: SensorReading;
  pm2_5: SensorReading;
  pm10: SensorReading;
  timestamp: Date;
}

export interface HistoricalDataPoint {
  timestamp: string; // ISO date string e.g. "2024-07-15T10:00:00.000Z"
  [pollutant: string]: number | string; // e.g., PM25: 10, CO: 0.5
}

export interface CustomAlertThreshold {
  pollutantId: 'co' | 'pm2_5'; // Add other pollutants as needed
  threshold: number;
  unit: string;
  enabled: boolean;
}

export interface CustomAlertSettings {
  co?: Omit<CustomAlertThreshold, 'pollutantId' | 'unit'> & { unit: 'ppm' };
  pm2_5?: Omit<CustomAlertThreshold, 'pollutantId' | 'unit'> & { unit: 'µg/m³' };
}

// Export types for new flows
export type { GenerateLocalityReportInput, GenerateLocalityReportOutput };
export type { ForecastAirQualityInput, ForecastAirQualityOutput };
