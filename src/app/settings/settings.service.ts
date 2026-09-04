import { isPlatformBrowser } from '@angular/common';
import { Inject, Injectable, PLATFORM_ID, signal } from '@angular/core';

export interface GlobalSettings {
  availableAdvantages: number;
}

export interface Flaw {
  id: string;
  title: string;
  description: string;
}

@Injectable({ providedIn: 'root' })
export class SettingsService {
  private readonly storageKey = 'jdr-lanfeust-settings-v1';
  private readonly flawsStorageKey = 'jdr-lanfeust-flaws-v1';
  private readonly isBrowser: boolean;
  private readonly settings = signal<GlobalSettings>({ availableAdvantages: 3 });
  private readonly flaws = signal<Flaw[]>([]);
  readonly currentSettings = this.settings.asReadonly();
  readonly flawList = this.flaws.asReadonly();

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
      const savedFlaws = localStorage.getItem(this.flawsStorageKey);
      if (savedFlaws) {
        try {
          const parsedFlaws = JSON.parse(savedFlaws);
          if (Array.isArray(parsedFlaws) && parsedFlaws.every((flaw) => this.isFlaw(flaw))) this.flaws.set(parsedFlaws);
        } catch { /* Ignore an invalid flaw catalogue. */ }
      }
    }
  }

  update(settings: GlobalSettings): void {
    this.settings.set(settings);
    this.save();
  }

  importSettings(data: unknown): boolean {
    if (typeof data !== 'object' || data === null) return false;
    const imported = data as { settings?: unknown; flaws?: unknown };
    const settings = imported.settings ?? data;
    if (!this.isSettings(settings)) return false;
    if (imported.flaws !== undefined && (!Array.isArray(imported.flaws) || !imported.flaws.every((flaw) => this.isFlaw(flaw)))) return false;
    this.update(settings);
    if (Array.isArray(imported.flaws)) { this.flaws.set(imported.flaws); this.saveFlaws(); }
    return true;
  }

  addFlaw(title: string, description: string): void {
    this.flaws.update((flaws) => [...flaws, { id: crypto.randomUUID(), title, description }]);
    this.saveFlaws();
  }

  removeFlaw(id: string): void {
    this.flaws.update((flaws) => flaws.filter((flaw) => flaw.id !== id));
    this.saveFlaws();
  }

  importFlaws(data: unknown): boolean {
    if (!Array.isArray(data) || !data.every((flaw) => this.isFlaw(flaw))) return false;
    this.flaws.set(data);
    this.saveFlaws();
    return true;
  }

  private isFlaw(value: unknown): value is Flaw {
    if (typeof value !== 'object' || value === null) return false;
    const flaw = value as Record<string, unknown>;
    return typeof flaw['id'] === 'string' && typeof flaw['title'] === 'string' && typeof flaw['description'] === 'string';
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

  private saveFlaws(): void {
    if (this.isBrowser) localStorage.setItem(this.flawsStorageKey, JSON.stringify(this.flaws()));
  }
}