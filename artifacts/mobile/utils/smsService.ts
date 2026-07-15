import AsyncStorage from '@react-native-async-storage/async-storage';

export interface SmsConfig {
  enabled: boolean;
  provider: 'fast2sms' | 'twilio' | 'disabled';
  apiKey: string;
  twilioSid?: string;
  twilioPhone?: string;
}

// Pure JS Base64 encoder for environment compatibility
const encodeBase64 = (str: string): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  let result = '';
  let i = 0;
  while (i < str.length) {
    const char1 = str.charCodeAt(i++);
    const char2 = i < str.length ? str.charCodeAt(i++) : NaN;
    const char3 = i < str.length ? str.charCodeAt(i++) : NaN;

    const byte1 = char1 >> 2;
    const byte2 = ((char1 & 3) << 4) | (isNaN(char2) ? 0 : char2 >> 4);
    const byte3 = isNaN(char2) ? 64 : ((char2 & 15) << 2) | (isNaN(char3) ? 0 : char3 >> 6);
    const byte4 = isNaN(char3) ? 64 : char3 & 63;

    result += chars.charAt(byte1) + chars.charAt(byte2) + 
              (byte3 === 64 ? '=' : chars.charAt(byte3)) + 
              (byte4 === 64 ? '=' : chars.charAt(byte4));
  }
  return result;
};

// Pure JS Query String serializer
const encodeQueryString = (params: Record<string, string>): string => {
  return Object.keys(params)
    .map(key => encodeURIComponent(key) + '=' + encodeURIComponent(params[key]))
    .join('&');
};

export const getSmsConfig = async (): Promise<SmsConfig> => {
  try {
    const data = await AsyncStorage.getItem('localone_sms_config');
    if (data) {
      return JSON.parse(data) as SmsConfig;
    }
  } catch (e) {
    console.error('Failed to load SMS config', e);
  }
  return { enabled: false, provider: 'disabled', apiKey: '' };
};

export const saveSmsConfig = async (config: SmsConfig): Promise<void> => {
  try {
    await AsyncStorage.setItem('localone_sms_config', JSON.stringify(config));
  } catch (e) {
    console.error('Failed to save SMS config', e);
  }
};

export const sendSmsOtp = async (mobile: string, otp: string): Promise<{ success: boolean; message: string }> => {
  const config = await getSmsConfig();
  
  if (!config.enabled || config.provider === 'disabled' || !config.apiKey) {
    return { 
      success: false, 
      message: `SMS Gateway disabled. Use OTP: ${otp} (Demo Mode)` 
    };
  }

  const formattedMobile = mobile.replace(/[^0-9]/g, '');

  if (config.provider === 'fast2sms') {
    try {
      const response = await fetch('https://www.fast2sms.com/dev/bulkV2', {
        method: 'POST',
        headers: {
          'authorization': config.apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          variables_values: otp,
          route: 'otp',
          numbers: formattedMobile,
        }),
      });

      const resJson = await response.json();
      if (response.ok && resJson.return === true) {
        return { success: true, message: 'SMS sent successfully via Fast2SMS!' };
      } else {
        return { 
          success: false, 
          message: resJson.message || 'Fast2SMS API rejected the request.' 
        };
      }
    } catch (err: any) {
      return { success: false, message: err.message || 'Network error on Fast2SMS request.' };
    }
  }

  if (config.provider === 'twilio') {
    if (!config.twilioSid || !config.twilioPhone) {
      return { success: false, message: 'Twilio Account SID or Sender Phone Number is missing.' };
    }

    try {
      const rawCreds = `${config.twilioSid}:${config.apiKey}`;
      const credentials = encodeBase64(rawCreds);
      const toPhone = formattedMobile.startsWith('91') && formattedMobile.length > 10 
        ? `+${formattedMobile}` 
        : `+91${formattedMobile}`;

      const response = await fetch(
        `https://api.twilio.com/2010-04-01/Accounts/${config.twilioSid}/Messages.json`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Basic ${credentials}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: encodeQueryString({
            Body: `Your LocalOne OTP is: ${otp}. Valid for 5 minutes.`,
            From: config.twilioPhone,
            To: toPhone,
          }),
        }
      );

      const resJson = await response.json();
      if (response.ok) {
        return { success: true, message: 'SMS sent successfully via Twilio!' };
      } else {
        return { 
          success: false, 
          message: resJson.message || 'Twilio API rejected the request.' 
        };
      }
    } catch (err: any) {
      return { success: false, message: err.message || 'Network error on Twilio request.' };
    }
  }

  return { success: false, message: 'Unknown SMS provider.' };
};
