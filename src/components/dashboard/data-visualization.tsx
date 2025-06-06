
"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart, LineChart as RechartsLineChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend, CartesianGrid, Bar, Line, Cell } from 'recharts';
import { MOCK_BAR_CHART_DATA, CHART_CONFIG } from '@/lib/constants';
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";
import type { HistoricalDataPoint } from '@/types';
import { parseISO, format, differenceInDays, isValid, subDays, subHours, isAfter, isBefore } from 'date-fns';
import React, { useState, useMemo } from "react";
import { Info, Calendar, Filter } from "lucide-react";
import { useTranslation } from 'react-i18next';

interface DataVisualizationProps {
  historicalData: HistoricalDataPoint[];
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
  const { t } = useTranslation();
  const [dateRange, setDateRange] = useState<string>('24h');
  const [activeTab, setActiveTab] = useState<string>('line');

  const filteredData = useMemo(() => {
    if (!historicalData || historicalData.length === 0) return [];

    const now = new Date();
    let startDate: Date;

    switch (dateRange) {
      case '1h':
        startDate = subHours(now, 1);
        break;
      case '6h':
        startDate = subHours(now, 6);
        break;
      case '24h':
        startDate = subDays(now, 1);
        break;
      case '7d':
        startDate = subDays(now, 7);
        break;
      case '30d':
        startDate = subDays(now, 30);
        break;
      default:
        startDate = subDays(now, 1);
    }

    return historicalData.filter(point => {
      try {
        const pointDate = parseISO(point.timestamp);
        return isValid(pointDate) && isAfter(pointDate, startDate) && isBefore(pointDate, now);
      } catch {
        return false;
      }
    });
  }, [historicalData, dateRange]);

  const currentData = useMemo(() => {
    if (!filteredData || filteredData.length === 0) return MOCK_BAR_CHART_DATA;
    
    const latest = filteredData[filteredData.length - 1];
    return [
      { 
        name: 'CO', 
        value: parseFloat((latest.CO || 0).toString()), 
        fill: "var(--color-CO)",
        unit: 'ppm'
      },
      { 
        name: 'VOCs', 
        value: parseFloat((latest.VOCs || 0).toString()), 
        fill: "var(--color-VOCs)",
        unit: 'ppm'
      },
      { 
        name: 'PM2.5', 
        value: parseFloat((latest.PM25 || 0).toString()), 
        fill: "var(--color-PM25)",
        unit: 'µg/m³'
      },
      { 
        name: 'PM1.0', 
        value: parseFloat((latest.PM10 || 0).toString()), 
        fill: "var(--color-PM10)",
        unit: 'µg/m³'
      },
      { 
        name: 'PM10', 
        value: parseFloat((latest.PM100 || 0).toString()), 
        fill: "var(--color-PM100)",
        unit: 'µg/m³'
      },
      { 
        name: 'CH4/LPG', 
        value: parseFloat((latest.CH4LPG || 0).toString()), 
        fill: "var(--color-CH4LPG)",
        unit: 'ppm'
      }
    ];
  }, [filteredData]); 
  
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h2 className="text-2xl font-semibold tracking-tight">{t('dataVisualizations')}</h2>
        
