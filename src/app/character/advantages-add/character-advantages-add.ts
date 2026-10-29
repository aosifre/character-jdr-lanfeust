import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CharacterAdvantage } from '../character.model';
import { CharacterService } from '../character.service';
import { AdvantageService } from '../../advantage/advantage.service';
import { SettingsService } from '../../settings/settings.service';
import { Advantage, DARSHAN_DEITIES, DeityChoiceDraft } from '../../advantage/advantage.model';
import { AdvantageCategory } from '../../advantage/advantage.model';

@Component({
  imports: [RouterLink],
  selector: 'app-character-advantage-add',
  templateUrl: './character-advantages-add.html',
  styleUrl: './character-advantages-add.scss'
})
export class CharacterAdvantagesAddPage {
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
  protected readonly deityChoices = new Map<string, DeityChoiceDraft>();
  protected readonly deities = DARSHAN_DEITIES;
  public advantageMaximum = 0;

 // ajout d'un avantage supplémentaire pour le personnage en + du nombre d'avantages actuel du personnage
 constructor() {
      if (!this.characterId || !this.character) return;

      this.advantageMaximum = this.character.advantages.length + 1;
     for (const selectedAdvantage of this.character.advantages) {
       const { advantageId } = selectedAdvantage;
       this.selected.set(advantageId, (this.selected.get(advantageId) ?? 0) + 1);
       const advantage = this.advantages().find((item) => item.id === advantageId);
       if (advantage?.weaponChoice) {
         const choices = this.weaponChoices.get(advantageId) ?? [];
         choices.push(selectedAdvantage.chosenWeapon ?? selectedAdvantage.specializationWeapon ?? '');
         this.weaponChoices.set(advantageId, choices);
       }
       if (advantage?.deityChoice && selectedAdvantage.chosenDeity) {
         const knownDeity = this.deities.find((deity) => deity.name === selectedAdvantage.chosenDeity?.name);
         this.deityChoices.set(advantageId, {
           selection: knownDeity?.name ?? 'Autre',
           customName: knownDeity ? '' : selectedAdvantage.chosenDeity.name,
           circumstances: selectedAdvantage.chosenDeity.circumstances,
           helpingHand: selectedAdvantage.chosenDeity.helpingHand,
         });
       }
     }
 }

 protected isSelected(id: string): boolean { return this.selectedCount(id) > 0; }
 protected selectedCount(id: string): number { return this.selected.get(id) ?? 0; }
 protected get selectedTotal(): number { return [...this.selected.values()].reduce((total, count) => total + count, 0); }
 protected get canSave(): boolean { return this.selectedTotal === this.advantageMaximum && this.hasValidChoices(); }
 protected isRepeatable(advantage: Advantage): boolean { return advantage.repeatable === true; }
 protected weaponChoicesFor(advantageId: string): string[] { return this.weaponChoices.get(advantageId) ?? []; }
 protected setWeaponChoice(advantageId: string, index: number, event: Event): void {
   const choices = this.weaponChoices.get(advantageId) ?? [];
   choices[index] = (event.target as HTMLInputElement).value;
   this.weaponChoices.set(advantageId, choices);
 }
 protected deityChoiceFor(advantageId: string): DeityChoiceDraft {
   return this.deityChoices.get(advantageId) ?? { selection: '', customName: '', circumstances: '', helpingHand: '' };
 }
 protected setDeityChoice(advantageId: string, field: keyof DeityChoiceDraft, event: Event): void {
   const value = (event.target as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement).value;
   const choice = field === 'selection'
     ? {
       ...this.deityChoiceFor(advantageId),
       selection: value,
       customName: value === 'Autre' ? this.deityChoiceFor(advantageId).customName : '',
       circumstances: this.deities.find((deity) => deity.name === value)?.circumstances ?? '',
       helpingHand: this.deities.find((deity) => deity.name === value)?.helpingHand ?? '',
     }
     : { ...this.deityChoiceFor(advantageId), [field]: value };
   this.deityChoices.set(advantageId, choice);
 }
 private hasValidChoices(): boolean {
   return [...this.selected].every(([advantageId, count]) => {
     const advantage = this.advantages().find((item) => item.id === advantageId);
     if (advantage?.weaponChoice) {
       const weapons = (this.weaponChoices.get(advantageId) ?? []).slice(0, count).map((weapon) => weapon.trim());
       if (weapons.length !== count || !weapons.every(Boolean)
         || (advantageId === 'specialisation' && new Set(weapons.map((weapon) => weapon.toLowerCase())).size !== weapons.length)) return false;
     }
     if (advantage?.deityChoice) {
       const choice = this.deityChoiceFor(advantageId);
       if (count !== 1 || !choice.selection || (choice.selection === 'Autre' && !choice.customName.trim())
         || !choice.circumstances.trim() || !choice.helpingHand.trim()) return false;
     }
     return true;
   });
 }
  protected categoryLabel(category: AdvantageCategory): string {
    const labels: Record<AdvantageCategory, string> = { combat: 'Atouts de combat', origin: "Atouts d'origine", magic: 'Atouts magiques', social: 'Atouts sociaux', heroic: 'Atouts héroïques' };
    return labels[category];
  }

