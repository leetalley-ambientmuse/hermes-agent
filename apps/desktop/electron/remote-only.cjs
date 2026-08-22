'use strict'

const REMOTE_ONLY_ERROR =
  'This Hermes Desktop build is remote-only. Set HERMES_DESKTOP_REMOTE_URL and HERMES_DESKTOP_REMOTE_TOKEN, or save a remote gateway in connection settings.'

function isRemoteOnlyValue(value) {
  if (value === true) return true
  if (value === false || value === null || value === undefined) return false

  return ['1', 'true', 'yes'].includes(String(value).trim().toLowerCase())
}

function resolveRemoteOnlyMode({ envValue, stampRemoteOnly } = {}) {
  return isRemoteOnlyValue(envValue) || stampRemoteOnly === true
}

function remoteOnlyConfigurationError() {
  return new Error(REMOTE_ONLY_ERROR)
}

function assertRemoteOnlyMode({ remoteOnly, requestedMode } = {}) {
  if (remoteOnly && requestedMode === 'local') {
    throw new Error('This Hermes Desktop build is remote-only; configure a remote gateway instead.')
  }
}

function normalizeConnectionMode({ remoteOnly, requestedMode } = {}) {
  return remoteOnly || requestedMode === 'remote' ? 'remote' : 'local'
}

function requiresRemoteTarget({ remoteOnly, configMode, remoteUrl } = {}) {
  return Boolean(remoteOnly && configMode === 'remote' && !String(remoteUrl || '').trim())
}

module.exports = {
  REMOTE_ONLY_ERROR,
  assertRemoteOnlyMode,
  isRemoteOnlyValue,
  normalizeConnectionMode,
  remoteOnlyConfigurationError,
  requiresRemoteTarget,
  resolveRemoteOnlyMode
}