        {/* Date Range Selector */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>Time Range:</span>
          </div>
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1h">Last Hour</SelectItem>
              <SelectItem value="6h">Last 6 Hours</SelectItem>
              <SelectItem value="24h">Last 24 Hours</SelectItem>
              <SelectItem value="7d">Last 7 Days</SelectItem>
              <SelectItem value="30d">Last 30 Days</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Tabs defaultValue="line" className="w-full" onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3 mb-4">
          <TabsTrigger value="line" className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            {t('lineCharts')}
          </TabsTrigger>
          <TabsTrigger value="bar">{t('barGraphs')}</TabsTrigger>
          <TabsTrigger value="guidelines">{t('aqGuidelines')}</TabsTrigger>
        </TabsList>
        <TabsContent value="line">
          <Card className="shadow-lg">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>{t('pollutantTrends')}</CardTitle>
                  <CardDescription>
                    {filteredData.length > 0 
                      ? `Showing ${filteredData.length} data points for the selected period`
                      : 'No data available for the selected time range'
                    }
                  </CardDescription>
                </div>
                <div className="text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                    <span>Real-time data</span>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {filteredData.length > 0 ? (
                <ChartContainer config={CHART_CONFIG} className="h-[400px] w-full">
                  <RechartsLineChart data={filteredData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
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
                  <Line type="monotone" dataKey="CO" name="CO (ppm)" stroke="var(--color-CO)" strokeWidth={2} dot={false} activeDot={{r:6}} />
                    <Line type="monotone" dataKey="VOCs" name="VOCs (ppm)" stroke="var(--color-VOCs)" strokeWidth={2} dot={false} activeDot={{r:6}} />
                    <Line type="monotone" dataKey="PM25" name="PM2.5 (µg/m³)" stroke="var(--color-PM25)" strokeWidth={2} dot={false} activeDot={{r:6}} />
                    <Line type="monotone" dataKey="PM10" name="PM1.0 (µg/m³)" stroke="var(--color-PM10)" strokeWidth={2} dot={false} activeDot={{r:6}} />
                    <Line type="monotone" dataKey="PM100" name="PM10 (µg/m³)" stroke="var(--color-PM100)" strokeWidth={2} dot={false} activeDot={{r:6}} />
                    <Line type="monotone" dataKey="CH4LPG" name="CH4/LPG (ppm)" stroke="var(--color-CH4LPG)" strokeWidth={2} dot={false} activeDot={{r:6}} />
                  </RechartsLineChart>
                </ChartContainer>
              ) : (
                <div className="flex items-center justify-center h-[400px] text-muted-foreground">
                  <div className="text-center">
                    <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-medium mb-2">No Data Available</p>
                    <p className="text-sm">Try selecting a different time range or check back later</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="bar">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>{t('currentPollutantLevels')}</CardTitle>
              <CardDescription>
                Current levels based on the most recent readings in the selected time range
              </CardDescription>
            </CardHeader>
            <CardContent>
               <ChartContainer config={CHART_CONFIG} className="h-[400px] w-full">
                <BarChart data={currentData} layout="vertical" margin={{ top: 5, right: 20, left: 30, bottom: 5 }}>
                  <CartesianGrid horizontal={false} />
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" tickLine={false} axisLine={false} tickMargin={8} width={80} />
                  <Tooltip cursor={{ fill: "hsl(var(--accent) / 0.1)" }} content={<ChartTooltipContent indicator="dot" formatter={(value, name, props) => [
                    `${value} ${props.payload?.unit || ''}`, name
                  ]} />} />
                  <Legend />
                  <Bar dataKey="value" radius={5}>
                     {currentData.map((entry, index) => (
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
                pollutant={t('guidelinePM25Title')}
                guidelines={[
                  { period: t('guidelineAnnualMean'), value: t('guidelinePM25AnnualValue') },
                  { period: t('guideline24HourMean'), value: t('guidelinePM25_24hValue') }
                ]}
              />
              <GuidelineItem
                pollutant={t('guidelinePM10Title')}
                guidelines={[
                  { period: t('guidelineAnnualMean'), value: t('guidelinePM10AnnualValue') },
                  { period: t('guideline24HourMean'), value: t('guidelinePM10_24hValue') }
                ]}
              />
              <GuidelineItem
                pollutant={t('guidelineCOTitle')}
                guidelines={[
                  { period: t('guideline8HourMean'), value: t('guidelineCO_8hValue'), notes: t('guidelineCOMgNote') },
                  { period: t('guideline1HourMean'), value: t('guidelineCO_1hValue') , notes: t('guidelineCONotExceeded') }
                ]}
                generalNote={t('guidelineCOConversionNote')}
              />
              <GuidelineItem
                pollutant={t('guidelineVOCsTitle')}
                guidelines={[]}
                generalNote={t('guidelineVOCsGeneralNote')}
              />
               <div>
                <h4 className="font-semibold text-md mb-2 text-primary">{t('guidelineOzoneRefTitle')}</h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-foreground/90">
                    <li><strong>{t('guideline8HourMeanPeakSeason')}:</strong> {t('guidelineOzoneValue')}</li>
                </ul>
                <p className="text-xs text-muted-foreground mt-1">{t('guidelineOzoneNote')}</p>
              </div>
              <div>
                <h4 className="font-semibold text-md mb-2 text-primary">{t('guidelineNO2RefTitle')}</h4>
                 <ul className="list-disc list-inside space-y-1 text-sm text-foreground/90">
                    <li><strong>{t('guidelineAnnualMean')}:</strong> {t('guidelineNO2AnnualValue')}</li>
                    <li><strong>{t('guideline24HourMean')}:</strong> {t('guidelineNO2_24hValue')}</li>
                </ul>
                 <p className="text-xs text-muted-foreground mt-1">{t('guidelineNO2Note')}</p>
              </div>
               <div>
                <h4 className="font-semibold text-md mb-2 text-primary">{t('guidelineSO2RefTitle')}</h4>
                 <ul className="list-disc list-inside space-y-1 text-sm text-foreground/90">
                    <li><strong>{t('guideline24HourMean')}:</strong> {t('guidelineSO2_24hValue')}</li>
                </ul>
                 <p className="text-xs text-muted-foreground mt-1">{t('guidelineSO2Note')}</p>
              </div>
              <p className="text-xs text-muted-foreground pt-4 border-t mt-4">
                {t('guidelineDisclaimer')}
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </section>
  );
}

