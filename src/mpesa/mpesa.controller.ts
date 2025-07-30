// import { Request, Response } from 'express'
// import { initiateSTKPush } from './daraja.service'
// import { stkPushSchema } from './mpesa.schemas'

// export async function payWithMpesa(req: Request, res: Response) {
//   const parseResult = stkPushSchema.safeParse(req.body)
//   if (!parseResult.success) {
//     return res.status(400).json({ error: parseResult.error.flatten() })
//   }

//   const { phone, amount } = parseResult.data

//   try {
//     const response = await initiateSTKPush(phone, amount)
//     res.json(response)
//   } catch (err) {
//     console.error('STK Error:', err)
//     res.status(500).json({ error: 'Failed to initiate payment' })
//   }
// }

// export function mpesaCallback(req: Request, res: Response) {
//   console.log('✅ M-Pesa Callback:', req.body)
//   // TODO: Persist to DB
//   res.sendStatus(200)
// }
