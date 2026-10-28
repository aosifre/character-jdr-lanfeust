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
  protected readonly selected = new Set(this.character?.advantages.map((advantage) => advantage.advantageId) ?? []);
  protected readonly availableAdvantages = this.settingsService.currentSettings;

  protected isSelected(id: string): boolean { return this.selected.has(id); }
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
    const meetsPrerequisite = !advantage.prerequisiteId || this.selected.has(advantage.prerequisiteId);
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
    if (this.selected.has(id)) this.selected.delete(id);
    else {
      const advantage = this.advantages().find((item) => item.id === id);
      if (advantage && this.isAvailable(advantage) && this.selected.size < this.availableAdvantages().availableAdvantages) this.selected.add(id);
    }
  }
  protected save(): void {
    const maximum = this.availableAdvantages().availableAdvantages;
    if (!this.characterId || this.selected.size !== maximum) return;
    const selected: CharacterAdvantage[] = [...this.selected].map((advantageId) => ({ advantageId }));
    this.characterService.setAdvantages(this.characterId, selected);
    this.router.navigate(['/characters', this.characterId, 'flaws']);
  }
}
