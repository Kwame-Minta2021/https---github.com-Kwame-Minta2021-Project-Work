
"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { BarChart, LineChart as RechartsLineChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend, CartesianGrid, Bar, Line, Cell, Rectangle } from 'recharts';
import { MOCK_BAR_CHART_DATA, CHART_CONFIG, MOCK_HEATMAP_DATA_PM25, HEATMAP_CONFIG } from '@/lib/constants';
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";
import type { HistoricalDataPoint, HeatmapDataPoint } from '@/types';
import { parseISO, format, differenceInDays, isValid } from 'date-fns';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import React from "react";

interface DataVisualizationProps {
  historicalData: HistoricalDataPoint[];
}

export default function DataVisualization({ historicalData }: DataVisualizationProps) {
  const [selectedHeatmapPollutant, setSelectedHeatmapPollutant] = React.useState<'PM2.5' | 'CO' | 'VOCs'>('PM2.5');
  
  // Note: For a real app, MOCK_HEATMAP_DATA would be fetched or generated based on selectedHeatmapPollutant
  // For this prototype, we only have PM2.5 heatmap data.
  const currentHeatmapData = MOCK_HEATMAP_DATA_PM25;


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
    
    if (!isValid(firstDate) || !isValid(lastDate)) {
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
  
  const CustomHeatmapTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload as HeatmapDataPoint;
      return (
        <div className="bg-background p-2 border border-border shadow-lg rounded-md text-sm">
          <p className="font-semibold">{`Day: ${data.day}, Hour: ${data.hour}:00`}</p>
          <p>{`${HEATMAP_CONFIG.tooltipLabel}: ${data.value.toFixed(2)}`}</p>
        </div>
      );
    }
    return null;
  };


  return (
    <section id="visualizations" className="mb-8 scroll-mt-20">
      <h2 className="text-2xl font-semibold tracking-tight mb-4">Data Visualizations</h2>
      <Tabs defaultValue="line" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-4">
          <TabsTrigger value="line">Line Charts</TabsTrigger>
          <TabsTrigger value="bar">Bar Graphs</TabsTrigger>
          <TabsTrigger value="heatmap">Heatmap</TabsTrigger>
        </TabsList>
        <TabsContent value="line">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Pollutant Trends Over Time</CardTitle>
              <CardDescription>Hourly trends for key pollutants based on selected date range.</CardDescription>
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
                  <Line type="monotone" dataKey="VOCs" name="VOCs (ppm)" stroke="var(--color-VOCs)" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="PM25" name="PM2.5 (µg/m³)" stroke="var(--color-PM25)" strokeWidth={2} dot={false} />
                </RechartsLineChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="bar">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Current Pollutant Levels</CardTitle>
              <CardDescription>Comparison of current pollutant readings (not affected by date range).</CardDescription>
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
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                  </Bar>
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="heatmap">
          <Card className="shadow-lg">
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>PM2.5 Weekly Heatmap</CardTitle>
                  <CardDescription>Concentration of PM2.5 over the past week, by hour and day.</CardDescription>
                </div>
                {/* Placeholder for future pollutant selector for heatmap */}
                {/* <Select value={selectedHeatmapPollutant} onValueChange={(val) => setSelectedHeatmapPollutant(val as any)}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select pollutant" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PM2.5">PM2.5</SelectItem>
                    <SelectItem value="CO" disabled>CO (coming soon)</SelectItem>
                    <SelectItem value="VOCs" disabled>VOCs (coming soon)</SelectItem>
                  </SelectContent>
                </Select> */}
              </div>
            </CardHeader>
            <CardContent className="h-[450px] w-full">
              {currentHeatmapData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsLineChart // Using LineChart as a base for custom shapes; BarChart could also work
                    data={currentHeatmapData}
                    margin={{ top: 20, right: 20, bottom: 20, left: 30 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} vertical={false} />
                    <XAxis 
                      dataKey="hour" 
                      type="number" 
                      domain={[0, 23]} 
                      ticks={HEATMAP_CONFIG.hours.filter(h => h % 3 === 0)} // Show every 3 hours
                      label={{ value: "Hour of Day", position: "insideBottom", offset: -10 }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis 
                      dataKey="day" 
                      type="category" 
                      domain={HEATMAP_CONFIG.days}
                      label={{ value: "Day of Week", angle: -90, position: "insideLeft", offset: -20 }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <Tooltip content={<CustomHeatmapTooltip />} cursor={{ stroke: 'hsl(var(--foreground))', strokeWidth: 1, fill: 'transparent' }} />
                    {/* Render heatmap cells using Scatter or custom shapes */}
                    {/* This is a simplified way to render cells. A true heatmap might use a Scatter chart or custom shape rendering. */}
                    {currentHeatmapData.map((point, index) => (
                       <Cell key={`cell-${index}-${point.day}-${point.hour}`}>
                         <Rectangle
                           // Calculate X and Y based on categorical data (hour, day)
                           // This requires knowing the band size, which Recharts usually handles internally for Bar/Scatter.
                           // For full control, one might need to calculate positions manually or use a Scatter plot.
                           // The example below is conceptual for colors. A proper layout needs more.
                           fill={HEATMAP_CONFIG.colorScale(point.value)}
                           // These props need careful calculation for a grid based on chart dimensions / band widths
                           // x, y, width, height are normally calculated by parent chart components (like Bar, Scatter point)
                           // For this example, we are showing the *concept* of colored cells.
                           // A more robust heatmap in Recharts often uses Scatter with custom shapes or direct SVG manipulation.
                         />
                       </Cell>
                     ))}
                     {/* Fallback: Simple Scatter plot to show points if direct Rectangles are too complex for now */}
                     {/* This will render dots, not squares, but demonstrates data mapping */}
                     {HEATMAP_CONFIG.days.map((day, dayIndex) => 
                        HEATMAP_CONFIG.hours.map((hour, hourIndex) => {
                            const point = currentHeatmapData.find(p => p.day === day && p.hour === hour);
                            const value = point ? point.value : 0;
                            const color = HEATMAP_CONFIG.colorScale(value);
                            // Calculate center points for each cell
                            // This is an approximation and depends on chart dimensions and scales
                            return (
                                <Rectangle
                                    key={`rect-${day}-${hour}`}
                                    x={hourIndex * (100/24) + '%'} // Conceptual % based positioning
                                    y={dayIndex * (100/7) + '%'} // Conceptual % based positioning
                                    width={(100/24) + '%'}
                                    height={(100/7) + '%'}
                                    fill={color}
                                    stroke={value > 0 ? "hsl(var(--border))" : "none"} // Add border to non-empty cells
                                    strokeWidth={0.5}
                                    data-value={value} // For tooltip or interaction
                                    className="recharts-heatmap-cell" // for potential global styling
                                />
                            );
                        })
                     )}
                  </RechartsLineChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-muted-foreground text-center">Heatmap data is not available for the selected pollutant.</p>
              )}
            </CardContent>
             <style jsx global>{`
                .recharts-surface:focus {
                    outline: none;
                }
                .recharts-wrapper:focus {
                    outline: none;
                }
                .recharts-heatmap-cell:hover {
                    stroke: hsl(var(--foreground));
                    stroke-width: 1.5px;
                    opacity: 0.8;
                }
            `}</style>
          </Card>
        </TabsContent>
      </Tabs>
    </section>
  );
}

// Helper to create a proper grid layout for Rectangle heatmap cells.
// This is a more advanced Recharts usage.
// For now, the above uses a simplified conceptual approach.
// A fully functional Recharts heatmap with Rectangles often requires calculating exact x, y, width, height based on axes scales.
// Or using a Scatter chart with custom square symbols.
// The solution above with stacked Rectangles based on percentage is a visual approximation.
// The `XAxis` and `YAxis` will define the scales, and then we can map `point.hour` and `point.day` to these scales.
// The issue is `Rectangle` doesn't automatically use `dataKey` like `Bar` or `Line`'s points.
// So we'd typically map over data and render a `<Layer>` of `<Rectangle>` components.
// The current approach in the XML uses a map inside the chart component to render rectangles conceptually.
// The x and y values for Rectangle need to be pixels or map to the scale. 
// Percentages for x,y,width,height within `ResponsiveContainer` are one way to achieve a grid.
// The current code renders a set of Rectangles using percentage widths/heights.
// This is a common approach for a basic heatmap in Recharts without custom calculations for each cell's pixel position.

