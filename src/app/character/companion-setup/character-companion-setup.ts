import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CharacterAttributes } from '../character.model';
import { CharacterService } from '../character.service';

type AttributeKey = keyof CharacterAttributes;

@Component({
  imports: [RouterLink],
  selector: 'app-character-companion-setup',
  templateUrl: './character-companion-setup.html',
  styleUrl: './character-companion-setup.scss',
})
export class CharacterCompanionSetupPage {
  private readonly characterService = inject(CharacterService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  protected readonly characterId = this.route.snapshot.paramMap.get('id');
  protected readonly character = this.characterId ? this.characterService.findById(this.characterId) : undefined;
  protected readonly step = signal(this.readStep());
  protected selectedLevel = this.character?.level || 1;
  protected readonly attributes: CharacterAttributes = {
    force: this.character?.attributes.force ?? 0,
    dexterite: this.character?.attributes.dexterite ?? 0,
    constitution: this.character?.attributes.constitution ?? 0,
    sagesse: this.character?.attributes.sagesse ?? 0,
    intelligence: this.character?.attributes.intelligence ?? 0,
    charisme: this.character?.attributes.charisme ?? 0,
  };
  protected damage = this.character?.companionDamage ?? '';
  protected readonly error = signal('');
  protected readonly attributeFields: { key: AttributeKey; label: string }[] = [
    { key: 'force', label: 'FOR' },
    { key: 'dexterite', label: 'DEX' },
    { key: 'constitution', label: 'CON' },
    { key: 'sagesse', label: 'SAG' },
    { key: 'intelligence', label: 'INT' },
    { key: 'charisme', label: 'CHA' },
  ];

  protected get maximumLevel(): number | undefined { return this.character?.animalLevelCap; }
  protected get canContinueLevel(): boolean {
    return Number.isInteger(this.selectedLevel)
      && this.selectedLevel >= 1
      && (this.maximumLevel === undefined || this.selectedLevel <= this.maximumLevel);
  }
  protected get canSaveSetup(): boolean {
    return this.canContinueLevel && Object.values(this.attributes).every((value) => Number.isInteger(value) && value >= 0);
  }
  protected get previewScores() {
    if (!this.character) return undefined;
    return this.characterService.recalculateOtherScores(
      this.attributes,
      this.selectedLevel,
      this.character.otherScores,
      this.character.equipment.filter((item) => item.equipped).map((item) => item.equipmentId),
      this.character.advantages.map((item) => item.advantageId),
      this.character.animalLevelCap !== undefined,
    );
  }

  protected setLevel(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.selectedLevel = value === '' ? 0 : Number(value);
  }

  protected setAttribute(key: AttributeKey, event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.attributes[key] = value === '' ? 0 : Number(value);
  }

  protected setDamage(event: Event): void {
    this.damage = (event.target as HTMLInputElement).value;
  }

  protected saveStep(nextStep: number): void {
    if (!this.characterId || !this.canSaveSetup) return;
    const saved = this.characterService.updateCompanionSetup(
      this.characterId,
      this.selectedLevel,
      this.attributes,
      this.damage,
    );
    if (saved) {
      this.error.set('');
      this.step.set(nextStep);
    } else {
      this.error.set('Impossible d’enregistrer le compagnon. Vérifiez les données et l’espace de stockage disponible.');
    }
  }

  protected finish(): void {
    if (!this.characterId || !this.canSaveSetup) return;
    if (!this.characterService.updateCompanionSetup(this.characterId, this.selectedLevel, this.attributes, this.damage)) {
      this.error.set('Impossible d’enregistrer le compagnon. Vérifiez les données et l’espace de stockage disponible.');
      return;
    }
    this.error.set('');
    const ownerId = this.character?.ownerCharacterId;
    if (!ownerId) return;

    switch (this.route.snapshot.queryParamMap.get('returnTo')) {
      case 'flaws':
        this.router.navigate(['/characters', ownerId, 'flaws']);
        break;
      case 'level-result':
        this.router.navigate(['/characters', ownerId, 'level', 'result']);
        break;
      default:
        this.router.navigate(['/characters', ownerId]);
    }
  }

  protected backToAttributes(): void { this.step.set(2); }

  private readStep(): number {
    const requestedStep = Number(this.route.snapshot.queryParamMap.get('step'));
    return Number.isInteger(requestedStep) && requestedStep >= 1 && requestedStep <= 4 ? requestedStep : 1;
  }
}
