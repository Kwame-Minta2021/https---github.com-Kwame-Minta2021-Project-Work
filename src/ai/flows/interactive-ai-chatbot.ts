'use server';

/**
 * @fileOverview An interactive AI chatbot for answering user questions about air quality.
 *
 * - askChatbot - A function that handles user questions and returns chatbot responses.
 * - AskChatbotInput - The input type for the askChatbot function.
 * - AskChatbotOutput - The return type for the askChatbot function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AskChatbotInputSchema = z.object({
  question: z.string().describe('The user question about air quality.'),
  coLevel: z.number().describe('The current level of Carbon Monoxide (CO) in ppm.'),
  vocLevel: z.number().describe('The current level of Volatile Organic Compounds (VOCs) in ppm.'),
  ch4LpgLevel: z.number().describe('The current level of Methane/Liquefied Petroleum Gas (CH4/LPG) in ppm.'),
  pm1Level: z.number().describe('The current level of Particulate Matter 1.0 (PM1.0) in ug/m3.'),
  pm25Level: z.number().describe('The current level of Particulate Matter 2.5 (PM2.5) in ug/m3.'),
  pm10Level: z.number().describe('The current level of Particulate Matter 10 (PM10) in ug/m3.'),
});
export type AskChatbotInput = z.infer<typeof AskChatbotInputSchema>;

const AskChatbotOutputSchema = z.object({
  response: z.string().describe('The chatbot response to the user question.'),
});
export type AskChatbotOutput = z.infer<typeof AskChatbotOutputSchema>;

export async function askChatbot(input: AskChatbotInput): Promise<AskChatbotOutput> {
  return askChatbotFlow(input);
}

const prompt = ai.definePrompt({
  name: 'askChatbotPrompt',
  input: {schema: AskChatbotInputSchema},
  output: {schema: AskChatbotOutputSchema},
  prompt: `You are an AI chatbot providing information about air quality.

You have access to the following real-time sensor readings:
- CO (MQ-9): {{{coLevel}}} ppm
- VOCs (MQ-135): {{{vocLevel}}} ppm
- CH4/LPG (MQ-5): {{{ch4LpgLevel}}} ppm
- PM1.0: {{{pm1Level}}} ug/m3
- PM2.5: {{{pm25Level}}} ug/m3
- PM10: {{{pm10Level}}} ug/m3

Answer the following question from the user, using the sensor data to inform your answer where relevant. Be accurate, helpful, and user-friendly.

Question: {{{question}}}`,
});

const askChatbotFlow = ai.defineFlow(
  {
    name: 'askChatbotFlow',
    inputSchema: AskChatbotInputSchema,
    outputSchema: AskChatbotOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
