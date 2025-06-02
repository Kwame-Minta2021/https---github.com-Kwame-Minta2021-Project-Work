
'use server';
/**
 * @fileOverview Generates locality-specific air quality advice based on sensor readings.
 *
 * - generateLocalityReport - A function that provides advice for a general locality.
 * - GenerateLocalityReportInput - The input type for the generateLocalityReport function.
 * - GenerateLocalityReportOutput - The return type for the generateLocalityReport function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateLocalityReportInputSchema = z.object({
  co: z.number().describe('Carbon Monoxide (CO) level in ppm.'),
  vocs: z.number().describe('Volatile Organic Compounds (VOCs) level in ppm.'),
  ch4Lpg: z.number().describe('Methane/Liquefied Petroleum Gas (CH4/LPG) level in ppm.'),
  pm1_0: z.number().describe('Particulate Matter 1.0 (PM1.0) level in ug/m3.'),
  pm2_5: z.number().describe('Particulate Matter 2.5 (PM2.5) level in ug/m3.'),
  pm10: z.number().describe('Particulate Matter 10 (PM10) level in ug/m3.'),
  language: z.string().describe('The language for the report (e.g., "en", "fr").'),
});
export type GenerateLocalityReportInput = z.infer<typeof GenerateLocalityReportInputSchema>;

const GenerateLocalityReportOutputSchema = z.object({
  localitySpecificAdvice: z.string().describe('Concise, actionable advice for occupants in a general urban/suburban locality based on the provided air quality readings. This response should be in the language specified in the input and contain no markdown formatting.'),
});
export type GenerateLocalityReportOutput = z.infer<typeof GenerateLocalityReportOutputSchema>;

export async function generateLocalityReport(input: GenerateLocalityReportInput): Promise<GenerateLocalityReportOutput> {
  return generateLocalityReportFlow(input);
}

const localityReportPrompt = ai.definePrompt({
  name: 'generateLocalityReportPrompt',
  input: {schema: GenerateLocalityReportInputSchema},
  output: {schema: GenerateLocalityReportOutputSchema},
  prompt: `You are an environmental health AI assistant. Based on the following air quality readings from a general urban/suburban area, provide practical and actionable advice for the occupants in that locality.
The advice should be clear, concise, and easy to understand for the general public.
Consider what typical activities might be affected and what precautions people should take.

IMPORTANT: Respond ENTIRELY in the language specified by the '{{language}}' parameter.
IMPORTANT RESPONSE FORMATTING:
- Provide your response as plain text IN THE SPECIFIED LANGUAGE ({{language}}).
- Do NOT use any markdown formatting (e.g., no asterisks, no hashes, no lists, no links).
- The "localitySpecificAdvice" field should be a simple string.

Air Quality Data:
CO (Carbon Monoxide): {{co}} ppm
VOCs (Volatile Organic Compounds): {{vocs}} ppm
CH4/LPG (Methane/LPG): {{ch4Lpg}} ppm
PM1.0: {{pm1_0}} µg/m³
PM2.5: {{pm2_5}} µg/m³
PM10: {{pm10}} µg/m³
Language for response: {{language}}

Generate the "localitySpecificAdvice".
`,
});

const generateLocalityReportFlow = ai.defineFlow(
  {
    name: 'generateLocalityReportFlow',
    inputSchema: GenerateLocalityReportInputSchema,
    outputSchema: GenerateLocalityReportOutputSchema,
  },
  async (input) => {
    const {output} = await localityReportPrompt(input);
    return output!;
  }
);

