import { Component, inject } from '@angular/core';
import { CharacterService } from '../character.service';
import { CombatBonus } from '../character.model';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  imports: [ReactiveFormsModule, RouterLink, CommonModule],
  selector: 'app-character-level-up-result',
  templateUrl: './character-level-up-result.html',
  styleUrl: './character-level-up-result.scss',
})
export class CharacterLevelUpResultPage {
  private readonly characterService = inject(CharacterService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  protected readonly characterId = this.route.snapshot.paramMap.get('id');
  protected character = this.characterId
    ? this.characterService.findById(this.characterId)
    : undefined;
  protected readonly form = new FormGroup({
    nextLevelChoice: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
  });
  protected readonly combatBonusOptions: Exclude<CombatBonus, null>[] = ['attack', 'defense', 'save'];
  protected selectedCombatBonuses: Exclude<CombatBonus, null>[] = [];
  protected combatBonusSelectionComplete = false;

  public optionsLevelUp = [
    { value: 'skills', label: 'Apprendre de nouvelles compétences' },
    { value: 'advantages', label: 'Obtenir de nouveaux atouts' },
    { value: 'characteristics', label: 'Améliorer les caractéristiques du personnage' },
  ];
  protected nextLevelAchievement = false;

  protected selectCombatBonus(bonus: Exclude<CombatBonus, null>): void {
    if (this.selectedCombatBonuses.includes(bonus)) {
      this.selectedCombatBonuses = this.selectedCombatBonuses.filter((selected) => selected !== bonus);
    } else if (this.selectedCombatBonuses.length < 2) {
      this.selectedCombatBonuses = [...this.selectedCombatBonuses, bonus];
    }
  }

  protected isCombatBonusSelected(bonus: Exclude<CombatBonus, null>): boolean {
    return this.selectedCombatBonuses.includes(bonus);
  }

  protected confirmCombatBonuses(): void {
    if (!this.characterId || this.selectedCombatBonuses.length !== 2) return;
    this.characterService.addCombatBonusPoints(this.characterId, this.selectedCombatBonuses);
    this.character = this.characterService.findById(this.characterId);
    this.combatBonusSelectionComplete = true;
  }

  protected save(): void {
    if (!this.characterId || !this.character || !this.combatBonusSelectionComplete || this.form.invalid) return;

    switch (this.form.getRawValue().nextLevelChoice) {
      case 'skills':
        this.router.navigate(['/characters', this.characterId, 'skills', 'add']);
        break;
      case 'advantages':
        this.router.navigate(['/characters', this.characterId, 'advantages', 'add']);
        break;
      case 'characteristics':
        this.router.navigate(['/characters', this.characterId, 'characteristics', 'add']);
        break;
      default:
        break;
    }
  }
}
