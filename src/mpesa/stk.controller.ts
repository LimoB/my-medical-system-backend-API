// // src/mpesa/stk.controller.ts
// import axios from 'axios'
// import base64 from 'base-64'
// import { Request, Response } from 'express'

// const consumerKey = process.env.MPESA_CONSUMER_KEY!
// const consumerSecret = process.env.MPESA_CONSUMER_SECRET!
// const shortcode = process.env.MPESA_SHORTCODE!
// const passkey = process.env.MPESA_PASSKEY!
// const callbackUrl = process.env.MPESA_CALLBACK_URL!

// const generateAccessToken = async () => {
//   const auth = base64.encode(`${consumerKey}:${consumerSecret}`)
//   const { data } = await axios.get(
//     'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials',
//     { headers: { Authorization: `Basic ${auth}` } }
//   )
//   return data.access_token
// }

// export const initiateSTKPush = async (req: Request, res: Response) => {
//   const { phone, amount } = req.body
//   try {
//     const accessToken = await generateAccessToken()
//     const timestamp = new Date().toISOString().replace(/[-:TZ.]/g, '').slice(0, 14)
//     const password = Buffer.from(`${shortcode}${passkey}${timestamp}`).toString('base64')

//     const payload = {
//       BusinessShortCode: shortcode,
//       Password: password,
//       Timestamp: timestamp,
//       TransactionType: 'CustomerPayBillOnline',
//       Amount: amount,
//       PartyA: phone,
//       PartyB: shortcode,
//       PhoneNumber: phone,
//       CallBackURL: callbackUrl,
//       AccountReference: 'Invoice123',
//       TransactionDesc: 'Payment for services',
//     }

//     const { data } = await axios.post(
//       'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest',
//       payload,
//       { headers: { Authorization: `Bearer ${accessToken}` } }
//     )

//     res.status(200).json(data)
//   } catch (err: any) {
//     console.error('STK Push Error:', err.response?.data || err.message)
//     res.status(500).json({ error: 'Failed to initiate STK Push' })
//   }
// }

// export const handleMpesaCallback = (req: Request, res: Response) => {
//   console.log('M-Pesa Callback:', JSON.stringify(req.body, null, 2))

//   // Here you would save transaction result to DB

//   res.status(200).json({ ResultCode: 0, ResultDesc: 'Accepted' })
// }
