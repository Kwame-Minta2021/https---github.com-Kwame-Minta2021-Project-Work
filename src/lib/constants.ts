import type { AirQualityData, HistoricalDataPoint } from '@/types';
import { Thermometer, Wind, Cloud, Factory, FlaskConical, Flame, Layers } from 'lucide-react';

export const MOCK_AIR_QUALITY_DATA: AirQualityData = {
  co: { id: 'co', name: 'CO (MQ-9)', value: 0.58, unit: 'ppm', icon: Flame, color: "hsl(var(--chart-1))" },
  vocs: { id: 'vocs', name: 'VOCs (MQ-135)', value: 1.07, unit: 'ppm', icon: FlaskConical, color: "hsl(var(--chart-2))" },
  ch4Lpg: { id: 'ch4Lpg', name: 'CH4/LPG (MQ-5)', value: 3.07, unit: 'ppm', icon: Factory, color: "hsl(var(--chart-3))" },
  pm1_0: { id: 'pm1_0', name: 'PM1.0', value: 1, unit: 'µg/m³', icon: Layers, color: "hsl(var(--chart-4))" },
  pm2_5: { id: 'pm2_5', name: 'PM2.5', value: 3, unit: 'µg/m³', icon: Cloud, color: "hsl(var(--chart-5))" },
  pm10: { id: 'pm10', name: 'PM10', value: 3, unit: 'µg/m³', icon: Wind, color: "hsl(var(--chart-1))" }, // Re-using chart color
  timestamp: new Date(),
};

export const MOCK_HISTORICAL_DATA: HistoricalDataPoint[] = [
  { time: '00:00', CO: 0.4, VOCs: 0.8, PM25: 5 },
  { time: '02:00', CO: 0.5, VOCs: 0.9, PM25: 6 },
  { time: '04:00', CO: 0.58, VOCs: 1.0, PM25: 7 },
  { time: '06:00', CO: 0.6, VOCs: 1.1, PM25: 8 },
  { time: '08:00', CO: 0.55, VOCs: 1.05, PM25: 6 },
  { time: '10:00', CO: 0.5, VOCs: 1.0, PM25: 5 },
  { time: '12:00', CO: 0.58, VOCs: 1.07, PM25: 3 }, // Corresponds to current mock
];

export const MOCK_BAR_CHART_DATA = [
  { name: 'CO', value: MOCK_AIR_QUALITY_DATA.co.value, fill: "var(--color-co)" },
  { name: 'VOCs', value: MOCK_AIR_QUALITY_DATA.vocs.value, fill: "var(--color-vocs)" },
  { name: 'CH4/LPG', value: MOCK_AIR_QUALITY_DATA.ch4Lpg.value, fill: "var(--color-ch4Lpg)" },
  { name: 'PM1.0', value: MOCK_AIR_QUALITY_DATA.pm1_0.value, fill: "var(--color-pm1_0)" },
  { name: 'PM2.5', value: MOCK_AIR_QUALITY_DATA.pm2_5.value, fill: "var(--color-pm2_5)" },
  { name: 'PM10', value: MOCK_AIR_QUALITY_DATA.pm10.value, fill: "var(--color-pm10)" },
];

export const CHART_CONFIG = {
  co: { label: "CO (ppm)", color: MOCK_AIR_QUALITY_DATA.co.color },
  vocs: { label: "VOCs (ppm)", color: MOCK_AIR_QUALITY_DATA.vocs.color },
  ch4Lpg: { label: "CH4/LPG (ppm)", color: MOCK_AIR_QUALITY_DATA.ch4Lpg.color },
  pm1_0: { label: "PM1.0 (µg/m³)", color: MOCK_AIR_QUALITY_DATA.pm1_0.color },
  pm2_5: { label: "PM2.5 (µg/m³)", color: MOCK_AIR_QUALITY_DATA.pm2_5.color },
  pm10: { label: "PM10 (µg/m³)", color: MOCK_AIR_QUALITY_DATA.pm10.color },
  PM25: { label: "PM2.5 (µg/m³)", color: MOCK_AIR_QUALITY_DATA.pm2_5.color }, // For historical key
  CO_hist: { label: "CO (ppm)", color: MOCK_AIR_QUALITY_DATA.co.color }, // For historical key, to avoid conflict if 'CO' is already in config from another source
  VOCs_hist: { label: "VOCs (ppm)", color: MOCK_AIR_QUALITY_DATA.vocs.color }, // For historical key
} as const;
