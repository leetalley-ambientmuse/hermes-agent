import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { $desktopBoot } from '@/store/boot'
import { $desktopOnboarding } from '@/store/onboarding'

import { BootFailureOverlay } from './boot-failure-overlay'

const desktopBridge = {
  getConnectionConfig: vi.fn().mockResolvedValue({
    envOverride: false,
    mode: 'remote',
    profile: null,
    remoteAuthMode: 'token',
    remoteOauthConnected: false,
    remoteTokenPreview: null,
    remoteTokenSet: false,
    remoteUrl: ''
  }),
  getRecentLogs: vi.fn().mockResolvedValue({ lines: [] }),
  getVersion: vi.fn().mockResolvedValue({ remoteOnly: true })
}

const originalBridge = (window as unknown as { hermesDesktop?: unknown }).hermesDesktop

beforeEach(() => {
  Object.defineProperty(window, 'hermesDesktop', {
    configurable: true,
    value: { ...desktopBridge, isRemoteOnly: true }
  })
  $desktopBoot.set({
    error: 'Remote gateway is not configured',
    fakeMode: false,
    message: 'Remote gateway is not configured',
    phase: 'backend.resolve',
    progress: 8,
    running: false,
    timestamp: Date.now(),
    visible: true
  })
  $desktopOnboarding.set({
    configured: true,
    flow: { status: 'idle' },
    mode: 'oauth',
    providers: null,
    reason: null,
    requested: false,
    firstRunSkipped: false,
    manual: false
  })
})

afterEach(() => {
  cleanup()
  Object.defineProperty(window, 'hermesDesktop', {
    configurable: true,
    value: originalBridge
  })
  vi.clearAllMocks()
})

describe('BootFailureOverlay in remote-only mode', () => {
  it('offers Gateway settings as the only recovery path', () => {
    const openSettings = vi.fn()
    render(<BootFailureOverlay onOpenSettings={openSettings} />)

    const settingsButton = screen.getByRole('button', { name: /sign in to remote gateway/i })
    expect(screen.queryByRole('button', { name: /use local gateway/i })).toBeNull()
    expect(screen.queryByRole('button', { name: /repair install/i })).toBeNull()

    fireEvent.click(settingsButton)

    expect(openSettings).toHaveBeenCalledOnce()
    expect(screen.queryByRole('button', { name: /sign in to remote gateway/i })).toBeNull()
  })

  it('does not expose local recovery even after the version probe resolves', async () => {
    desktopBridge.getVersion.mockResolvedValueOnce({ remoteOnly: true })
    render(<BootFailureOverlay />)

    await screen.findByRole('button', { name: /sign in to remote gateway/i })
    expect(screen.queryByRole('button', { name: /use local gateway/i })).toBeNull()
  })
})
