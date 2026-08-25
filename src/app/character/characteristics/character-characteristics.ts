import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CharacterAttributes } from '../character.model';
import { CharacterService } from '../character.service';

type CharacteristicKey = keyof CharacterAttributes;

interface Characteristic {
  key: CharacteristicKey;
  label: string;
}

@Component({
  imports: [RouterLink],
  selector: 'app-character-characteristics',
  templateUrl: './character-characteristics.html',
  styleUrl: './character-characteristics.scss',
})
export class CharacterCharacteristics {
  private readonly characterService = inject(CharacterService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  protected readonly characterId = this.route.snapshot.paramMap.get('id');
  protected readonly character = this.characterId ? this.characterService.findById(this.characterId) : undefined;
  protected readonly characteristics: Characteristic[] = [
    { key: 'force', label: 'Force' },
    { key: 'dexterite', label: 'Dextérité' },
    { key: 'constitution', label: 'Constitution' },
    { key: 'sagesse', label: 'Sagesse' },
    { key: 'intelligence', label: 'Intelligence' },
    { key: 'charisme', label: 'Charisme' },
  ];
  protected readonly values: CharacterAttributes = { ...(this.character?.attributes ?? {
    force: 0, dexterite: 0, constitution: 0, sagesse: 0, intelligence: 0, charisme: 0,
  }) };

  protected selectCharacteristic(key: CharacteristicKey): void {
    const currentValue = this.values[key];
    if (currentValue > 0) {
      this.values[key] = 0;
      return;
    }

    const usedValues = Object.values(this.values);
    const nextValue = [1, 2, 3, 4, 5].find((value) => !usedValues.includes(value));
    if (nextValue !== undefined) this.values[key] = nextValue;
  }

  protected get assignedCount(): number {
    return Object.values(this.values).filter((value) => value > 0).length;
  }

  protected save(): void {
    if (!this.characterId || this.assignedCount !== 5) return;
    this.characterService.setAttributes(this.characterId, this.values);
    this.router.navigate(['/characters', this.characterId, 'otherscores']);
  }
}