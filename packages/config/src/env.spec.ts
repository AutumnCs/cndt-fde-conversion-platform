import { describe, expect, it } from 'vitest'

import { loadEnv } from './env.js'

const validEnv = {
  DATABASE_URL: 'postgresql://cndt:test@localhost:5432/cndt_test',
  REDIS_URL: 'redis://localhost:6379/1',
  TELEGRAM_BOT_TOKEN: 'test-token',
  TELEGRAM_WEBHOOK_SECRET: 'test-secret',
  INTERNAL_JWT_SECRET: 'test-jwt-secret',
  OBJECT_STORAGE_ENDPOINT: 'http://localhost:9000',
}

describe('loadEnv', () => {
  it('rejects a missing Telegram webhook secret', () => {
    expect(() => loadEnv({ ...validEnv, TELEGRAM_WEBHOOK_SECRET: undefined }))
      .toThrow('TELEGRAM_WEBHOOK_SECRET is required')
  })
})
