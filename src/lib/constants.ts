
import type { AirQualityData, HistoricalDataPoint, SensorReadingThresholds } from '@/types';
// Removed direct LucideIcon imports as they are handled in RealtimeDataCard
import { subDays, formatISO, startOfHour, setHours, parseISO, eachDayOfInterval, format } from 'date-fns';

// Define a single, fixed reference date for all mock data to ensure consistency
const FIXED_REFERENCE_ISO_STRING = "2025-05-28T10:00:00.000Z";
const FIXED_REFERENCE_DATE = parseISO(FIXED_REFERENCE_ISO_STRING);

// Thresholds for color coding sensor readings
const CO_THRESHOLDS: SensorReadingThresholds = { moderate: 4.5, unhealthy: 9.5 }; // ppm
const VOC_THRESHOLDS: SensorReadingThresholds = { moderate: 0.5, unhealthy: 3.0 }; // General ppm, varies by specific VOC
const CH4LPG_THRESHOLDS: SensorReadingThresholds = { moderate: 5000, unhealthy: 10000 }; // ppm, focusing on higher levels for CH4 safety, LPG is different
const PM1_0_THRESHOLDS: SensorReadingThresholds = { moderate: 10, unhealthy: 25 }; // µg/m³
const PM2_5_THRESHOLDS: SensorReadingThresholds = { moderate: 12, unhealthy: 35.5 }; // µg/m³
const PM10_THRESHOLDS: SensorReadingThresholds = { moderate: 50, unhealthy: 101 }; // µg/m³


export const MOCK_AIR_QUALITY_DATA: AirQualityData = {
  co: { id: 'co', name: 'CO (MQ-9)', value: 0.58, unit: 'ppm', iconName: 'Flame', color: "hsl(var(--chart-1))", thresholds: CO_THRESHOLDS },
  vocs: { id: 'vocs', name: 'VOCs (MQ-135)', value: 1.07, unit: 'ppm', iconName: 'FlaskConical', color: "hsl(var(--chart-2))", thresholds: VOC_THRESHOLDS },
  ch4Lpg: { id: 'ch4Lpg', name: 'CH4/LPG (MQ-5)', value: 300, unit: 'ppm', iconName: 'Factory', color: "hsl(var(--chart-3))", thresholds: CH4LPG_THRESHOLDS },
  pm1_0: { id: 'pm1_0', name: 'PM1.0', value: 15, unit: 'µg/m³', iconName: 'Layers', color: "hsl(var(--chart-4))", thresholds: PM1_0_THRESHOLDS },
  pm2_5: { id: 'pm2_5', name: 'PM2.5', value: 40, unit: 'µg/m³', iconName: 'Cloud', color: "hsl(var(--chart-5))", thresholds: PM2_5_THRESHOLDS },
  pm10: { id: 'pm10', name: 'PM10', value: 55, unit: 'µg/m³', iconName: 'Wind', color: "hsl(var(--chart-1))", thresholds: PM10_THRESHOLDS }, // Re-using chart color
  timestamp: FIXED_REFERENCE_DATE,
};

const generateHistoricalData = (): HistoricalDataPoint[] => {
  const data: HistoricalDataPoint[] = [];
  const baseDate = FIXED_REFERENCE_DATE;

  for (let dayOffset = 0; dayOffset < 30; dayOffset++) {
    const currentDateAtMidnight = startOfHour(subDays(baseDate, dayOffset));
    const currentDayBase = new Date(currentDateAtMidnight.getFullYear(), currentDateAtMidnight.getMonth(), currentDateAtMidnight.getDate());

    for (let hour = 0; hour < 24; hour++) {
      const timestamp = setHours(currentDayBase, hour);

      // Deterministic generation
      const sinHour = Math.sin(hour / 4 + dayOffset / 2);
      const cosHour = Math.cos(hour / 3 + dayOffset / 3);

      data.push({
        timestamp: formatISO(timestamp),
        CO: Number((0.4 + sinHour * 0.1 + (dayOffset % 3) * 0.02).toFixed(2)),
        VOCs: Number((0.8 + cosHour * 0.2 + (dayOffset % 4) * 0.03).toFixed(2)),
        PM25: Number(Math.max(0, (10 + sinHour * 5 + cosHour * 3 + (dayOffset % 5) * 0.5)).toFixed(0)),
      });
    }
  }
  return data.sort((a, b) => parseISO(a.timestamp).getTime() - parseISO(b.timestamp).getTime());
};

export const MOCK_HISTORICAL_DATA: HistoricalDataPoint[] = generateHistoricalData();


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
  CO: { label: "CO (ppm)", color: MOCK_AIR_QUALITY_DATA.co.color },
  VOCs: { label: "VOCs (ppm)", color: MOCK_AIR_QUALITY_DATA.vocs.color },
  PM25: { label: "PM2.5 (µg/m³)", color: MOCK_AIR_QUALITY_DATA.pm2_5.color },
} as const;

