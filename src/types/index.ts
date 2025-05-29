
import type { LucideIcon } from 'lucide-react';

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
