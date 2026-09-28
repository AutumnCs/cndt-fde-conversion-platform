export type AppEnv = {
  databaseUrl: string
  redisUrl: string
  telegramBotToken: string
  telegramWebhookSecret: string
  internalJwtSecret: string
  objectStorageEndpoint: string
}

const requiredKeys = [
  'DATABASE_URL',
  'REDIS_URL',
  'TELEGRAM_BOT_TOKEN',
  'TELEGRAM_WEBHOOK_SECRET',
  'INTERNAL_JWT_SECRET',
  'OBJECT_STORAGE_ENDPOINT',
] as const

export function loadEnv(input: Record<string, string | undefined>): AppEnv {
  return {
    databaseUrl: required(input, 'DATABASE_URL'),
    redisUrl: required(input, 'REDIS_URL'),
    telegramBotToken: required(input, 'TELEGRAM_BOT_TOKEN'),
    telegramWebhookSecret: required(input, 'TELEGRAM_WEBHOOK_SECRET'),
    internalJwtSecret: required(input, 'INTERNAL_JWT_SECRET'),
    objectStorageEndpoint: required(input, 'OBJECT_STORAGE_ENDPOINT'),
  }
}

function required(input: Record<string, string | undefined>, key: typeof requiredKeys[number]): string {
  const value = input[key]
  if (!value) {
    throw new Error(`${key} is required`)
  }
  return value
}
