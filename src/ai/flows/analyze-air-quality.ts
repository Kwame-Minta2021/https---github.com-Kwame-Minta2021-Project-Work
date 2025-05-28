// src/ai/flows/analyze-air-quality.ts
'use server';
/**
 * @fileOverview Analyzes air quality data and provides a health impact assessment.
 *
 * - analyzeAirQuality - A function that analyzes air quality and provides a health impact assessment.
 * - AnalyzeAirQualityInput - The input type for the analyzeAirQuality function.
 * - AnalyzeAirQualityOutput - The return type for the analyzeAirQuality function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeAirQualityInputSchema = z.object({
  co: z.number().describe('Carbon Monoxide (CO) level in ppm.'),
  vocs: z.number().describe('Volatile Organic Compounds (VOCs) level in ppm.'),
  ch4Lpg: z.number().describe('Methane/Liquefied Petroleum Gas (CH4/LPG) level in ppm.'),
  pm10: z.number().describe('Particulate Matter 1.0 (PM1.0) level in ug/m3.'),
  pm25: z.number().describe('Particulate Matter 2.5 (PM2.5) level in ug/m3.'),
  pm100: z.number().describe('Particulate Matter 10 (PM10) level in ug/m3.'),
});
export type AnalyzeAirQualityInput = z.infer<typeof AnalyzeAirQualityInputSchema>;

const AnalyzeAirQualityOutputSchema = z.object({
  healthImpact: z.string().describe('A detailed assessment of the potential health impacts based on the air quality data.'),
  recommendations: z.string().describe('Actionable recommendations to mitigate the presence of detected pollutants.'),
});
export type AnalyzeAirQualityOutput = z.infer<typeof AnalyzeAirQualityOutputSchema>;

export async function analyzeAirQuality(input: AnalyzeAirQualityInput): Promise<AnalyzeAirQualityOutput> {
  return analyzeAirQualityFlow(input);
}

const analyzeAirQualityPrompt = ai.definePrompt({
  name: 'analyzeAirQualityPrompt',
  input: {schema: AnalyzeAirQualityInputSchema},
  output: {schema: AnalyzeAirQualityOutputSchema},
  prompt: `You are an expert in environmental science and public health. Analyze the following air quality data to determine the potential health impacts and provide actionable recommendations to mitigate the presence of detected pollutants.

Air Quality Data:
CO (Carbon Monoxide): {{co}} ppm
VOCs (Volatile Organic Compounds): {{vocs}} ppm
CH4/LPG (Methane/Liquefied Petroleum Gas): {{ch4Lpg}} ppm
PM1.0 (Particulate Matter 1.0): {{pm10}} ug/m3
PM2.5 (Particulate Matter 2.5): {{pm25}} ug/m3
PM10 (Particulate Matter 10): {{pm100}} ug/m3

Based on this data, provide a concise yet comprehensive health impact assessment and suggest practical recommendations to improve air quality.
`,
});

const analyzeAirQualityFlow = ai.defineFlow(
  {
    name: 'analyzeAirQualityFlow',
    inputSchema: AnalyzeAirQualityInputSchema,
    outputSchema: AnalyzeAirQualityOutputSchema,
  },
  async input => {
    const {output} = await analyzeAirQualityPrompt(input);
    return output!;
  }
);
