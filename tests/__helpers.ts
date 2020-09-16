/* eslint-disable jest/require-top-level-describe */
/* eslint-disable jest/no-hooks */
// tests/__helpers.ts

import {
  createTestContext as originalCreateTestContext,
  TestContext,
} from 'nexus/testing'

export function createTestContext() {
  // eslint-disable-next-line prefer-const
  const ctx = {} as TestContext

  beforeAll(async () => {
    Object.assign(ctx, await originalCreateTestContext())
    await ctx.app.start()
  })

  afterAll(async () => {
    await ctx.app.db.client.disconnect()
    await ctx.app.stop()
  })

  return ctx
}
