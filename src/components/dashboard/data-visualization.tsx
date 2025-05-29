
"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { BarChart, LineChart as RechartsLineChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend, CartesianGrid, Bar, Line, Cell } from 'recharts';
import { MOCK_BAR_CHART_DATA, CHART_CONFIG } from '@/lib/constants';
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";
import type { HistoricalDataPoint } from '@/types';
import { parseISO, format, differenceInDays, isValid } from 'date-fns';
import React from "react";
import { Info } from "lucide-react";
import { useTranslation } from 'react-i18next'; // Import useTranslation

interface DataVisualizationProps {
  historicalData: HistoricalDataPoint[];
  // lng: string; // No longer needed
}

interface GuidelineInfoProps {
  pollutant: string;
  guidelines: Array<{ period: string; value: string; notes?: string }>;
  generalNote?: string;
}

const GuidelineItem: React.FC<GuidelineInfoProps> = ({ pollutant, guidelines, generalNote }) => (
  <div className="mb-6">
    <h4 className="font-semibold text-md mb-2 text-primary">{pollutant}</h4>
    <ul className="list-disc list-inside space-y-1 text-sm text-foreground/90">
      {guidelines.map((g, index) => (
        <li key={index}>
          <strong>{g.period}:</strong> {g.value}
          {g.notes && <span className="text-xs text-muted-foreground italic"> ({g.notes})</span>}
        </li>
      ))}
    </ul>
    {generalNote && <p className="text-xs text-muted-foreground mt-2">{generalNote}</p>}
  </div>
);