  protected advantagesByCategory(category: AdvantageCategory): Advantage[] {
    return this.advantages().filter((advantage) => advantage.category === category);
  }

  protected isCategoryVisible(category: AdvantageCategory): boolean {
    return this.selectedCategory() === 'all' || this.selectedCategory() === category;
  }

  protected onCategoryChange(event: Event): void {
    this.selectedCategory.set((event.target as HTMLSelectElement).value as 'all' | AdvantageCategory);
  }

  protected isAvailable(advantage: Advantage): boolean {
    const attributes = this.character?.attributes;
    const meetsCondition = !advantage.conditionAttribute || (attributes?.[advantage.conditionAttribute] ?? 0) >= (advantage.conditionMinimum ?? 0);
    const meetsOrigin = !advantage.conditionOrigin || this.character?.origin === advantage.conditionOrigin;
    const meetsPrerequisite = !advantage.prerequisiteId || this.isSelected(advantage.prerequisiteId);
    const meetsLevel = advantage.minimumLevel == null || (this.character?.level ?? 0) >= advantage.minimumLevel;
    return meetsCondition && meetsOrigin && meetsPrerequisite && meetsLevel;
  }

  protected conditionText(advantage: Advantage): string {
    const conditions = [
      advantage.conditionAttribute ? `${advantage.conditionAttribute} ${advantage.conditionMinimum}` : null,
      advantage.conditionOrigin ? `origine ${advantage.conditionOrigin}` : null,
      advantage.prerequisiteId ? 'un autre atout' : null,
      advantage.minimumLevel != null ? `niveau ${advantage.minimumLevel} minimum` : null,
    ].filter((condition) => condition !== null);
    return conditions.length ? `Condition : ${conditions.join(' · ')}` : 'Aucune condition';
  }
  protected toggle(id: string): void {
    const count = this.selectedCount(id);
    const advantage = this.advantages().find((item) => item.id === id);
    if (count > 0 && advantage && !this.isRepeatable(advantage)) this.selected.delete(id);
    else {
      if (advantage && this.isAvailable(advantage) && this.selectedTotal < this.advantageMaximum) {
        this.selected.set(id, count + 1);
        if (advantage.weaponChoice) {
          const choices = this.weaponChoices.get(id) ?? [];
          choices.push('');
          this.weaponChoices.set(id, choices);
        }
        if (advantage.deityChoice) this.deityChoices.set(id, { selection: '', customName: '', circumstances: '', helpingHand: '' });
      }
    }
  }

  protected removeOne(id: string): void {
    const count = this.selectedCount(id);
    if (count <= 1) this.selected.delete(id);
    else this.selected.set(id, count - 1);
    const advantage = this.advantages().find((item) => item.id === id);
    if (advantage?.weaponChoice) this.weaponChoices.get(id)?.pop();
    if (advantage?.deityChoice) this.deityChoices.delete(id);
  }

  protected save(): void {
    const maximum = this.advantageMaximum;
    if (!this.characterId || !this.canSave || this.selectedTotal !== maximum) return;
    const selected: CharacterAdvantage[] = [...this.selected].flatMap(([advantageId, count]) =>
      this.advantages().find((advantage) => advantage.id === advantageId)?.weaponChoice
        ? this.weaponChoicesFor(advantageId).slice(0, count).map((weapon) => ({ advantageId, chosenWeapon: weapon.trim() }))
        : this.advantages().find((advantage) => advantage.id === advantageId)?.deityChoice
        ? Array.from({ length: count }, () => {
          const choice = this.deityChoiceFor(advantageId);
          return {
            advantageId,
            chosenDeity: {
              name: choice.selection === 'Autre' ? choice.customName.trim() : choice.selection,
              circumstances: choice.circumstances.trim(),
              helpingHand: choice.helpingHand.trim(),
            },
          };
        })
        : Array.from({ length: count }, () => ({ advantageId })),
    );
    this.characterService.setAdvantages(this.characterId, selected);
    // on redirige vers la liste des personnages après l'ajout de l'avantage
    this.router.navigate(['/characters']);
  }
}
