
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
    const twilioAccountSid = process.env.TWILIO_ACCOUNT_SID;
    const twilioAuthToken = process.env.TWILIO_AUTH_TOKEN;
    const twilioFromNumber = process.env.TWILIO_FROM_NUMBER;

    if (!toPhoneNumber) {
      const msg = "Recipient phone number (CONTROL_UNIT_PHONE env var or targetPhoneNumber input) is not set.";
      console.warn(`Warning: ${msg}`);
      return { status: `SMS sending failed: ${msg}`, messageSent: "" };
    }
    if (!twilioAccountSid || !twilioAuthToken || !twilioFromNumber) {
      const msg = "Twilio credentials (TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_FROM_NUMBER) are not fully configured in environment variables.";
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

    const twilioApiUrl = `https://api.twilio.com/2010-04-01/Accounts/${twilioAccountSid}/Messages.json`;
    
    const requestBody = new URLSearchParams();
    requestBody.append('To', toPhoneNumber);
    requestBody.append('From', twilioFromNumber);
    requestBody.append('Body', smsMessage);

    try {
      const response = await fetch(twilioApiUrl, {
        method: 'POST',
        headers: {
          'Authorization': 'Basic ' + Buffer.from(`${twilioAccountSid}:${twilioAuthToken}`).toString('base64'),
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: requestBody.toString(),
      });

      const responseData = await response.json();

      if (response.ok && responseData.sid) {
        console.log(`SMS successfully sent to ${toPhoneNumber}. SID: ${responseData.sid}`);
        return { 
          status: `SMS report successfully sent to ${toPhoneNumber}.`, 
          messageSent: smsMessage,
          messageSid: responseData.sid 
        };
      } else {
        console.error("Twilio API error:", responseData);
        const errorMessage = responseData.message || `Twilio API responded with status ${response.status}`;
        return { 
          status: `Failed to send SMS report to ${toPhoneNumber}. ${errorMessage}`, 
          messageSent: smsMessage,
          error: errorMessage
        };
      }
    } catch (error) {
      console.error("Error sending SMS via Twilio:", error);
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred during SMS sending.";
      return { 
        status: `Failed to send SMS report to ${toPhoneNumber}. ${errorMessage}`,
        messageSent: smsMessage,
        error: errorMessage
      };
    }
  }
);
