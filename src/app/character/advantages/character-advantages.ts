import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CharacterAdvantage } from '../character.model';
import { CharacterService } from '../character.service';
import { AdvantageService } from '../../advantage/advantage.service';
import { SettingsService } from '../../settings/settings.service';
import { Advantage } from '../../advantage/advantage.model';
import { AdvantageCategory } from '../../advantage/advantage.model';

@Component({ imports: [RouterLink], selector: 'app-character-advantages', templateUrl: './character-advantages.html', styleUrl: './character-advantages.scss' })
export class CharacterAdvantagesPage {
  private readonly characterService = inject(CharacterService);
  private readonly advantageService = inject(AdvantageService);
  private readonly settingsService = inject(SettingsService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  protected readonly characterId = this.route.snapshot.paramMap.get('id');
  protected readonly character = this.characterId ? this.characterService.findById(this.characterId) : undefined;
  protected readonly advantages = this.advantageService.advantageList;
  protected readonly categories: AdvantageCategory[] = ['combat', 'origin', 'magic', 'social', 'heroic'];
  protected readonly selectedCategory = signal<'all' | AdvantageCategory>('all');
  protected readonly selected = new Map<string, number>();
  protected readonly weaponChoices = new Map<string, string[]>();
  protected readonly availableAdvantages = this.settingsService.currentSettings;

  constructor() {
    for (const selectedAdvantage of this.character?.advantages ?? []) {
      const { advantageId } = selectedAdvantage;
      this.selected.set(advantageId, (this.selected.get(advantageId) ?? 0) + 1);
      const advantage = this.advantages().find((item) => item.id === advantageId);
      if (advantage?.weaponChoice) {
        const choices = this.weaponChoices.get(advantageId) ?? [];
        choices.push(selectedAdvantage.chosenWeapon ?? selectedAdvantage.specializationWeapon ?? '');
        this.weaponChoices.set(advantageId, choices);
      }
    }
  }

  protected isSelected(id: string): boolean { return this.selectedCount(id) > 0; }
  protected selectedCount(id: string): number { return this.selected.get(id) ?? 0; }
  protected get selectedTotal(): number { return [...this.selected.values()].reduce((total, count) => total + count, 0); }
  protected get canSave(): boolean { return this.selectedTotal === this.availableAdvantages().availableAdvantages && this.hasValidWeaponChoices(); }
  protected isRepeatable(advantage: Advantage): boolean { return advantage.repeatable === true; }
  protected weaponChoicesFor(advantageId: string): string[] { return this.weaponChoices.get(advantageId) ?? []; }
  protected setWeaponChoice(advantageId: string, index: number, event: Event): void {
    const choices = this.weaponChoices.get(advantageId) ?? [];
    choices[index] = (event.target as HTMLInputElement).value;
    this.weaponChoices.set(advantageId, choices);
  }
  private hasValidWeaponChoices(): boolean {
    return [...this.selected].every(([advantageId, count]) => {
      const advantage = this.advantages().find((item) => item.id === advantageId);
      if (!advantage?.weaponChoice) return true;
      const weapons = (this.weaponChoices.get(advantageId) ?? []).slice(0, count).map((weapon) => weapon.trim());
      return weapons.length === count
        && weapons.every(Boolean)
        && (advantageId !== 'specialisation' || new Set(weapons.map((weapon) => weapon.toLowerCase())).size === weapons.length);
    });
  }
  protected categoryLabel(category: AdvantageCategory): string {
    const labels: Record<AdvantageCategory, string> = { combat: 'Atouts de combat', origin: "Atouts d'origine", magic: 'Atouts magiques', social: 'Atouts sociaux', heroic: 'Atouts héroïques' };
    return labels[category];
  }
  protected filteredAdvantages(): Advantage[] {
    const category = this.selectedCategory();
    return category === 'all' ? this.advantages() : this.advantages().filter((advantage) => advantage.category === category);
  }
  protected onCategoryChange(event: Event): void {
    this.selectedCategory.set((event.target as HTMLSelectElement).value as 'all' | AdvantageCategory);
  }
  protected isAvailable(advantage: Advantage): boolean {
    const attributes = this.character?.attributes;
    const meetsCondition = !advantage.conditionAttribute || (attributes?.[advantage.conditionAttribute] ?? 0) >= (advantage.conditionMinimum ?? 0);
    const meetsPrerequisite = !advantage.prerequisiteId || this.isSelected(advantage.prerequisiteId);
    const meetsLevel = advantage.minimumLevel == null || (this.character?.level ?? 0) >= advantage.minimumLevel;
    return meetsCondition && meetsPrerequisite && meetsLevel;
  }
  protected conditionText(advantage: Advantage): string {
    const conditions = [
      advantage.conditionAttribute ? `${advantage.conditionAttribute} ${advantage.conditionMinimum}` : null,
      advantage.prerequisiteId ? 'un autre atout' : null,
      advantage.minimumLevel != null ? `niveau ${advantage.minimumLevel} minimum` : null,
    ].filter((condition) => condition !== null);
    return conditions.length ? `Condition : ${conditions.join(' · ')}` : 'Aucune condition';
  }
  protected toggle(id: string): void {
    const count = this.selectedCount(id);
    const maximum = this.availableAdvantages().availableAdvantages;
    const advantage = this.advantages().find((item) => item.id === id);
    if (count > 0 && advantage && !this.isRepeatable(advantage)) this.selected.delete(id);
    else {
      if (advantage && this.isAvailable(advantage) && this.selectedTotal < maximum) {
        this.selected.set(id, count + 1);
        if (advantage.weaponChoice) {
          const choices = this.weaponChoices.get(id) ?? [];
          choices.push('');
          this.weaponChoices.set(id, choices);
        }
      }
    }
  }

  protected removeOne(id: string): void {
    const count = this.selectedCount(id);
    if (count <= 1) this.selected.delete(id);
    else this.selected.set(id, count - 1);
    const advantage = this.advantages().find((item) => item.id === id);
    if (advantage?.weaponChoice) this.weaponChoices.get(id)?.pop();
  }

  protected save(): void {
    const maximum = this.availableAdvantages().availableAdvantages;
    if (!this.characterId || !this.canSave || this.selectedTotal !== maximum) return;
    const selected: CharacterAdvantage[] = [...this.selected].flatMap(([advantageId, count]) =>
      this.advantages().find((advantage) => advantage.id === advantageId)?.weaponChoice
        ? this.weaponChoicesFor(advantageId).slice(0, count).map((weapon) => ({ advantageId, chosenWeapon: weapon.trim() }))
        : Array.from({ length: count }, () => ({ advantageId })),
    );
    this.characterService.setAdvantages(this.characterId, selected);
    this.router.navigate(['/characters', this.characterId, 'flaws']);
  }
}
