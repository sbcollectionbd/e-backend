// src/services/smsService.js
const axios = require("axios");

const sendSMS = async (phone, message) => {
  try {
    await axios.post("https://api.sms.sslwireless.com/send_sms", {
      api_token: process.env.SMS_API_TOKEN,
      sid: process.env.SMS_SID,
      msisdn: phone,
      message
    });
  } catch (err) {
    console.log("SMS error");
  }
};

module.exports = sendSMS;