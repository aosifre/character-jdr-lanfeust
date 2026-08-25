import { Component, inject } from '@angular/core';
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
  protected readonly selected = new Set(this.character?.advantages.map((advantage) => advantage.advantageId) ?? []);
  protected readonly availableAdvantages = this.settingsService.currentSettings;

  protected isSelected(id: string): boolean { return this.selected.has(id); }
  protected categoryLabel(category: AdvantageCategory): string {
    const labels: Record<AdvantageCategory, string> = { combat: 'Atouts de combat', origin: "Atouts d'origine", magic: 'Atouts magiques', social: 'Atouts sociaux', heroic: 'Atouts héroïques' };
    return labels[category];
  }
  protected isAvailable(advantage: Advantage): boolean {
    const attributes = this.character?.attributes;
    const meetsCondition = !advantage.conditionAttribute || (attributes?.[advantage.conditionAttribute] ?? 0) >= (advantage.conditionMinimum ?? 0);
    const meetsPrerequisite = !advantage.prerequisiteId || this.selected.has(advantage.prerequisiteId);
    return meetsCondition && meetsPrerequisite;
  }
  protected conditionText(advantage: Advantage): string {
    if (advantage.conditionAttribute) return `Condition : ${advantage.conditionAttribute} ${advantage.conditionMinimum}`;
    if (advantage.prerequisiteId) return 'Nécessite un autre atout';
    return 'Aucune condition';
  }
  protected toggle(id: string): void {
    if (this.selected.has(id)) this.selected.delete(id);
    else if (this.selected.size < this.availableAdvantages().availableAdvantages) this.selected.add(id);
  }
  protected save(): void {
    const maximum = this.availableAdvantages().availableAdvantages;
    if (!this.characterId || this.selected.size !== maximum) return;
    const selected: CharacterAdvantage[] = [...this.selected].map((advantageId) => ({ advantageId }));
    this.characterService.setAdvantages(this.characterId, selected);
    this.router.navigate(['/characters', this.characterId, 'flaws']);
  }
}
