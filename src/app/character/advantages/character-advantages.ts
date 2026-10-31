import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CharacterAdvantage, CharacterRecipe } from '../character.model';
import { CharacterService } from '../character.service';
import { AdvantageService } from '../../advantage/advantage.service';
import { SettingsService } from '../../settings/settings.service';
import { SkillService } from '../../skill/skill.service';
import { Advantage, DARSHAN_DEITIES, DeityChoiceDraft } from '../../advantage/advantage.model';
import { AdvantageCategory } from '../../advantage/advantage.model';
import { AdvantageDescriptionPipe } from '../../advantage/advantage-description.pipe';
import { MagicPowerChoice } from '../magic-power.model';
import { MagicPowerPicker } from '../magic-power-picker';

@Component({ imports: [RouterLink, AdvantageDescriptionPipe, MagicPowerPicker], selector: 'app-character-advantages', templateUrl: './character-advantages.html', styleUrl: './character-advantages.scss' })
export class CharacterAdvantagesPage {
  private readonly characterService = inject(CharacterService);
  private readonly advantageService = inject(AdvantageService);
  private readonly settingsService = inject(SettingsService);
  private readonly skillService = inject(SkillService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  protected readonly characterId = this.route.snapshot.paramMap.get('id');
  protected readonly character = this.characterId ? this.characterService.findById(this.characterId) : undefined;
  protected readonly advantages = this.advantageService.advantageList;
  protected readonly skills = this.skillService.skillList;
  protected readonly categories: AdvantageCategory[] = ['combat', 'origin', 'magic', 'social', 'heroic'];
  protected readonly selectedCategory = signal<'all' | AdvantageCategory>('all');
  protected readonly selected = new Map<string, number>();
  protected readonly regionChoices = new Map<string, string>();
  protected readonly weaponChoices = new Map<string, string[]>();
  protected readonly deityChoices = new Map<string, DeityChoiceDraft>();
  protected readonly recipeChoices = new Map<string, CharacterRecipe[]>();
  protected readonly magicPowerChoices = new Map<string, MagicPowerChoice>();
  protected readonly confirmedRecipeChoices = new Set<string>();
  protected readonly deities = DARSHAN_DEITIES;
  protected readonly availableAdvantages = this.settingsService.currentSettings;
  protected recipeModalAdvantageId: string | null = null;
  protected magicModalAdvantageId: string | null = null;

  constructor() {
    for (const selectedAdvantage of this.character?.advantages ?? []) {
      const { advantageId } = selectedAdvantage;
      this.selected.set(advantageId, (this.selected.get(advantageId) ?? 0) + 1);
      if (advantageId === 'turf-attitre') this.regionChoices.set(advantageId, selectedAdvantage.chosenRegion ?? '');
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
      if (advantage?.recipeChoice) {
        const recipes = this.recipeChoices.get(advantageId) ?? [];
        const storedRecipes = selectedAdvantage.recipes ?? [];
        const recipesPerOccurrence = advantage.recipeCount ?? 1;
        for (let index = 0; index < recipesPerOccurrence; index++) {
          recipes.push(storedRecipes[index] ?? this.emptyRecipe());
        }
        this.recipeChoices.set(advantageId, recipes);
      }
      if (selectedAdvantage.magicPowerChoice) this.magicPowerChoices.set(advantageId, selectedAdvantage.magicPowerChoice);
    }
    for (const advantageId of this.selected.keys()) {
      if (this.areRecipesValid(advantageId)) this.confirmedRecipeChoices.add(advantageId);
    }
  }

  protected isSelected(id: string): boolean { return this.selectedCount(id) > 0; }
  protected selectedCount(id: string): number { return this.selected.get(id) ?? 0; }
  protected get selectedTotal(): number { return [...this.selected.values()].reduce((total, count) => total + count, 0); }
  protected get canSave(): boolean { return this.selectedTotal === this.availableAdvantages().availableAdvantages && this.hasValidChoices(); }
  protected isRepeatable(advantage: Advantage): boolean { return advantage.repeatable === true; }
  protected canAddOccurrence(advantage: Advantage, maximum: number): boolean {
    return this.selectedTotal < maximum && this.selectedCount(advantage.id) < (advantage.maxRepeatable ?? Number.POSITIVE_INFINITY);
  }
  protected regionChoiceFor(advantageId: string): string { return this.regionChoices.get(advantageId) ?? ''; }
  protected setRegionChoice(advantageId: string, event: Event): void {
    this.regionChoices.set(advantageId, (event.target as HTMLInputElement).value);
  }
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
  protected recipeChoicesFor(advantageId: string): CharacterRecipe[] { return this.recipeChoices.get(advantageId) ?? []; }
  protected setRecipeChoice(advantageId: string, index: number, field: keyof CharacterRecipe, event: Event): void {
    const recipes = this.recipeChoices.get(advantageId) ?? [];
    const value = (event.target as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement).value;
    const recipe = { ...(recipes[index] ?? this.emptyRecipe()), [field]: field === 'energyCost' ? (value === '' ? null : Number(value)) : value };
    recipes[index] = recipe as CharacterRecipe;
    this.recipeChoices.set(advantageId, recipes);
    this.confirmedRecipeChoices.delete(advantageId);
  }
  protected openRecipeModal(advantageId: string): void {
    if (this.isSelected(advantageId)) this.recipeModalAdvantageId = advantageId;
  }
  protected closeRecipeModal(): void { this.recipeModalAdvantageId = null; }
  protected get canConfirmRecipeModal(): boolean {
    return this.recipeModalAdvantageId !== null && this.areRecipesValid(this.recipeModalAdvantageId);
  }
  protected confirmRecipeModal(): void {
    if (!this.canConfirmRecipeModal || this.recipeModalAdvantageId === null) return;
    this.confirmedRecipeChoices.add(this.recipeModalAdvantageId);
    this.closeRecipeModal();
  }
  protected advantageTitle(advantageId: string): string {
    return this.advantages().find((advantage) => advantage.id === advantageId)?.title ?? 'Atout';
  }
  protected isMajorRecipe(recipe: CharacterRecipe): boolean { return recipe.powerType === 'majeurs'; }
  private emptyRecipe(): CharacterRecipe {
    return { ingredients: '', rareIngredient: '', power: '', powerType: '', range: '', duration: '', energyCost: null };
  }
  private isValidRecipe(recipe: CharacterRecipe): boolean {
    return recipe.ingredients.trim().length > 0
      && recipe.power.trim().length > 0
      && ['communs', 'mineurs', 'majeurs'].includes(recipe.powerType)
      && recipe.range.trim().length > 0
      && recipe.duration.trim().length > 0
      && recipe.energyCost !== null
      && Number.isInteger(recipe.energyCost)
      && recipe.energyCost >= 0
      && (recipe.powerType !== 'majeurs' || recipe.rareIngredient.trim().length > 0);
  }
  private areRecipesValid(advantageId: string): boolean {
    const advantage = this.advantages().find((item) => item.id === advantageId);
    const count = this.selectedCount(advantageId) * (advantage?.recipeCount ?? 1);
    const recipes = this.recipeChoices.get(advantageId) ?? [];
    return count > 0 && recipes.length >= count && recipes.slice(0, count).every((recipe) => this.isValidRecipe(recipe));
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
      if (advantageId === 'turf-attitre' && (count !== 1 || !this.regionChoiceFor(advantageId).trim())) return false;
      if (advantage?.recipeChoice) {
        if (!this.confirmedRecipeChoices.has(advantageId) || !this.areRecipesValid(advantageId)) return false;
      }
      if (advantageId === 'pouvoir-magique' && !this.magicPowerChoices.has(advantageId)) return false;
      return true;
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
    if (advantage.evolutionOnly) return false;
    const attributes = this.character
      ? this.advantageService.effectiveAttributes(this.character.attributes, [...this.selected.keys()])
      : undefined;
    const meetsCondition = !advantage.conditionAttribute || (attributes?.[advantage.conditionAttribute] ?? 0) >= (advantage.conditionMinimum ?? 0);
    const meetsOrigin = !advantage.conditionOrigin || this.character?.origin === advantage.conditionOrigin;
    const skill = advantage.conditionSkillId ? this.skills().find((item) => item.id === advantage.conditionSkillId) : undefined;
    const selectedSkill = this.character?.skills.find((item) => item.skillId === advantage.conditionSkillId);
    const skillScore = skill && attributes
      ? attributes[skill.attributeOne] + attributes[skill.attributeTwo] + (selectedSkill?.degree ?? 0) + this.advantageService.skillBonus([...this.selected.keys()], skill.id)
      : 0;
    const meetsSkill = !advantage.conditionSkillId || (!!skill && skillScore >= (advantage.conditionSkillMinimum ?? 0));
    const meetsPrerequisite = !advantage.prerequisiteId || this.isSelected(advantage.prerequisiteId);
    const meetsExclusions = !(advantage.excludedAdvantageIds ?? []).some((id) => this.isSelected(id))
      && ![...this.selected.keys()].some((selectedId) =>
        (this.advantages().find((item) => item.id === selectedId)?.excludedAdvantageIds ?? []).includes(advantage.id),
      );
    const meetsLevel = advantage.minimumLevel == null || (this.character?.level ?? 0) >= advantage.minimumLevel;
    return meetsCondition && meetsOrigin && meetsSkill && meetsPrerequisite && meetsExclusions && meetsLevel;
  }
  protected conditionText(advantage: Advantage): string {
    const conditions = [
      advantage.conditionDescription,
      advantage.conditionAttribute ? `${advantage.conditionAttribute} ${advantage.conditionMinimum}` : null,
      advantage.conditionOrigin ? `origine ${advantage.conditionOrigin}` : null,
      advantage.conditionSkillId ? `${this.skills().find((skill) => skill.id === advantage.conditionSkillId)?.label ?? advantage.conditionSkillId} ${advantage.conditionSkillMinimum ?? 0} minimum` : null,
      ...(advantage.excludedAdvantageIds ?? []).map((id) => `incompatible avec ${this.advantages().find((item) => item.id === id)?.title ?? id}`),
      advantage.prerequisiteId ? 'un autre atout' : null,
      advantage.minimumLevel != null ? `niveau ${advantage.minimumLevel} minimum` : null,
      advantage.evolutionOnly ? 'à choisir uniquement lors d’une évolution' : null,
    ].filter((condition) => condition !== null);
    return conditions.length ? `Condition : ${conditions.join(' · ')}` : 'Aucune condition';
  }
  protected toggle(id: string): void {
    const count = this.selectedCount(id);
    const maximum = this.availableAdvantages().availableAdvantages;
    const advantage = this.advantages().find((item) => item.id === id);
    if (count > 0 && advantage && !this.isRepeatable(advantage)) {
      this.selected.delete(id);
      this.clearChoices(id, advantage);
      this.magicPowerChoices.delete(id);
      this.confirmedRecipeChoices.delete(id);
      if (this.recipeModalAdvantageId === id) this.closeRecipeModal();
      if (this.magicModalAdvantageId === id) this.closeMagicPowerModal();
    }
    else {
      if (advantage && this.isAvailable(advantage) && this.canAddOccurrence(advantage, maximum)) {
        this.selected.set(id, count + 1);
        if (advantage.weaponChoice) {
          const choices = this.weaponChoices.get(id) ?? [];
          choices.push('');
          this.weaponChoices.set(id, choices);
        }
        if (advantage.deityChoice) this.deityChoices.set(id, { selection: '', customName: '', circumstances: '', helpingHand: '' });
        if (advantage.recipeChoice) {
          const recipes = this.recipeChoices.get(id) ?? [];
          this.recipeChoices.set(id, [...recipes, ...Array.from({ length: advantage.recipeCount ?? 1 }, () => this.emptyRecipe())]);
          this.confirmedRecipeChoices.delete(id);
          this.openRecipeModal(id);
        }
        if (id === 'pouvoir-magique') this.openMagicPowerModal(id);
      }
    }
  }

  protected removeOne(id: string): void {
    const count = this.selectedCount(id);
    if (count <= 1) this.selected.delete(id);
    else this.selected.set(id, count - 1);
    const advantage = this.advantages().find((item) => item.id === id);
    if (advantage) {
      this.clearChoices(id, advantage, advantage.recipeCount ?? 1);
      if (id === 'turf-attitre' && count <= 1) this.regionChoices.delete(id);
      if (id === 'pouvoir-magique') this.magicPowerChoices.delete(id);
      this.confirmedRecipeChoices.delete(id);
      if (this.recipeModalAdvantageId === id) this.closeRecipeModal();
    }
  }

  protected save(): void {
    const maximum = this.availableAdvantages().availableAdvantages;
    if (!this.characterId || !this.canSave || this.selectedTotal !== maximum) return;
    const selected: CharacterAdvantage[] = [...this.selected].flatMap(([advantageId, count]) => {
      const advantage = this.advantages().find((item) => item.id === advantageId);
      if (advantageId === 'turf-attitre') {
        return Array.from({ length: count }, () => ({ advantageId, chosenRegion: this.regionChoiceFor(advantageId).trim() }));
      }
      if (advantage?.weaponChoice) return this.weaponChoicesFor(advantageId).slice(0, count).map((weapon) => ({ advantageId, chosenWeapon: weapon.trim() }));
      if (advantage?.deityChoice) return Array.from({ length: count }, () => {
          const choice = this.deityChoiceFor(advantageId);
          return {
            advantageId,
            chosenDeity: {
              name: choice.selection === 'Autre' ? choice.customName.trim() : choice.selection,
              circumstances: choice.circumstances.trim(),
              helpingHand: choice.helpingHand.trim(),
            },
          };
        });
      if (advantage?.recipeChoice) {
        const recipesPerOccurrence = advantage.recipeCount ?? 1;
        const recipes = this.recipeChoicesFor(advantageId);
        return Array.from({ length: count }, (_, occurrence) => ({
          advantageId,
          recipes: recipes.slice(occurrence * recipesPerOccurrence, (occurrence + 1) * recipesPerOccurrence),
        }));
      }
      if (advantageId === 'pouvoir-magique') {
        const choice = this.magicPowerChoices.get(advantageId);
        return choice ? Array.from({ length: count }, () => ({ advantageId, magicPowerChoice: choice })) : [];
      }
      return Array.from({ length: count }, () => ({ advantageId }));
    });
    this.characterService.setAdvantages(this.characterId, selected);
    this.router.navigate(['/characters', this.characterId, 'flaws']);
  }
  private clearChoices(id: string, advantage: Advantage, recipeCount = Number.POSITIVE_INFINITY): void {
    if (id === 'turf-attitre') this.regionChoices.delete(id);
    if (advantage.weaponChoice) this.weaponChoices.get(id)?.pop();
    if (advantage.deityChoice) this.deityChoices.delete(id);
    if (advantage.recipeChoice) {
      const recipes = this.recipeChoices.get(id) ?? [];
      if (Number.isFinite(recipeCount)) recipes.splice(-recipeCount);
      else recipes.length = 0;
      this.recipeChoices.set(id, recipes);
    }
  }
  protected openMagicPowerModal(advantageId: string): void {
    if (this.isSelected(advantageId)) this.magicModalAdvantageId = advantageId;
  }
  protected closeMagicPowerModal(): void { this.magicModalAdvantageId = null; }
  protected setMagicPowerChoice(advantageId: string, choice: MagicPowerChoice): void {
    this.magicPowerChoices.set(advantageId, choice);
    this.closeMagicPowerModal();
  }
}
