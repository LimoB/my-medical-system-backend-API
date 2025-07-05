// import axios from 'axios'
// import dotenv from 'dotenv'
// import moment from 'moment'
// dotenv.config()

// const {
//   MPESA_CONSUMER_KEY,
//   MPESA_CONSUMER_SECRET,
//   MPESA_SHORTCODE,
//   MPESA_PASSKEY,
//   MPESA_CALLBACK_URL
// } = process.env

// const baseURL = 'https://sandbox.safaricom.co.ke'

// export async function getAccessToken(): Promise<string> {
//   const auth = Buffer.from(`${MPESA_CONSUMER_KEY}:${MPESA_CONSUMER_SECRET}`).toString('base64')
//   const { data } = await axios.get(`${baseURL}/oauth/v1/generate?grant_type=client_credentials`, {
//     headers: {
//       Authorization: `Basic ${auth}`,
//     },
//   })
//   return data.access_token
// }

// export async function initiateSTKPush(phone: string, amount: number): Promise<any> {
//   const access_token = await getAccessToken()
//   const timestamp = moment().format('YYYYMMDDHHmmss')
//   const password = Buffer.from(`${MPESA_SHORTCODE}${MPESA_PASSKEY}${timestamp}`).toString('base64')

//   const payload = {
//     BusinessShortCode: MPESA_SHORTCODE,
//     Password: password,
//     Timestamp: timestamp,
//     TransactionType: 'CustomerPayBillOnline',
//     Amount: amount,
//     PartyA: phone,
//     PartyB: MPESA_SHORTCODE,
//     PhoneNumber: phone,
//     CallBackURL: MPESA_CALLBACK_URL,
//     AccountReference: 'Test123',
//     TransactionDesc: 'Payment for services',
//   }

//   const { data } = await axios.post(`${baseURL}/mpesa/stkpush/v1/processrequest`, payload, {
//     headers: {
//       Authorization: `Bearer ${access_token}`,
//     },
//   })

//   return data
// }
