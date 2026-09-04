import { isPlatformBrowser } from '@angular/common';
import { Inject, Injectable, PLATFORM_ID, signal } from '@angular/core';
import { Flaw } from './flaw.model';

const defaultFlaws: Flaw[] = [
  { id: 'agit-avant-reflechit-trop-tard', title: 'Agit avant, réfléchit trop tard', description: '' },
  { id: 'boit-comme-un-trou', title: 'Boit comme un trou', description: '' },
  { id: 'esprit-de-contradiction', title: 'Esprit de contradiction', description: '' },
  { id: 'estomac-sur-pattes', title: 'Estomac sur pattes', description: '' },
  { id: 'fou-a-enchainer', title: 'Fou à enchaîner', description: '' },
  { id: 'grippe-sou', title: 'Grippe-sou', description: '' },
  { id: 'grosse-larve', title: 'Grosse larve', description: '' },
  { id: 'honnete-maladive', title: 'Honnêteté maladive', description: '' },
  { id: 'inconscient-du-danger', title: 'Inconscient du danger', description: '' },
  { id: 'intolerant-indecrottable', title: 'Intolérant indécrottable', description: '' },
  { id: 'kleptomane-compulsif', title: 'Kleptomane compulsif', description: '' },
  { id: 'long-a-la-detente', title: 'Long à la détente', description: '' },
  { id: 'loyaute-indefectible', title: 'Loyauté indéfectible', description: '' },
  { id: 'le-monde-est-ma-scene', title: 'Le monde est ma scène', description: '' },
  { id: 'mortelle-curiosite', title: 'Mortelle curiosité', description: '' },
  { id: 'mythomane', title: 'Mythomane', description: '' },
  { id: 'naitive-desarmante', title: 'Naïveté désarmante', description: '' },
  { id: 'obsede-du-sexe', title: 'Obsédé du sexe', description: '' },
  { id: 'pas-de-tete', title: 'Pas de tête', description: '' },
  { id: 'pec-sans-manieres', title: 'Pec sans manières', description: '' },
  { id: 'petochard', title: 'Pétochard', description: '' },
  { id: 'sarcasmes-intempestifs', title: 'Sarcasmes intempestifs', description: '' },
  { id: 'tete-de-mule', title: 'Tête de mule', description: '' },
  { id: 'timide-comme-pas-permis', title: 'Timide comme pas permis', description: '' },
  { id: 'trop-sur-de-lui', title: 'Trop sûr de lui', description: '' },
];

@Injectable({ providedIn: 'root' })
export class FlawService {
  private readonly storageKey = 'jdr-lanfeust-flaws-v1';
  private readonly isBrowser: boolean;
  private readonly flaws = signal<Flaw[]>(defaultFlaws);
  readonly flawList = this.flaws.asReadonly();

  constructor(@Inject(PLATFORM_ID) platformId: object) {
    this.isBrowser = isPlatformBrowser(platformId);
    if (this.isBrowser) {
      const savedFlaws = localStorage.getItem(this.storageKey);
      if (savedFlaws) {
        try {
          const parsedFlaws = JSON.parse(savedFlaws);
          if (Array.isArray(parsedFlaws) && parsedFlaws.every((flaw) => this.isFlaw(flaw))) {
            this.flaws.set(this.mergeWithDefaults(parsedFlaws));
          }
        } catch { /* Ignore an invalid flaw catalogue. */ }
      }
    }
  }

  add(title: string, description: string): void {
    this.flaws.update((flaws) => [...flaws, { id: crypto.randomUUID(), title, description }]);
    this.save();
  }

  remove(id: string): void {
    this.flaws.update((flaws) => flaws.filter((flaw) => flaw.id !== id));
    this.save();
  }

  import(data: unknown): boolean {
    if (!Array.isArray(data) || !data.every((flaw) => this.isFlaw(flaw))) return false;
    this.flaws.set(this.mergeWithDefaults(data));
    this.save();
    return true;
  }

  private mergeWithDefaults(customFlaws: Flaw[]): Flaw[] {
    const flawsById = new Map(defaultFlaws.map((flaw) => [flaw.id, flaw]));
    for (const flaw of customFlaws) flawsById.set(flaw.id, flaw);
    return [...flawsById.values()];
  }

  private isFlaw(value: unknown): value is Flaw {
    if (typeof value !== 'object' || value === null) return false;
    const flaw = value as Record<string, unknown>;
    return typeof flaw['id'] === 'string' && typeof flaw['title'] === 'string' && typeof flaw['description'] === 'string';
  }

  private save(): void {
    if (this.isBrowser) localStorage.setItem(this.storageKey, JSON.stringify(this.flaws()));
  }
}
