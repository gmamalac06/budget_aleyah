import { Capacitor } from '@capacitor/core';
import { Preferences as CapacitorPreferences } from '@capacitor/preferences';
import { CapacitorSQLite, SQLiteConnection, type SQLiteDBConnection } from '@capacitor-community/sqlite';
import type { AppData } from '../domain/models';
import { createInitialData, normalizeAppData } from '../domain/seed';

const STORAGE_KEY = 'bulsa.app-data.v1';

export interface AppStorage {
  load(): Promise<AppData>;
  save(data: AppData): Promise<void>;
  clear(): Promise<void>;
}

class PreferencesStorage implements AppStorage {
  async load(): Promise<AppData> {
    const { value } = await CapacitorPreferences.get({ key: STORAGE_KEY });
    if (!value) return createInitialData();
    try {
      return normalizeAppData(JSON.parse(value));
    } catch {
      return createInitialData();
    }
  }

  async save(data: AppData) {
    await CapacitorPreferences.set({ key: STORAGE_KEY, value: JSON.stringify(data) });
  }

  async clear() {
    await CapacitorPreferences.remove({ key: STORAGE_KEY });
  }
}

class NativeSqliteStorage implements AppStorage {
  private readonly sqlite = new SQLiteConnection(CapacitorSQLite);
  private database?: SQLiteDBConnection;

  private async db() {
    if (this.database) return this.database;
    const existing = await this.sqlite.isConnection('bulsa', false);
    this.database = existing.result
      ? await this.sqlite.retrieveConnection('bulsa', false)
      : await this.sqlite.createConnection('bulsa', false, 'no-encryption', 1, false);
    await this.database.open();
    await this.database.execute(`
      CREATE TABLE IF NOT EXISTS app_state (
        id INTEGER PRIMARY KEY NOT NULL,
        schema_version INTEGER NOT NULL,
        payload TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );
    `);
    return this.database;
  }

  async load(): Promise<AppData> {
    const database = await this.db();
    const result = await database.query('SELECT payload FROM app_state WHERE id = 1;');
    const payload = result.values?.[0]?.payload;
    if (!payload) return createInitialData();
    try {
      return normalizeAppData(JSON.parse(String(payload)));
    } catch {
      return createInitialData();
    }
  }

  async save(data: AppData) {
    const database = await this.db();
    await database.run(
      `INSERT OR REPLACE INTO app_state (id, schema_version, payload, updated_at) VALUES (1, ?, ?, ?);`,
      [data.version, JSON.stringify(data), new Date().toISOString()],
    );
  }

  async clear() {
    const database = await this.db();
    await database.run('DELETE FROM app_state WHERE id = 1;');
  }
}

// Native builds use SQLite. The browser preview uses Capacitor Preferences so
// the same feature code remains fully functional during local development.
export const appStorage: AppStorage = Capacitor.isNativePlatform() ? new NativeSqliteStorage() : new PreferencesStorage();
export const storagePlatform = Capacitor.getPlatform();
