import { isPlatformBrowser } from '@angular/common';
import { Inject, Injectable, PLATFORM_ID, signal } from '@angular/core';

export interface GlobalSettings {
  availableAdvantages: number;
  fontStyle: FontStyle;
  theme: ColorTheme;
}

export type FontStyle = 'lanfeust' | 'classic' | 'storybook' | 'manuscript';
export type ColorTheme = 'light' | 'dark';

const defaultSettings: GlobalSettings = { availableAdvantages: 3, fontStyle: 'lanfeust', theme: 'light' };

@Injectable({ providedIn: 'root' })
export class SettingsService {
  private readonly storageKey = 'jdr-lanfeust-settings-v1';
  private readonly isBrowser: boolean;
  private readonly settings = signal<GlobalSettings>(defaultSettings);
  readonly currentSettings = this.settings.asReadonly();

  constructor(@Inject(PLATFORM_ID) platformId: object) {
    this.isBrowser = isPlatformBrowser(platformId);
    if (this.isBrowser) {
      const saved = localStorage.getItem(this.storageKey);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          const restored = this.normalizeSettings(parsed);
          if (restored) this.settings.set(restored);
        } catch { /* Ignore an invalid settings file. */ }
      }
      this.applyAppearance();
    }
  }

  update(settings: GlobalSettings): void {
    this.settings.set(settings);
    this.applyAppearance();
    this.save();
  }

  importSettings(data: unknown): boolean {
    if (typeof data !== 'object' || data === null) return false;
    const imported = data as { settings?: unknown };
    const settings = imported.settings ?? data;
    const normalized = this.normalizeSettings(settings);
    if (!normalized) return false;
    this.update(normalized);
    return true;
  }

  resetToDefaults(): void {
    this.settings.set(defaultSettings);
    this.applyAppearance();
    if (this.isBrowser) localStorage.removeItem(this.storageKey);
  }

  private normalizeSettings(value: unknown): GlobalSettings | null {
    if (typeof value !== 'object' || value === null) return null;
    const settings = value as Record<string, unknown>;
    if (typeof settings['availableAdvantages'] !== 'number'
      || !Number.isInteger(settings['availableAdvantages'])
      || settings['availableAdvantages'] < 0) return null;
    const fontStyle = settings['fontStyle'];
    const theme = settings['theme'];
    return {
      availableAdvantages: settings['availableAdvantages'] as number,
      fontStyle: this.isFontStyle(fontStyle) ? fontStyle : defaultSettings.fontStyle,
      theme: this.isColorTheme(theme) ? theme : defaultSettings.theme,
    };
  }

  private isFontStyle(value: unknown): value is FontStyle {
    return value === 'lanfeust' || value === 'classic' || value === 'storybook' || value === 'manuscript';
  }

  private isColorTheme(value: unknown): value is ColorTheme {
    return value === 'light' || value === 'dark';
  }

  private applyAppearance(): void {
    if (!this.isBrowser) return;
    document.documentElement.dataset['fontStyle'] = this.settings().fontStyle;
    document.documentElement.dataset['theme'] = this.settings().theme;
  }

  private save(): void {
    if (this.isBrowser) localStorage.setItem(this.storageKey, JSON.stringify(this.settings()));
  }

}