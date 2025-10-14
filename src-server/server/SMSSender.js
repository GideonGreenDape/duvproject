/* eslint-disable no-console */
import axios from 'axios';
import FormData from 'form-data';

export const KUDI_SMS_API = 'https://my.kudisms.net/api/corporate';
export const SENDER = 'DUV LIVE';

export const convertToValidSMSPhoneNumber = (phone) => {
  // remove all spaces
  // remove +
  let convertedPhoneNumber = phone.replace(/[^0-9]/g, '');
  // convert 07 and 08 to 234
  const phoneFirstTwoChars = convertedPhoneNumber.substring(0, 2);
  if (phoneFirstTwoChars === '07' || phoneFirstTwoChars === '08') {
    convertedPhoneNumber = convertedPhoneNumber.replace(/^.{1}/g, '234');
  }
  // return valid number
  return convertedPhoneNumber.length === 13 ? convertedPhoneNumber : phone;
};

export const sendSMS = async ({ message, phone }) => {
  const phoneNumber = convertToValidSMSPhoneNumber(phone);

  const data = new FormData();
  data.append('token', process.env.KUDI_SMS_KEY); 
  data.append('senderID', SENDER);
  data.append('recipients', phoneNumber);
  data.append('message', message);

  try {
    const response = await axios.post(KUDI_SMS_API, data, {
      headers: {
        ...data.getHeaders(),
      },
      maxBodyLength: Infinity,
    });
    console.log('SMS sent successfully:', response.data);
  } catch (error) {
    console.error('Error sending SMS:', error.response?.data || error.message);
  }
};




// SMS CONTENT CAN BE FOUND HERE
// https://docs.google.com/spreadsheets/d/1qV1qHePqdJbG5DI8-REKXZGvF4-YHuk3cU_vjjRtXMY/edit#gid=0
