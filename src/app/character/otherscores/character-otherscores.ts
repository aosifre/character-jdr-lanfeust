import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CharacterOtherScores as CharacterOtherScoresModel } from '../character.model';
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
    combatBonusPoints: { ...(this.character?.otherScores.combatBonusPoints ?? { attack: 0, defense: 0, save: 0 }) },
  };

  constructor() {
    this.refreshCombatScores();
  }

  protected selectCombatBonus(bonus: 'attack' | 'defense' | 'save'): void {
    const points = this.otherScores.combatBonusPoints;
    const total = points.attack + points.defense + points.save;
    if (points[bonus] > 0) points[bonus]--;
    else if (total < 2) points[bonus]++;
    this.otherScores.combatBonus = points.attack > 0 ? 'attack' : points.defense > 0 ? 'defense' : points.save > 0 ? 'save' : null;
    this.refreshCombatScores();
  }

  protected save(): void {
    if (!this.characterId || !this.character || this.bonusPointsTotal !== 2) return;
    this.refreshCombatScores();
    this.characterService.setOtherScores(this.characterId, this.otherScores);
    this.router.navigate(['/characters', this.characterId, 'skills']);
  }

  protected get bonusPointsTotal(): number { const points = this.otherScores.combatBonusPoints; return points.attack + points.defense + points.save; }

  private refreshCombatScores(): void {
    const attributes = this.character?.attributes;
    if (!attributes) return;
    const points = this.otherScores.combatBonusPoints;
    this.otherScores.attack = attributes.force + attributes.intelligence + points.attack;
    this.otherScores.defense = attributes.dexterite + attributes.sagesse + points.defense;
    this.otherScores.save = attributes.constitution + attributes.charisme + points.save;
    this.otherScores.hitPoints = 10 + attributes.constitution;
    this.otherScores.energyPoints = 5 + attributes.sagesse;
  }
}