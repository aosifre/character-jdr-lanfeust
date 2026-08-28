import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CharacterAttributes, CharacterOtherScores } from '../character.model';
import { CharacterService } from '../character.service';
import { Skill } from '../../skill/skill.model';
import { SkillService } from '../../skill/skill.service';

type CharacteristicKey = keyof CharacterAttributes;

interface Characteristic {
  key: CharacteristicKey;
  label: string;
}

@Component({
  imports: [RouterLink],
  selector: 'app-character-characteristics-add',
  templateUrl: './character-characteristics-add.html',
  styleUrl: './character-characteristics-add.scss',
})
export class CharacterCharacteristicsAddPage {
  private readonly characterService = inject(CharacterService);
  private readonly skillService = inject(SkillService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  protected readonly characterId = this.route.snapshot.paramMap.get('id');
  protected readonly character = this.characterId
    ? this.characterService.findById(this.characterId)
    : undefined;
  protected readonly characteristics: Characteristic[] = [
    { key: 'force', label: 'Force' },
    { key: 'dexterite', label: 'Dextérité' },
    { key: 'constitution', label: 'Constitution' },
    { key: 'sagesse', label: 'Sagesse' },
    { key: 'intelligence', label: 'Intelligence' },
    { key: 'charisme', label: 'Charisme' },
  ];
  protected readonly skills = this.skillService.skillList;
  protected selectedCharacteristic: CharacteristicKey | undefined;

  protected get values(): CharacterAttributes {
    return { ...(this.character?.attributes ?? this.emptyAttributes), ...this.selectedAttributes };
  }

  protected get selectedAttributes(): Partial<CharacterAttributes> {
    if (!this.selectedCharacteristic || !this.character) return {};
    return {
      [this.selectedCharacteristic]: this.character.attributes[this.selectedCharacteristic] + 1,
    };
  }

  protected get emptyAttributes(): CharacterAttributes {
    return { force: 0, dexterite: 0, constitution: 0, sagesse: 0, intelligence: 0, charisme: 0 };
  }

  protected selectCharacteristic(key: CharacteristicKey): void {
    this.selectedCharacteristic = this.selectedCharacteristic === key ? undefined : key;
  }

  protected isSelected(key: CharacteristicKey): boolean {
    return this.selectedCharacteristic === key;
  }

  protected get affectedSkills(): Skill[] {
    if (!this.selectedCharacteristic) return [];
    return this.skills().filter(
      (skill) =>
        skill.attributeOne === this.selectedCharacteristic ||
        skill.attributeTwo === this.selectedCharacteristic,
    );
  }

  protected getSkillBonus(skill: Skill, attributes: CharacterAttributes): number {
    return attributes[skill.attributeOne] + attributes[skill.attributeTwo];
  }

  protected get currentScores(): CharacterOtherScores | undefined {
    return this.character?.otherScores;
  }

  protected get previewScores(): CharacterOtherScores | undefined {
    if (!this.character || !this.selectedCharacteristic) return undefined;
    return this.characterService.recalculateOtherScores(
      this.values,
      this.character.level,
      this.character.otherScores,
    );
  }

  protected save(): void {
    if (!this.characterId || !this.character || !this.selectedCharacteristic || !this.previewScores)
      return;
    this.characterService.setAttributes(this.characterId, this.values);
    this.characterService.setOtherScores(this.characterId, this.previewScores);
    // on redirige vers la liste des personnages après l'ajout de l'avantage
    this.router.navigate(['/characters']);
  }
}
