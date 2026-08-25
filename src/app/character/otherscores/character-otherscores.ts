import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CharacterOtherScores as CharacterOtherScoresModel, CombatBonus } from '../character.model';
import { CharacterService } from '../character.service';

@Component({
  imports: [RouterLink],
  selector: 'app-character-otherscores',
  templateUrl: './character-otherscores.html',
  styleUrl: './character-otherscores.scss',
})
export class CharacterOtherScoresPage {
  private readonly characterService = inject(CharacterService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  protected readonly characterId = this.route.snapshot.paramMap.get('id');
  protected readonly character = this.characterId ? this.characterService.findById(this.characterId) : undefined;
  protected readonly otherScores: CharacterOtherScoresModel = {
    attack: this.character?.otherScores.attack ?? 0,
    defense: this.character?.otherScores.defense ?? 0,
    save: this.character?.otherScores.save ?? 0,
    hitPoints: this.character?.otherScores.hitPoints ?? 0,
    energyPoints: this.character?.otherScores.energyPoints ?? 0,
    combatBonus: this.character?.otherScores.combatBonus ?? null,
  };

  constructor() {
    this.refreshCombatScores();
  }

  protected selectCombatBonus(bonus: Exclude<CombatBonus, null>): void {
    this.otherScores.combatBonus = this.otherScores.combatBonus === bonus ? null : bonus;
    this.refreshCombatScores();
  }

  protected save(): void {
    if (!this.characterId || !this.character || this.otherScores.combatBonus === null) return;
    this.refreshCombatScores();
    this.characterService.setOtherScores(this.characterId, this.otherScores);
    this.router.navigate(['/characters', this.characterId, 'skills']);
  }

  private refreshCombatScores(): void {
    const attributes = this.character?.attributes;
    if (!attributes) return;
    const bonus = this.otherScores.combatBonus;
    this.otherScores.attack = attributes.force + attributes.intelligence + (bonus === 'attack' ? 1 : 0);
    this.otherScores.defense = attributes.dexterite + attributes.sagesse + (bonus === 'defense' ? 1 : 0);
    this.otherScores.save = attributes.constitution + attributes.charisme + (bonus === 'save' ? 1 : 0);
    this.otherScores.hitPoints = 10 + attributes.constitution;
    this.otherScores.energyPoints = 5 + attributes.sagesse;
  }
}