import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CharacterAttributes, CharacterOrigin } from '../character.model';
import { CharacterService } from '../character.service';
import { SkillService } from '../../skill/skill.service';
import { AdvantageService } from '../../advantage/advantage.service';
import { SettingsService } from '../../settings/settings.service';

type EditTab = 'identity' | 'attributes' | 'scores' | 'skills' | 'advantages' | 'flaws';

@Component({ imports: [ReactiveFormsModule, RouterLink], selector: 'app-character-edit-page', templateUrl: './character-edit-page.html', styleUrl: './character-edit-page.scss' })
export class CharacterEditPage {
  private readonly characterService = inject(CharacterService);
  private readonly skillService = inject(SkillService);
  private readonly advantageService = inject(AdvantageService);
  private readonly settingsService = inject(SettingsService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  protected readonly characterId = this.route.snapshot.paramMap.get('id');
  protected readonly character = this.characterId ? this.characterService.findById(this.characterId) : undefined;
  protected activeTab: EditTab = 'identity';
  protected readonly tabs: { id: EditTab; label: string }[] = [
    { id: 'identity', label: 'Qui suis-je ?' }, { id: 'attributes', label: 'Caractéristiques' }, { id: 'scores', label: 'Autres scores' },
    { id: 'skills', label: 'Compétences' }, { id: 'advantages', label: 'Atouts' }, { id: 'flaws', label: 'Travers' },
  ];
  protected readonly attributeKeys: (keyof CharacterAttributes)[] = ['force', 'dexterite', 'constitution', 'sagesse', 'intelligence', 'charisme'];
  protected readonly identityForm = new FormGroup({
    firstName: new FormControl('', { nonNullable: true, validators: [Validators.required] }), lastName: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    description: new FormControl('', { nonNullable: true }), origin: new FormControl<CharacterOrigin>('human', { nonNullable: true }),
  });
  protected readonly attributes: CharacterAttributes = { ...(this.character?.attributes ?? { force: 0, dexterite: 0, constitution: 0, sagesse: 0, intelligence: 0, charisme: 0 }) };
  protected readonly skills = this.skillService.skillList;
  protected readonly selectedSkills = new Set(this.character?.skills.map((skill) => skill.skillId) ?? []);
  protected readonly advantages = this.advantageService.advantageList;
  protected readonly selectedAdvantages = new Set(this.character?.advantages.map((advantage) => advantage.advantageId) ?? []);
  protected readonly flaws = this.settingsService.flawList;
  protected readonly selectedFlaws = new Set(this.character?.flaws.map((flaw) => flaw.flawId) ?? []);
  protected combatBonus = this.character?.otherScores.combatBonus ?? null;
  protected readonly combatBonusPoints = { ...(this.character?.otherScores.combatBonusPoints ?? { attack: 0, defense: 0, save: 0 }) };

  constructor() {
    if (this.character) this.identityForm.setValue({ firstName: this.character.firstName, lastName: this.character.lastName, description: this.character.description, origin: this.character.origin });
  }

  protected selectTab(tab: EditTab): void { this.activeTab = tab; }
  protected saveIdentity(): void {
    if (!this.characterId || this.identityForm.invalid) { this.identityForm.markAllAsTouched(); return; }
    const value = this.identityForm.getRawValue();
    this.characterService.update(this.characterId, value.firstName.trim(), value.lastName.trim(), value.description.trim(), value.origin);
  }
  protected selectAttribute(key: keyof CharacterAttributes): void {
    const currentValue = this.attributes[key];
    if (currentValue > 0) {
      this.attributes[key] = 0;
      return;
    }
    const usedValues = Object.values(this.attributes);
    const nextValue = [1, 2, 3, 4, 5].find((value) => !usedValues.includes(value));
    if (nextValue !== undefined) this.attributes[key] = nextValue;
  }
  protected saveAttributes(): void { if (this.characterId) this.characterService.setAttributes(this.characterId, this.attributes); }
  protected chooseCombatBonus(bonus: 'attack' | 'defense' | 'save'): void {
    const total = this.combatBonusPoints.attack + this.combatBonusPoints.defense + this.combatBonusPoints.save;
    if (this.combatBonusPoints[bonus] > 0) this.combatBonusPoints[bonus]--;
    else if (total < 2) this.combatBonusPoints[bonus]++;
    this.combatBonus = this.combatBonusPoints.attack > 0 ? 'attack' : this.combatBonusPoints.defense > 0 ? 'defense' : this.combatBonusPoints.save > 0 ? 'save' : null;
  }
  protected saveScores(): void {
    if (!this.characterId || !this.character) return;
    const a = this.attributes; const points = this.combatBonusPoints;
    this.characterService.setOtherScores(this.characterId, { attack: a.force + a.intelligence + points.attack, defense: a.dexterite + a.sagesse + points.defense, save: a.constitution + a.charisme + points.save, hitPoints: 10 + a.constitution, energyPoints: 5 + a.sagesse, combatBonus: this.combatBonus, combatBonusPoints: points });
  }
  protected get combatBonusTotal(): number { return this.combatBonusPoints.attack + this.combatBonusPoints.defense + this.combatBonusPoints.save; }
  protected toggle(set: Set<string>, id: string): void { if (set.has(id)) set.delete(id); else set.add(id); }
  protected saveCollections(): void {
    if (!this.characterId) return;
    this.characterService.setSkills(this.characterId, [...this.selectedSkills].map((skillId) => ({ skillId, degree: 1 })));
    this.characterService.setAdvantages(this.characterId, [...this.selectedAdvantages].map((advantageId) => ({ advantageId })));
    this.characterService.setFlaws(this.characterId, [...this.selectedFlaws].map((flawId) => ({ flawId })));
  }
  protected finish(): void { this.saveIdentity(); this.saveAttributes(); this.saveScores(); this.saveCollections(); this.router.navigate(['/characters']); }
  protected isSelected(set: Set<string>, id: string): boolean { return set.has(id); }
}
