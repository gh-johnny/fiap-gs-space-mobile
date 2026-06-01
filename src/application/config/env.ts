import { z } from 'zod'

const schema = z.object({
  APP_ENV: z.enum(['development', 'production']).default('development'),
  GLOBE_UPDATE_INTERVAL_MS: z.coerce.number().min(1000).default(3000),
  HIDDEN_TRIGGER_TAPS: z.coerce.number().min(3).default(5),
})

export const env = schema.parse({
  APP_ENV: process.env['APP_ENV'],
  GLOBE_UPDATE_INTERVAL_MS: process.env['GLOBE_UPDATE_INTERVAL_MS'],
  HIDDEN_TRIGGER_TAPS: process.env['HIDDEN_TRIGGER_TAPS'],
})

export type Env = typeof env
