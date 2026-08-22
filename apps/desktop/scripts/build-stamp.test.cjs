'use strict'

const test = require('node:test')
const assert = require('node:assert/strict')

const { STAMP_SCHEMA_VERSION, createInstallStampPayload } = require('./build-stamp.cjs')

test('createInstallStampPayload writes a normal client stamp', () => {
  const stamp = createInstallStampPayload(
    { commit: 'abc123', branch: 'main', dirty: false, source: 'ci' },
    { builtAt: '2026-08-22T00:00:00.000Z' }
  )

  assert.deepEqual(stamp, {
    schemaVersion: STAMP_SCHEMA_VERSION,
    commit: 'abc123',
    branch: 'main',
    builtAt: '2026-08-22T00:00:00.000Z',
    dirty: false,
    source: 'ci',
    remoteOnly: false
  })
})

test('createInstallStampPayload persists remote-only mode in the build artifact', () => {
  const stamp = createInstallStampPayload(
    { commit: 'def456', branch: 'release', dirty: true, source: 'local' },
    { builtAt: '2026-08-22T00:00:00.000Z', remoteOnly: true }
  )

  assert.equal(stamp.remoteOnly, true)
  assert.equal(stamp.dirty, true)
})

test('createInstallStampPayload rejects an unstamped build', () => {
  assert.throws(() => createInstallStampPayload(null), /requires a git commit/i)
  assert.throws(() => createInstallStampPayload({ commit: '' }), /requires a git commit/i)
})
