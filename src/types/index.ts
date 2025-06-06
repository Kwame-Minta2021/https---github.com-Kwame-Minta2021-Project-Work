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
  iconName?: string; // Changed from icon?: LucideIcon
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

export interface CustomAlertSettings {
  co?: {
    enabled: boolean;
    threshold: number;
  };
  pm2_5?: {
    enabled: boolean;
    threshold: number;
  };
}

export interface AnalyzeAirQualityInput {
  co: number;
  vocs: number;
  ch4Lpg: number;
  pm10: number;
  pm25: number;
  pm100: number;
  language: string;
}

// Export types for new flows
export type { GenerateLocalityReportInput, GenerateLocalityReportOutput };
export type { ForecastAirQualityInput, ForecastAirQualityOutput };