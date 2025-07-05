// // utils/mpesa.ts
// import axios from 'axios'
// import base64 from 'base-64'

// const consumerKey = process.env.MPESA_CONSUMER_KEY!
// const consumerSecret = process.env.MPESA_CONSUMER_SECRET!

// export const generateAccessToken = async () => {
//   const url = 'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials'
//   const auth = base64.encode(`${consumerKey}:${consumerSecret}`)

//   const { data } = await axios.get(url, {
//     headers: {
//       Authorization: `Basic ${auth}`,
//     },
//   })

//   return data.access_token
// }
