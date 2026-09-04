import { isPlatformBrowser } from '@angular/common';
import { Inject, Injectable, PLATFORM_ID, signal } from '@angular/core';

export interface GlobalSettings {
  availableAdvantages: number;
}

@Injectable({ providedIn: 'root' })
export class SettingsService {
  private readonly storageKey = 'jdr-lanfeust-settings-v1';
  private readonly isBrowser: boolean;
  private readonly settings = signal<GlobalSettings>({ availableAdvantages: 3 });
  readonly currentSettings = this.settings.asReadonly();

  constructor(@Inject(PLATFORM_ID) platformId: object) {
    this.isBrowser = isPlatformBrowser(platformId);
    if (this.isBrowser) {
      const saved = localStorage.getItem(this.storageKey);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (this.isSettings(parsed)) this.settings.set(parsed);
        } catch { /* Ignore an invalid settings file. */ }
      }
    }
  }

  update(settings: GlobalSettings): void {
    this.settings.set(settings);
    this.save();
  }

  importSettings(data: unknown): boolean {
    if (typeof data !== 'object' || data === null) return false;
    const imported = data as { settings?: unknown };
    const settings = imported.settings ?? data;
    if (!this.isSettings(settings)) return false;
    this.update(settings);
    return true;
  }

  private isSettings(value: unknown): value is GlobalSettings {
    if (typeof value !== 'object' || value === null) return false;
    const settings = value as Record<string, unknown>;
    return typeof settings['availableAdvantages'] === 'number'
      && Number.isInteger(settings['availableAdvantages'])
      && settings['availableAdvantages'] >= 0;
  }

  private save(): void {
    if (this.isBrowser) localStorage.setItem(this.storageKey, JSON.stringify(this.settings()));
  }

}