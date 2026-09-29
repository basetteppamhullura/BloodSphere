/**
 * BloodNet SMS Service Module
 * Handles sending camp registration confirmation SMS messages.
 * 
 * Configurable via environment variables:
 * - SMS_PROVIDER (default: 'auto' | 'twilio' | 'msg91' | 'generic')
 * - SMS_PROVIDER_API_KEY / MSG91_AUTH_KEY
 * - TWILIO_ACCOUNT_SID
 * - TWILIO_AUTH_TOKEN
 * - TWILIO_PHONE_NUMBER / SMS_SENDER_ID
 */

export const sendCampRegistrationConfirmation = async ({
  phoneNumber,
  fullName,
  campTitle,
  campDate,
  campTime,
  campVenue,
  city,
  registrationId
}) => {
  const normalizedPhone = phoneNumber.startsWith('+') 
    ? phoneNumber 
    : (phoneNumber.length === 10 ? `+91${phoneNumber}` : phoneNumber);

  const messageText = `BloodNet: Your registration for ${campTitle} is confirmed. Date: ${campDate}. Venue: ${campVenue}, ${city}. Registration ID: ${registrationId}. Please carry a valid ID. Thank you for supporting blood donation.`;

  console.log(`[SMS Service] Preparing SMS to ${normalizedPhone}: "${messageText}"`);

  // Check for Twilio Credentials
  const twilioSid = process.env.TWILIO_ACCOUNT_SID;
  const twilioAuthToken = process.env.TWILIO_AUTH_TOKEN;
  const twilioPhone = process.env.TWILIO_PHONE_NUMBER || process.env.SMS_SENDER_ID;

  // Check for Generic / MSG91 Provider Credentials
  const apiKey = process.env.SMS_PROVIDER_API_KEY || process.env.MSG91_AUTH_KEY;

  try {
    // 1. Twilio Provider
    if (twilioSid && twilioAuthToken && twilioPhone) {
      console.log(`[SMS Service] Attempting Twilio delivery to ${normalizedPhone}...`);
      const authHeader = 'Basic ' + Buffer.from(`${twilioSid}:${twilioAuthToken}`).toString('base64');
      const params = new URLSearchParams({
        To: normalizedPhone,
        From: twilioPhone,
        Body: messageText
      });

      const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${twilioSid}/Messages.json`, {
        method: 'POST',
        headers: {
          'Authorization': authHeader,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: params.toString()
      });

      const data = await response.json();
      if (response.ok && data.sid) {
        console.log(`[SMS Service] Twilio SMS delivered successfully! SID: ${data.sid}`);
        return {
          success: true,
          status: 'SENT',
          provider: 'Twilio',
          messageId: data.sid,
          message: 'Confirmation SMS delivered successfully.'
        };
      } else {
        console.error('[SMS Service] Twilio delivery error:', data.message || data);
        return {
          success: false,
          status: 'FAILED',
          provider: 'Twilio',
          error: data.message || 'Twilio SMS sending failed.'
        };
      }
    }

    // 2. Generic HTTP API Provider / MSG91
    if (apiKey) {
      console.log(`[SMS Service] Attempting Generic API delivery to ${normalizedPhone}...`);
      const endpoint = process.env.SMS_API_ENDPOINT || 'https://api.msg91.com/api/v5/flow/';
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'authkey': apiKey
        },
        body: JSON.stringify({
          mobiles: normalizedPhone.replace('+', ''),
          message: messageText,
          sender: process.env.SMS_PROVIDER_SENDER_ID || 'BLDNET'
        })
      });

      if (response.ok) {
        console.log(`[SMS Service] Generic API SMS delivered successfully.`);
        return {
          success: true,
          status: 'SENT',
          provider: 'GenericAPI',
          message: 'Confirmation SMS delivered successfully.'
        };
      } else {
        const errText = await response.text();
        console.error('[SMS Service] Generic API error:', errText);
        return {
          success: false,
          status: 'FAILED',
          provider: 'GenericAPI',
          error: errText || 'SMS delivery failed.'
        };
      }
    }

    // 3. Fallback / Simulation Mode (when environment variables are not yet configured)
    console.log(`[SMS Service Notice] SMS environment variables (TWILIO_ACCOUNT_SID / SMS_PROVIDER_API_KEY) not set.`);
    console.log(`[SMS Service Simulated Dispatch] To: ${normalizedPhone} | ID: ${registrationId}`);
    
    return {
      success: true,
      status: 'SIMULATED',
      provider: 'Simulation',
      message: 'Confirmation SMS simulated successfully (no live SMS credentials configured).'
    };

  } catch (err) {
    console.error('[SMS Service Exception]', err);
    return {
      success: false,
      status: 'FAILED',
      provider: 'Error',
      error: err.message || 'Network exception while connecting to SMS provider.'
    };
  }
};
