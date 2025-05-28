import type { LucideIcon } from 'lucide-react';

export interface SensorReading {
  id: string;
  name: string;
  value: number;
  unit: string;
  icon?: LucideIcon;
  description?: string;
  color?: string; // Optional color for charts or UI elements
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
  time: string; // Could be Date object or formatted string
  [pollutant: string]: number | string; // e.g., PM25: 10, CO: 0.5
}
