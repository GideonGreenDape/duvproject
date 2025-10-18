import axios from 'axios';
import { getProxy } from './helpers';



export const KUDI_SMS_API = 'https://my.kudisms.net/api';

export const API_HOST = process.env.REACT_APP_API_HOST;

export const buildBackendSMSUrl = (endpoint = '/dlr/kudisms') =>
  `${getProxy}/api/v1/${endpoint}`;

export const buildKudiSMSActionUrl = (action = 'balance') => {
  return `${KUDI_SMS_API}/${action}`;
};

export const callKudiSMS = async (action = 'balance', payload = {}) => {
  try {
    const data = new FormData();

    const token = process.env.REACT_APP_KUDI_SMS_TOKEN;
    if (!token) {
      throw new Error('KUDI SMS token is not configured');
    }
    data.append('token', token);

    Object.entries(payload).forEach(([key, value]) => {
      data.append(key, value);
    });

    
    const response = await axios.post(buildKudiSMSActionUrl(action), data, {
      maxBodyLength: Infinity,
    });

    console.log(response);

    const respData = response.data;

    if (respData && respData.status && respData.status === 'error') {
      console.warn(`KudiSMS API Error: ${respData.msg || 'Unknown error'}`);
      return { balance: 0, error: respData.msg };
    }

    return respData;
  } catch (error) {
    console.error(`Error calling KudiSMS (${action}):`, error);
    return { balance: 0, error: error.message || 'Request failed' };
  }
};
