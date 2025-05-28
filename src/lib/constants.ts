
import type { AirQualityData, HistoricalDataPoint, HeatmapDataPoint, SensorReadingThresholds } from '@/types';
import { Thermometer, Wind, Cloud, Factory, FlaskConical, Flame, Layers } from 'lucide-react';
import { subDays, formatISO, startOfHour, setHours, parseISO, eachDayOfInterval, format } from 'date-fns';

// Define a single, fixed reference date for all mock data to ensure consistency
const FIXED_REFERENCE_ISO_STRING = "2025-05-28T10:00:00.000Z";
const FIXED_REFERENCE_DATE = parseISO(FIXED_REFERENCE_ISO_STRING);

// Thresholds for color coding sensor readings
const CO_THRESHOLDS: SensorReadingThresholds = { moderate: 4.5, unhealthy: 9.5 };
const VOC_THRESHOLDS: SensorReadingThresholds = { moderate: 0.5, unhealthy: 3.0 }; // General, varies by specific VOC
const CH4LPG_THRESHOLDS: SensorReadingThresholds = { moderate: 50, unhealthy: 100 }; // Simplified ppm
const PM1_0_THRESHOLDS: SensorReadingThresholds = { moderate: 10, unhealthy: 25 };
const PM2_5_THRESHOLDS: SensorReadingThresholds = { moderate: 12, unhealthy: 35.5 };
const PM10_THRESHOLDS: SensorReadingThresholds = { moderate: 50, unhealthy: 101 };


export const MOCK_AIR_QUALITY_DATA: AirQualityData = {
  co: { id: 'co', name: 'CO (MQ-9)', value: 0.58, unit: 'ppm', icon: Flame, color: "hsl(var(--chart-1))", thresholds: CO_THRESHOLDS },
  vocs: { id: 'vocs', name: 'VOCs (MQ-135)', value: 1.07, unit: 'ppm', icon: FlaskConical, color: "hsl(var(--chart-2))", thresholds: VOC_THRESHOLDS },
  ch4Lpg: { id: 'ch4Lpg', name: 'CH4/LPG (MQ-5)', value: 3.07, unit: 'ppm', icon: Factory, color: "hsl(var(--chart-3))", thresholds: CH4LPG_THRESHOLDS },
  pm1_0: { id: 'pm1_0', name: 'PM1.0', value: 15, unit: 'µg/m³', icon: Layers, color: "hsl(var(--chart-4))", thresholds: PM1_0_THRESHOLDS },
  pm2_5: { id: 'pm2_5', name: 'PM2.5', value: 40, unit: 'µg/m³', icon: Cloud, color: "hsl(var(--chart-5))", thresholds: PM2_5_THRESHOLDS },
  pm10: { id: 'pm10', name: 'PM10', value: 55, unit: 'µg/m³', icon: Wind, color: "hsl(var(--chart-1))", thresholds: PM10_THRESHOLDS }, // Re-using chart color
  timestamp: FIXED_REFERENCE_DATE, // Use the fixed date
};

const generateHistoricalData = (): HistoricalDataPoint[] => {
  const data: HistoricalDataPoint[] = [];
  const baseDate = FIXED_REFERENCE_DATE; // Use the fixed date as a base

  for (let dayOffset = 0; dayOffset < 30; dayOffset++) { // Generate data for the last 30 days
    const currentDateAtMidnight = startOfHour(subDays(baseDate, dayOffset));
    const currentDayBase = new Date(currentDateAtMidnight.getFullYear(), currentDateAtMidnight.getMonth(), currentDateAtMidnight.getDate());

    for (let hour = 0; hour < 24; hour++) { // Hourly data for that day
      const timestamp = setHours(currentDayBase, hour);
      
      data.push({
        timestamp: formatISO(timestamp),
        CO: Number((0.4 + ((hour % 5) * 0.05) + ((dayOffset % 3) * 0.02)).toFixed(2)),
        VOCs: Number((0.8 + ((hour % 6) * 0.06) + ((dayOffset % 4) * 0.03)).toFixed(2)),
        PM25: Number(Math.floor(2 + ((hour % 10) * 0.5) + ((dayOffset % 5) * 0.3))),
      });
    }
  }
  return data.sort((a, b) => parseISO(a.timestamp).getTime() - parseISO(b.timestamp).getTime()); // Ensure chronological order
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


const generateHeatmapData = (pollutant: 'CO' | 'VOCs' | 'PM25'): HeatmapDataPoint[] => {
  const data: HeatmapDataPoint[] = [];
  const endDate = FIXED_REFERENCE_DATE;
  const startDate = subDays(endDate, 6); // Last 7 days
  const days = eachDayOfInterval({ start: startDate, end: endDate });
  const dayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  days.forEach(date => {
    const dayOfWeek = dayLabels[date.getDay()];
    for (let hour = 0; hour < 24; hour++) {
      let value;
      // Generate slightly different patterns for pollutants
      if (pollutant === 'CO') {
        value = Number((0.2 + Math.sin(hour / 4 + date.getDate()) * 0.3 + Math.random() * 0.2).toFixed(2)); // Range approx 0 to 0.7
        value = Math.max(0, value * 10); // Scale up for better visualization
      } else if (pollutant === 'VOCs') {
        value = Number((0.5 + Math.cos(hour / 3 + date.getDate()) * 0.4 + Math.random() * 0.3).toFixed(2)); // Range approx 0 to 1.2
        value = Math.max(0, value * 5);
      } else { // PM2.5
        value = Number(Math.abs(10 + Math.sin(hour / 6 + date.getDate() / 2) * 15 + (Math.random() - 0.5) * 10).toFixed(0)); // Range approx 0 to 35
      }
      data.push({
        day: dayOfWeek,
        hour: hour,
        value: value,
        pollutant: pollutant
      });
    }
  });
  return data;
};

export const MOCK_HEATMAP_DATA_PM25: HeatmapDataPoint[] = generateHeatmapData('PM25');

export const HEATMAP_CONFIG = {
  days: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].reverse(), // Reverse for typical heatmap display (Sun at bottom)
  hours: Array.from({ length: 24 }, (_, i) => i), // 0-23
  // Color scale for PM2.5 (Good < 12 (green), Moderate 12-35 (yellow), Unhealthy > 35 (red))
  // These are approximate HSL values.
  // Tailwind colors: text-green-500, text-yellow-500, text-red-500
  colorScale: (value: number): string => {
    if (value <= 12) return 'hsl(140 70% 60%)'; // Greenish
    if (value <= 35) return 'hsl(45 80% 60%)';  // Yellowish
    return 'hsl(0 80% 60%)';   // Reddish
  },
  tooltipLabel: "PM2.5 (µg/m³)",
};

