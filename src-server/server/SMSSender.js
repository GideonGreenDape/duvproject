/* eslint-disable no-console */
import axios from 'axios';
import FormData from 'form-data';
import models from './models';


export const KUDI_PROMOTIONAL_API = 'https://my.kudisms.net/api/sms';
export const SENDER = 'DUV LIVE';

export const convertToValidSMSPhoneNumber = (phone) => {
  // remove non-numeric characters
  let convertedPhoneNumber = phone.replace(/[^0-9]/g, '');

  // handle local formats (07..., 08...) by converting to +234
  const phoneFirstTwoChars = convertedPhoneNumber.substring(0, 2);
  if (phoneFirstTwoChars === '07' || phoneFirstTwoChars === '08') {
    convertedPhoneNumber = convertedPhoneNumber.replace(/^0/, '234');
  }

  // return valid number
  return convertedPhoneNumber.length === 13 ? convertedPhoneNumber : phone;
};

/**
 * Send SMS using KudiSMS API
 * @param {Object} params
 * @param {string} params.message - Message to send
 * @param {string} params.phone - Recipient phone number
 * @param {boolean} [params.promotional=false] - If true, sends via promotional route
 */
export const sendSMS = async ({ message, phone }) => {
  const phoneNumber = convertToValidSMSPhoneNumber(phone);

  const data = new FormData();
  data.append('token', process.env.KUDI_SMS_KEY);
  data.append('senderID', SENDER);
  data.append('recipients', phoneNumber);
  data.append('message', message);
  data.append('gateway', '2');


  const apiUrl = KUDI_PROMOTIONAL_API;

  try {
    const response = await axios.post(apiUrl, data, {
      headers: {
        ...data.getHeaders(),
      },
      maxBodyLength: Infinity,
    });

    console.log('SMS sent successfully:', response.data);

    if (result && result.balance) {
      const balance = parseFloat(result.balance.replace(/,/g, ''));
      if (!isNaN(balance)) {
        await models.SmsBalance.create({
          smsBalance: balance,
        });
        console.log(` SMS balance saved: ${balance}`);
      } else {
        console.warn(' Could not parse balance value:', result.balance);
      }
    } else {
      console.warn(' Balance not found in response');
    }

  } catch (error) {
    console.error('Error sending SMS:', error.response?.data || error.message);
    throw error;
  }
};
