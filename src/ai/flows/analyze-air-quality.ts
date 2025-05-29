
// src/ai/flows/analyze-air-quality.ts
'use server';
/**
 * @fileOverview Analyzes air quality data and provides a health impact assessment and best actions, simulating an RL model.
 *
 * - analyzeAirQuality - A function that analyzes air quality and provides health effects and best actions.
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
  language: z.string().describe('The language for the response (e.g., "en", "fr").'),
});
export type AnalyzeAirQualityInput = z.infer<typeof AnalyzeAirQualityInputSchema>;

const AnalyzeAirQualityOutputSchema = z.object({
  effectOnHumanHealth: z.string().describe('A concise, user-friendly statement detailing the health implications of the detected air quality levels, as if determined by an RL model. This response should be in the language specified in the input.'),
  bestActionToReducePresence: z.string().describe('Specific, actionable recommendations to improve air quality, identified as the optimal action(s) as if by an RL model. This response should be in the language specified in the input.'),
});
export type AnalyzeAirQualityOutput = z.infer<typeof AnalyzeAirQualityOutputSchema>;

export async function analyzeAirQuality(input: AnalyzeAirQualityInput): Promise<AnalyzeAirQualityOutput> {
  return analyzeAirQualityFlow(input);
}

const analyzeAirQualityPrompt = ai.definePrompt({
  name: 'analyzeAirQualityRLSimPrompt', // Renamed for clarity
  input: {schema: AnalyzeAirQualityInputSchema},
  output: {schema: AnalyzeAirQualityOutputSchema},
  prompt: `You are an advanced Reinforcement Learning (RL) model pre-trained on diverse air quality datasets, health outcomes, and environmental interventions.
Your task is to analyze the following air quality data.
Based on your learned policy, assess the current conditions, predict the "Effect on Human Health", and recommend the "Best Action to Reduce Presence" of pollutants.

IMPORTANT: Respond ENTIRELY in the language specified by the '{{language}}' parameter. For example, if '{{language}}' is 'fr', your entire response for "Effect on Human Health" and "Best Action to Reduce Presence" must be in French.

Air Quality Data:
CO (Carbon Monoxide): {{co}} ppm
VOCs (Volatile Organic Compounds): {{vocs}} ppm
CH4/LPG (Methane/Liquefied Petroleum Gas): {{ch4Lpg}} ppm
PM1.0 (Particulate Matter 1.0): {{pm10}} ug/m3
PM2.5 (Particulate Matter 2.5): {{pm25}} ug/m3
PM10 (Particulate Matter 10): {{pm100}} ug/m3
Language for response: {{language}}

Based on this data, provide:
1.  Effect on Human Health: A concise, user-friendly statement detailing the health implications. (In {{language}})
2.  Best Action to Reduce Presence: Specific, actionable recommendations to improve air quality. (In {{language}})
`,
});

const analyzeAirQualityFlow = ai.defineFlow(
  {
    name: 'analyzeAirQualityRLSimFlow', // Renamed for clarity
    inputSchema: AnalyzeAirQualityInputSchema,
    outputSchema: AnalyzeAirQualityOutputSchema,
  },
  async input => {
    const {output} = await analyzeAirQualityPrompt(input);
    return output!;
  }
);

