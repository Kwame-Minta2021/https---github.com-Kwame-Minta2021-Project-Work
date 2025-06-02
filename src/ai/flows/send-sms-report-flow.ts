
// src/ai/flows/send-sms-report-flow.ts
'use server';
/**
 * @fileOverview A Genkit flow to format and simulate sending an SMS report of air quality to a control unit.
 *
 * - sendSmsReportFlow - A function that formats an SMS and logs it.
 * - SendSmsReportInput - The input type for the sendSmsReportFlow function.
 * - SendSmsReportOutput - The return type for the sendSmsReportFlow function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { format } from 'date-fns'; // For formatting the date in the SMS

const SendSmsReportInputSchema = z.object({
  reportDate: z.string().describe("The date for the report, in ISO string format."),
  language: z.string().describe("The language of the report content (e.g., 'en', 'fr')."),
  currentReadings: z.object({
    co: z.number(),
    vocs: z.number(),
    ch4Lpg: z.number(),
    pm1_0: z.number(),
    pm2_5: z.number(),
    pm10: z.number(),
  }).describe("Current air quality readings."),
  aiAnalysis: z.object({
    effectOnHumanHealth: z.string(),
    bestActionToReducePresence: z.string(),
  }).describe("AI analysis of the air quality in the specified language."),
  targetPhoneNumber: z.string().optional().describe("The phone number to send the SMS to. If not provided, uses a default from environment variables."),
});
export type SendSmsReportInput = z.infer<typeof SendSmsReportInputSchema>;

const SendSmsReportOutputSchema = z.object({
  status: z.string().describe('A message indicating the outcome of the SMS sending attempt.'),
  messageSent: z.string().optional().describe('The content of the message that was "sent".'),
});
export type SendSmsReportOutput = z.infer<typeof SendSmsReportOutputSchema>;

// Main exported function that Next.js components will call
export async function sendSmsReport(input: SendSmsReportInput): Promise<SendSmsReportOutput> {
  return sendSmsReportFlow(input);
}

const sendSmsReportFlow = ai.defineFlow(
  {
    name: 'sendSmsReportFlow',
    inputSchema: SendSmsReportInputSchema,
    outputSchema: SendSmsReportOutputSchema,
  },
  async (input) => {
    const { reportDate, language, currentReadings, aiAnalysis } = input;
    
    // Attempt to get the phone number from input or environment variable
    // IMPORTANT: For a real application, store sensitive data like phone numbers securely,
    // e.g., in environment variables or a secure configuration service.
    // Add CONTROL_UNIT_PHONE to your .env file (e.g., CONTROL_UNIT_PHONE=+11234567890)
    const controlUnitPhoneNumber = input.targetPhoneNumber || process.env.CONTROL_UNIT_PHONE || "DEFAULT_PHONE_NOT_SET";

    if (controlUnitPhoneNumber === "DEFAULT_PHONE_NOT_SET") {
        console.warn("Warning: CONTROL_UNIT_PHONE environment variable is not set. SMS will not be 'sent' to a specific number.");
    }

    const formattedDate = format(new Date(reportDate), 'yyyy-MM-dd HH:mm');
    
    // Construct the SMS message
    // Using simple template literals. For more complex i18n in the message itself,
    // you might pass specific pre-translated parts or use a templating engine with i18n support.
    // Since aiAnalysis parts are already translated, we can use them directly.
    let smsMessage = "";
    if (language === 'fr') {
      smsMessage = `Rapport Air ${formattedDate}: CO ${currentReadings.co.toFixed(1)}ppm, VOC ${currentReadings.vocs.toFixed(1)}ppm, PM2.5 ${currentReadings.pm2_5.toFixed(0)}µg/m³. Santé: ${aiAnalysis.effectOnHumanHealth}. Action: ${aiAnalysis.bestActionToReducePresence}.`;
    } else { // Default to English
      smsMessage = `Air Report ${formattedDate}: CO ${currentReadings.co.toFixed(1)}ppm, VOCs ${currentReadings.vocs.toFixed(1)}ppm, PM2.5 ${currentReadings.pm2_5.toFixed(0)}µg/m³. Health: ${aiAnalysis.effectOnHumanHealth}. Action: ${aiAnalysis.bestActionToReducePresence}.`;
    }

    // Truncate if too long for SMS (typical limit ~160 chars, but varies)
    if (smsMessage.length > 160) {
        smsMessage = smsMessage.substring(0, 157) + "...";
    }

    // Simulate sending the SMS
    console.log(`SIMULATING SENDING SMS to ${controlUnitPhoneNumber}:`);
    console.log(smsMessage);

    // In a real application, you would integrate with an SMS service here:
    // try {
    //   await someSmsService.send({ to: controlUnitPhoneNumber, body: smsMessage });
    //   return { status: `SMS report successfully sent to ${controlUnitPhoneNumber}.`, messageSent: smsMessage };
    // } catch (error) {
    //   console.error("SMS sending failed:", error);
    //   throw new Error("Failed to send SMS report.");
    // }

    return { status: `SMS report for ${controlUnitPhoneNumber} prepared and logged. (Simulation)`, messageSent: smsMessage };
  }
);
