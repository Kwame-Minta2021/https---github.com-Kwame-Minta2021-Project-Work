
import type { AirQualityData, HistoricalDataPoint } from '@/types';
import { Thermometer, Wind, Cloud, Factory, FlaskConical, Flame, Layers } from 'lucide-react';
import { subDays, formatISO, startOfHour, setHours, parseISO } from 'date-fns';

// Define a single, fixed reference date for all mock data to ensure consistency
const FIXED_REFERENCE_ISO_STRING = "2025-05-28T10:00:00.000Z";
const FIXED_REFERENCE_DATE = parseISO(FIXED_REFERENCE_ISO_STRING);

export const MOCK_AIR_QUALITY_DATA: AirQualityData = {
  co: { id: 'co', name: 'CO (MQ-9)', value: 0.58, unit: 'ppm', icon: Flame, color: "hsl(var(--chart-1))" },
  vocs: { id: 'vocs', name: 'VOCs (MQ-135)', value: 1.07, unit: 'ppm', icon: FlaskConical, color: "hsl(var(--chart-2))" },
  ch4Lpg: { id: 'ch4Lpg', name: 'CH4/LPG (MQ-5)', value: 3.07, unit: 'ppm', icon: Factory, color: "hsl(var(--chart-3))" },
  pm1_0: { id: 'pm1_0', name: 'PM1.0', value: 1, unit: 'µg/m³', icon: Layers, color: "hsl(var(--chart-4))" },
  pm2_5: { id: 'pm2_5', name: 'PM2.5', value: 3, unit: 'µg/m³', icon: Cloud, color: "hsl(var(--chart-5))" },
  pm10: { id: 'pm10', name: 'PM10', value: 3, unit: 'µg/m³', icon: Wind, color: "hsl(var(--chart-1))" }, // Re-using chart color
  timestamp: FIXED_REFERENCE_DATE, // Use the fixed date
};

const generateHistoricalData = (): HistoricalDataPoint[] => {
  const data: HistoricalDataPoint[] = [];
  const baseDate = FIXED_REFERENCE_DATE; // Use the fixed date as a base

  for (let dayOffset = 0; dayOffset < 30; dayOffset++) { // Generate data for the last 30 days
    const currentDateAtMidnight = startOfHour(subDays(baseDate, dayOffset)); 
    // Ensure setHours doesn't modify the original object if it's not already a new instance from subDays/startOfHour
    // For date-fns, subDays and startOfHour usually return new Date instances.
    // Explicitly set hours, minutes, seconds, ms to 0 for midnight.
    const currentDayBase = new Date(currentDateAtMidnight.getFullYear(), currentDateAtMidnight.getMonth(), currentDateAtMidnight.getDate());


    for (let hour = 0; hour < 24; hour++) { // Hourly data for that day
      const timestamp = setHours(currentDayBase, hour);
      
      // Deterministic generation of pollutant values based on hour and dayOffset
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
  // Keys for historical data in line chart
  CO: { label: "CO (ppm)", color: MOCK_AIR_QUALITY_DATA.co.color }, // Matches dataKey "CO"
  VOCs: { label: "VOCs (ppm)", color: MOCK_AIR_QUALITY_DATA.vocs.color }, // Matches dataKey "VOCs"
  PM25: { label: "PM2.5 (µg/m³)", color: MOCK_AIR_QUALITY_DATA.pm2_5.color }, // Matches dataKey "PM25"
} as const;
