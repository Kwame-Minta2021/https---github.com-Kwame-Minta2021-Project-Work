
// Recommend actions to reduce the presence of pollutants based on current readings.

'use server';

/**
 * @fileOverview This file defines a Genkit flow for recommending actions to reduce the presence of pollutants based on current air quality readings.
 *
 * - recommendActions - A function that takes air quality readings as input and returns a list of recommended actions.
 * - RecommendActionsInput - The input type for the recommendActions function.
 * - RecommendActionsOutput - The return type for the recommendActions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const RecommendActionsInputSchema = z.object({
  co: z.number().describe('Carbon Monoxide (CO) level in ppm.'),
  vocs: z.number().describe('Volatile Organic Compounds (VOCs) level in ppm.'),
  ch4Lpg: z.number().describe('Methane/Liquefied Petroleum Gas (CH4/LPG) level in ppm.'),
  pm1_0: z.number().describe('Particulate Matter 1.0 (PM1.0) level in ug/m3.'),
  pm2_5: z.number().describe('Particulate Matter 2.5 (PM2.5) level in ug/m3.'),
  pm10: z.number().describe('Particulate Matter 10 (PM10) level in ug/m3.'),
});
export type RecommendActionsInput = z.infer<typeof RecommendActionsInputSchema>;

const RecommendActionsOutputSchema = z.object({
  actions: z.array(
    z.string().describe('Recommended action to reduce pollutant presence.')
  ).describe('A list of recommended actions based on the air quality readings.'),
});
export type RecommendActionsOutput = z.infer<typeof RecommendActionsOutputSchema>;

export async function recommendActions(input: RecommendActionsInput): Promise<RecommendActionsOutput> {
  return recommendActionsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'recommendActionsPrompt',
  input: {schema: RecommendActionsInputSchema},
  output: {schema: RecommendActionsOutputSchema},
  prompt: `Based on the following air quality readings, provide a list of actionable recommendations to reduce the presence of pollutants.

CO (MQ-9): {{co}} ppm
VOCs (MQ-135): {{vocs}} ppm
CH4/LPG (MQ-5): {{ch4Lpg}} ppm
PM1.0: {{pm1_0}} ug/m3
PM2.5: {{pm2_5}} ug/m3
PM10: {{pm10}} ug/m3

Consider the following:
*   Ventilation
*   Air Purifiers
*   Reducing indoor combustion sources (e.g., smoking, gas stoves)
*   Avoiding certain cleaning products
*   Checking and maintaining HVAC systems
*   Sealing gaps in windows and doors

Ensure the recommendations are clear, concise, and directly related to the provided readings.
`,
});

const recommendActionsFlow = ai.defineFlow(
  {
    name: 'recommendActionsFlow',
    inputSchema: RecommendActionsInputSchema,
    outputSchema: RecommendActionsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
