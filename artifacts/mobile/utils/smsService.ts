import AsyncStorage from '@react-native-async-storage/async-storage';

export interface SmsConfig {
  enabled: boolean;
  provider: 'fast2sms' | 'twilio' | 'disabled';
  apiKey: string;
  twilioSid?: string;
  twilioPhone?: string;
}

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
      const credentials = btoa(`${config.twilioSid}:${config.apiKey}`);
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
          body: new URLSearchParams({
            Body: `Your LocalOne OTP is: ${otp}. Valid for 5 minutes.`,
            From: config.twilioPhone,
            To: toPhone,
          }).toString(),
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
