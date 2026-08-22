'use strict'

const STAMP_SCHEMA_VERSION = 1

function createInstallStampPayload(stamp, { builtAt = new Date().toISOString(), remoteOnly = false } = {}) {
  if (!stamp || typeof stamp.commit !== 'string' || !stamp.commit) {
    throw new Error('An install stamp requires a git commit.')
  }

  return {
    schemaVersion: STAMP_SCHEMA_VERSION,
    commit: stamp.commit,
    branch: stamp.branch || null,
    builtAt,
    dirty: Boolean(stamp.dirty),
    source: stamp.source || null,
    remoteOnly: Boolean(remoteOnly)
  }
}

module.exports = { STAMP_SCHEMA_VERSION, createInstallStampPayload }
