
// src/ai/flows/send-sms-report-flow.ts
'use server';
/**
 * @fileOverview A Genkit flow to format and send an SMS report of air quality to a control unit using Twilio.
 *
 * - sendSmsReportFlow - A function that formats an SMS and sends it via Twilio.
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
  targetPhoneNumber: z.string().optional().describe("The phone number to send the SMS to. If not provided, uses a default from CONTROL_UNIT_PHONE environment variable."),
});
export type SendSmsReportInput = z.infer<typeof SendSmsReportInputSchema>;

const SendSmsReportOutputSchema = z.object({
  status: z.string().describe('A message indicating the outcome of the SMS sending attempt.'),
  messageSent: z.string().optional().describe('The content of the message that was attempted to be sent.'),
  messageSid: z.string().optional().describe('The Twilio message SID if successfully sent.'),
  error: z.string().optional().describe('Error message if sending failed.'),
});
export type SendSmsReportOutput = z.infer<typeof SendSmsReportOutputSchema>;

export async function sendSmsReport(input: SendSmsReportInput): Promise<SendSmsReportOutput> {
  return sendSmsReportFlow(input);
}

const sendSmsReportFlow = ai.defineFlow(
  {
    name: 'sendSmsReportFlow',
    inputSchema: SendSmsReportInputSchema,
    outputSchema: SendSmsReportOutputSchema,
  },
  async (input): Promise<SendSmsReportOutput> => {
    const { reportDate, language, currentReadings, aiAnalysis } = input;
    
    const toPhoneNumber = input.targetPhoneNumber || process.env.CONTROL_UNIT_PHONE;
    const vonageApiKey = process.env.VONAGE_API_KEY;
    const vonageApiSecret = process.env.VONAGE_API_SECRET;

    if (!toPhoneNumber) {
      const msg = "Recipient phone number (CONTROL_UNIT_PHONE env var or targetPhoneNumber input) is not set.";
      console.warn(`Warning: ${msg}`);
      return { status: `SMS sending failed: ${msg}`, messageSent: "" };
    }
    if (!vonageApiKey || !vonageApiSecret) {
      const msg = "Vonage credentials (VONAGE_API_KEY, VONAGE_API_SECRET) are not fully configured in environment variables.";
      console.error(`Error: ${msg}`);
      return { status: `SMS sending failed: ${msg}`, messageSent: "" };
    }

    const formattedDate = format(new Date(reportDate), 'yyyy-MM-dd HH:mm');
    
    let smsMessage = "";
    if (language === 'fr') {
      smsMessage = `Rapport Air ${formattedDate}: CO ${currentReadings.co.toFixed(1)}ppm, VOC ${currentReadings.vocs.toFixed(1)}ppm, PM2.5 ${currentReadings.pm2_5.toFixed(0)}µg/m³, PM10 ${currentReadings.pm10.toFixed(0)}µg/m³. Santé: ${aiAnalysis.effectOnHumanHealth}. Action: ${aiAnalysis.bestActionToReducePresence}.`;
    } else { // Default to English
      smsMessage = `Air Report ${formattedDate}: CO ${currentReadings.co.toFixed(1)}ppm, VOCs ${currentReadings.vocs.toFixed(1)}ppm, PM2.5 ${currentReadings.pm2_5.toFixed(0)}µg/m³, PM10 ${currentReadings.pm10.toFixed(0)}µg/m³. Health: ${aiAnalysis.effectOnHumanHealth}. Action: ${aiAnalysis.bestActionToReducePresence}.`;
    }

    // Standard SMS limit is 160 characters. Truncate if longer.
    const MAX_SMS_LENGTH = 160;
    if (smsMessage.length > MAX_SMS_LENGTH) {
        smsMessage = smsMessage.substring(0, MAX_SMS_LENGTH - 3) + "...";
    }

    const vonageApiUrl = 'https://rest.nexmo.com/sms/json';
    
    const requestBody = {
      api_key: vonageApiKey,
      api_secret: vonageApiSecret,
      to: toPhoneNumber,
      from: 'BreatheEasy',
      text: smsMessage,
    };

    try {
      const response = await fetch(vonageApiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      const responseData = await response.json();

      if (response.ok && responseData.messages && responseData.messages[0].status === '0') {
        const messageId = responseData.messages[0]['message-id'];
        console.log(`SMS successfully sent to ${toPhoneNumber}. Message ID: ${messageId}`);
        return { 
          status: `SMS report successfully sent to ${toPhoneNumber}.`, 
          messageSent: smsMessage,
          messageSid: messageId 
        };
      } else {
        console.error("Vonage API error:", responseData);
        const errorMessage = responseData.messages?.[0]?.['error-text'] || `Vonage API responded with status ${response.status}`;
        return { 
          status: `Failed to send SMS report to ${toPhoneNumber}. ${errorMessage}`, 
          messageSent: smsMessage,
          error: errorMessage
        };
      }
    } catch (error) {
      console.error("Error sending SMS via Vonage:", error);
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred during SMS sending.";
      return { 
        status: `Failed to send SMS report to ${toPhoneNumber}. ${errorMessage}`,
        messageSent: smsMessage,
        error: errorMessage
      };
    }
  }
);