export default function DataVisualization({ historicalData }: DataVisualizationProps) {
  const { t } = useTranslation(); // Use the hook
  
  const xAxisTickFormatter = (isoTimestamp: string) => {
    if (!historicalData || historicalData.length === 0) {
      try {
        const parsedTick = parseISO(isoTimestamp);
        if (isValid(parsedTick)) return format(parsedTick, 'HH:mm');
      } catch (e) { /* ignore */ }
      return isoTimestamp;
    }
    
    let firstDate: Date | null = null;
    let lastDate: Date | null = null;

    try {
      firstDate = parseISO(historicalData[0].timestamp);
      lastDate = parseISO(historicalData[historicalData.length - 1].timestamp);
    } catch (e) {
      try {
        const parsedTick = parseISO(isoTimestamp);
        if (isValid(parsedTick)) return format(parsedTick, 'HH:mm');
      } catch (parseErr) { /* ignore */ }
      return isoTimestamp;
    }
    
    if (!firstDate || !lastDate ||!isValid(firstDate) || !isValid(lastDate)) {
      try {
        const parsedTick = parseISO(isoTimestamp);
        if (isValid(parsedTick)) return format(parsedTick, 'HH:mm');
      } catch (parseErr) { /* ignore */ }
      return isoTimestamp;
    }

    const dayDiff = differenceInDays(lastDate, firstDate);

    try {
      const currentTickDate = parseISO(isoTimestamp);
      if (!isValid(currentTickDate)) return isoTimestamp; 

      if (dayDiff > 1) {
        return format(currentTickDate, 'MMM d'); 
      }
      return format(currentTickDate, 'HH:mm'); 
    } catch (e) {
      return isoTimestamp; 
    }
  };
  
  return (
    <section id="visualizations" className="mb-8 scroll-mt-20">
      <h2 className="text-2xl font-semibold tracking-tight mb-4">{t('dataVisualizations')}</h2>
      <Tabs defaultValue="line" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-4">
          <TabsTrigger value="line">{t('lineCharts')}</TabsTrigger>
          <TabsTrigger value="bar">{t('barGraphs')}</TabsTrigger>
          <TabsTrigger value="guidelines">{t('aqGuidelines')}</TabsTrigger>
        </TabsList>
        <TabsContent value="line">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>{t('pollutantTrends')}</CardTitle>
              <CardDescription>{t('hourlyTrends')}</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={CHART_CONFIG} className="h-[400px] w-full">
                <RechartsLineChart data={historicalData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis 
                    dataKey="timestamp" 
                    tickFormatter={xAxisTickFormatter} 
                    tickLine={false} 
                    axisLine={false} 
                    tickMargin={8} 
                  />
                  <YAxis tickLine={false} axisLine={false} tickMargin={8} />
                  <Tooltip cursor={{ fill: "hsl(var(--accent) / 0.1)" }} content={<ChartTooltipContent hideLabel />} />
                  <Legend />
                  <Line type="monotone" dataKey="CO" name="CO (ppm)" stroke="var(--color-CO)" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="VOCs" name="VOCs (ppm)" stroke="var(--color-VOCs)" strokeWidth={2} dot={false} activeDot={{r:6}} />
                  <Line type="monotone" dataKey="PM25" name="PM2.5 (µg/m³)" stroke="var(--color-PM25)" strokeWidth={2} dot={false} activeDot={{r:6}} />
                </RechartsLineChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="bar">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>{t('currentPollutantLevels')}</CardTitle>
              <CardDescription>{t('currentPollutantDesc')}</CardDescription>
            </CardHeader>
            <CardContent>
               <ChartContainer config={CHART_CONFIG} className="h-[400px] w-full">
                <BarChart data={MOCK_BAR_CHART_DATA} layout="vertical" margin={{ top: 5, right: 20, left: 30, bottom: 5 }}>
                  <CartesianGrid horizontal={false} />
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" tickLine={false} axisLine={false} tickMargin={8} width={80} />
                  <Tooltip cursor={{ fill: "hsl(var(--accent) / 0.1)" }} content={<ChartTooltipContent indicator="dot" />} />
                  <Legend />
                  <Bar dataKey="value" radius={5}>
                     {MOCK_BAR_CHART_DATA.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill as string} />
                      ))}
                  </Bar>
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="guidelines">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Info className="h-6 w-6 mr-2 text-primary" />
                {t('whoGuidelinesTitle')}
              </CardTitle>
              <CardDescription>{t('whoGuidelinesDesc')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <GuidelineItem
                pollutant="Particulate Matter (PM2.5)"
                guidelines={[
                  { period: "Annual mean", value: "5 µg/m³" },
                  { period: "24-hour mean", value: "15 µg/m³" }
                ]}
              />
              <GuidelineItem
                pollutant="Particulate Matter (PM10)"
                guidelines={[
                  { period: "Annual mean", value: "15 µg/m³" },
                  { period: "24-hour mean", value: "45 µg/m³" }
                ]}
              />
              <GuidelineItem
                pollutant="Carbon Monoxide (CO)"
                guidelines={[
                  { period: "8-hour mean", value: "4 mg/m³ (≈ 3.5 ppm)" },
                  { period: "1-hour mean", value: "30 mg/m³ (≈ 26 ppm)" , notes: "Not to be exceeded more than once per day"}
                ]}
                generalNote="ppm conversion approximate."
              />
              <GuidelineItem
                pollutant="Volatile Organic Compounds (VOCs)"
                guidelines={[]}
                generalNote="WHO guidelines for VOCs are specific to individual compounds (e.g., benzene, formaldehyde). As a general principle, VOC levels should be kept as low as practically achievable. Ensure good ventilation to reduce indoor VOC concentrations."
              />
               <div>
                <h4 className="font-semibold text-md mb-2 text-primary">Ozone (O₃) - For Reference</h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-foreground/90">
                    <li><strong>8-hour mean (peak season):</strong> 100 µg/m³</li>
                </ul>
                <p className="text-xs text-muted-foreground mt-1">Note: Ozone is not directly measured by the current dashboard sensors but is a key pollutant.</p>
              </div>
              <div>
                <h4 className="font-semibold text-md mb-2 text-primary">Nitrogen Dioxide (NO₂) - For Reference</h4>
                 <ul className="list-disc list-inside space-y-1 text-sm text-foreground/90">
                    <li><strong>Annual mean:</strong> 10 µg/m³</li>
                    <li><strong>24-hour mean:</strong> 25 µg/m³</li>
                </ul>
                 <p className="text-xs text-muted-foreground mt-1">Note: NO₂ is not directly measured by the current dashboard sensors but is a key pollutant.</p>
              </div>
               <div>
                <h4 className="font-semibold text-md mb-2 text-primary">Sulfur Dioxide (SO₂) - For Reference</h4>
                 <ul className="list-disc list-inside space-y-1 text-sm text-foreground/90">
                    <li><strong>24-hour mean:</strong> 40 µg/m³</li>
                </ul>
                 <p className="text-xs text-muted-foreground mt-1">Note: SO₂ is not directly measured by the current dashboard sensors but is a key pollutant.</p>
              </div>
              <p className="text-xs text-muted-foreground pt-4 border-t mt-4">
                These are globally recommended guideline levels. National or local standards may vary.
                Always consult local authorities for specific air quality regulations and health advice.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </section>
  );
}
