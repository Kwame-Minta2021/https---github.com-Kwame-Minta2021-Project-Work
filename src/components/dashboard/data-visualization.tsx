"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { BarChart, LineChart as RechartsLineChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend, CartesianGrid, Bar, Line } from 'recharts';
import { MOCK_HISTORICAL_DATA, MOCK_BAR_CHART_DATA, CHART_CONFIG } from '@/lib/constants';
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";


export default function DataVisualization() {
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
              <CardDescription>Hourly trends for key pollutants.</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={CHART_CONFIG} className="h-[400px] w-full">
                <RechartsLineChart data={MOCK_HISTORICAL_DATA} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="time" tickLine={false} axisLine={false} tickMargin={8} />
                  <YAxis tickLine={false} axisLine={false} tickMargin={8} />
                  <Tooltip cursor={{ fill: "hsl(var(--accent) / 0.1)" }} content={<ChartTooltipContent hideLabel />} />
                  <Legend />
                  <Line type="monotone" dataKey="CO" name="CO (ppm)" stroke="var(--color-co)" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="VOCs" name="VOCs (ppm)" stroke="var(--color-vocs)" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="PM25" name="PM2.5 (µg/m³)" stroke="var(--color-pm2_5)" strokeWidth={2} dot={false} />
                </RechartsLineChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="bar">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Current Pollutant Levels</CardTitle>
              <CardDescription>Comparison of current pollutant readings.</CardDescription>
            </CardHeader>
            <CardContent>
               <ChartContainer config={CHART_CONFIG} className="h-[400px] w-full">
                <BarChart data={MOCK_BAR_CHART_DATA} layout="vertical" margin={{ top: 5, right: 20, left: 30, bottom: 5 }}>
                  <CartesianGrid horizontal={false} />
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" tickLine={false} axisLine={false} tickMargin={8} />
                  <Tooltip cursor={{ fill: "hsl(var(--accent) / 0.1)" }} content={<ChartTooltipContent indicator="dot" />} />
                  <Legend />
                  <Bar dataKey="value" radius={5}>
                     {MOCK_BAR_CHART_DATA.map((entry, index) => (
                        <svg key={`cell-${index}`} fill={entry.fill} /> // This is a bit of a hack for recharts fill with CSS variables
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
              <CardTitle>Pollutant Heatmap</CardTitle>
              <CardDescription>Spatial or temporal distribution of pollutants (Placeholder).</CardDescription>
            </CardHeader>
            <CardContent className="h-[400px] flex items-center justify-center">
              <p className="text-muted-foreground">Heatmap visualization coming soon.</p>
               <img src="https://placehold.co/600x300.png" alt="Placeholder Heatmap" data-ai-hint="data heatmap" className="rounded-md object-cover" />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </section>
  );
}
