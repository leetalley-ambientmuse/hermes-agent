'use strict'

const test = require('node:test')
const assert = require('node:assert/strict')

const {
  REMOTE_ONLY_ERROR,
  assertRemoteOnlyMode,
  isRemoteOnlyValue,
  normalizeConnectionMode,
  remoteOnlyConfigurationError,
  requiresRemoteTarget,
  resolveRemoteOnlyMode
} = require('./remote-only.cjs')

test('isRemoteOnlyValue accepts the supported truthy environment values', () => {
  for (const value of ['1', 'true', 'TRUE', ' yes ']) {
    assert.equal(isRemoteOnlyValue(value), true, value)
  }
})

test('isRemoteOnlyValue rejects falsey and unrelated values', () => {
  for (const value of [undefined, null, false, '', '0', 'no', 'remote']) {
    assert.equal(isRemoteOnlyValue(value), false, String(value))
  }
})

test('resolveRemoteOnlyMode enables mode from either environment or build stamp', () => {
  assert.equal(resolveRemoteOnlyMode({ envValue: '1', stampRemoteOnly: false }), true)
  assert.equal(resolveRemoteOnlyMode({ envValue: undefined, stampRemoteOnly: true }), true)
  assert.equal(resolveRemoteOnlyMode({ envValue: '0', stampRemoteOnly: false }), false)
})

test('normalizeConnectionMode forces remote mode without a requested mode', () => {
  assert.equal(normalizeConnectionMode({ remoteOnly: true }), 'remote')
  assert.equal(normalizeConnectionMode({ remoteOnly: true, requestedMode: 'local' }), 'remote')
  assert.equal(normalizeConnectionMode({ remoteOnly: false, requestedMode: 'local' }), 'local')
  assert.equal(normalizeConnectionMode({ remoteOnly: false, requestedMode: 'remote' }), 'remote')
})

test('assertRemoteOnlyMode rejects explicit local configuration', () => {
  assert.throws(
    () => assertRemoteOnlyMode({ remoteOnly: true, requestedMode: 'local' }),
    /remote-only.*configure a remote gateway/i
  )
})

test('assertRemoteOnlyMode allows remote and implicit configuration', () => {
  assert.doesNotThrow(() => assertRemoteOnlyMode({ remoteOnly: true, requestedMode: 'remote' }))
  assert.doesNotThrow(() => assertRemoteOnlyMode({ remoteOnly: true }))
  assert.doesNotThrow(() => assertRemoteOnlyMode({ remoteOnly: false, requestedMode: 'local' }))
})

test('requiresRemoteTarget catches an unconfigured remote-only install', () => {
  assert.equal(requiresRemoteTarget({ remoteOnly: true, configMode: 'remote', remoteUrl: '' }), true)
  assert.equal(requiresRemoteTarget({ remoteOnly: true, configMode: 'remote', remoteUrl: '   ' }), true)
  assert.equal(
    requiresRemoteTarget({ remoteOnly: true, configMode: 'remote', remoteUrl: 'https://hermes.test' }),
    false
  )
})

test('requiresRemoteTarget does not affect normal local mode', () => {
  assert.equal(requiresRemoteTarget({ remoteOnly: false, configMode: 'local', remoteUrl: '' }), false)
  assert.equal(requiresRemoteTarget({ remoteOnly: false, configMode: 'remote', remoteUrl: '' }), false)
})

test('remoteOnlyConfigurationError is actionable and stable', () => {
  const error = remoteOnlyConfigurationError()
  assert.equal(error instanceof Error, true)
  assert.equal(error.message, REMOTE_ONLY_ERROR)
  assert.match(error.message, /HERMES_DESKTOP_REMOTE_URL/)
  assert.match(error.message, /connection settings/)
})
