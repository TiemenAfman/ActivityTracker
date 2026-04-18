import type { Activity, Category, User } from './types'

const BASE = '/api'

async function json<T>(res: Response): Promise<T> {
  if (!res.ok) throw new Error(`API ${res.status}`)
  return res.json()
}

// Auth
export function checkSetupNeeded(): Promise<{ needed: boolean }> {
  return fetch(`${BASE}/setup-needed`).then(r => json<{ needed: boolean }>(r))
}

export function setup(username: string, password: string): Promise<User> {
  return fetch(`${BASE}/setup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ username, password }),
  }).then(r => json<User>(r))
}

export function login(username: string, password: string): Promise<User> {
  return fetch(`${BASE}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ username, password }),
  }).then(r => json<User>(r))
}

export function changeUsername(newUsername: string, password: string): Promise<{ username: string }> {
  return fetch(`${BASE}/change-username`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ newUsername, password }),
  }).then(async r => {
    if (!r.ok) { const d = await r.json(); throw new Error(d.error ?? 'Fout') }
    return r.json()
  })
}

export function changePassword(currentPassword: string, newPassword: string): Promise<void> {
  return fetch(`${BASE}/change-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ currentPassword, newPassword }),
  }).then(async r => {
    if (!r.ok) {
      const data = await r.json()
      throw new Error(data.error ?? 'Fout')
    }
  })
}

export function logout(): Promise<void> {
  return fetch(`${BASE}/logout`, { method: 'POST', credentials: 'include' }).then(r => json<void>(r))
}

export function getMe(): Promise<User> {
  return fetch(`${BASE}/me`, { credentials: 'include' }).then(r => json<User>(r))
}

// Settings
export interface BackupSettings {
  enabled: boolean
  location: string
  interval: 'daily' | 'weekly' | 'monthly'
  lastBackup: string | null
}
export interface Settings { backup: BackupSettings; historyLimit: number }

export function getSettings(): Promise<Settings> {
  return fetch(`${BASE}/settings`, { credentials: 'include' }).then(r => json<Settings>(r))
}

export function saveSettings(data: Partial<Settings>): Promise<Settings> {
  return fetch(`${BASE}/settings`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(data),
  }).then(r => json<Settings>(r))
}

export function backupNow(): Promise<{ ok: boolean; path: string; timestamp: string }> {
  return fetch(`${BASE}/settings/backup-now`, { method: 'POST', credentials: 'include' })
    .then(async r => {
      if (!r.ok) { const d = await r.json(); throw new Error(d.error) }
      return r.json()
    })
}

// Activities
export function getActivities(): Promise<Activity[]> {
  return fetch(`${BASE}/activities`, { credentials: 'include' }).then(r => json<Activity[]>(r))
}

export function createActivity(data: Omit<Activity, 'id' | 'userId'>): Promise<{ id: string }> {
  return fetch(`${BASE}/activities`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(data),
  }).then(r => json<{ id: string }>(r))
}

export function updateActivity(id: string, data: Partial<Activity>): Promise<void> {
  return fetch(`${BASE}/activities/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(data),
  }).then(r => json<void>(r))
}

export function deleteActivity(id: string): Promise<void> {
  return fetch(`${BASE}/activities/${id}`, { method: 'DELETE', credentials: 'include' }).then(r => json<void>(r))
}

// Categories
export function getCategories(): Promise<Category[]> {
  return fetch(`${BASE}/categories`, { credentials: 'include' }).then(r => json<Category[]>(r))
}

export function createCategory(data: Omit<Category, 'id' | 'userId'>): Promise<{ id: string }> {
  return fetch(`${BASE}/categories`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(data),
  }).then(r => json<{ id: string }>(r))
}

export function updateCategory(id: string, data: Partial<Category>): Promise<void> {
  return fetch(`${BASE}/categories/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(data),
  }).then(r => json<void>(r))
}

export function deleteCategory(id: string): Promise<void> {
  return fetch(`${BASE}/categories/${id}`, { method: 'DELETE', credentials: 'include' }).then(r => json<void>(r))
}
