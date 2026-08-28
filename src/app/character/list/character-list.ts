import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CharacterService } from '../character.service';
import { Character } from '../character.model';
import { SettingsService } from '../../settings/settings.service';

@Component({
  imports: [RouterLink],
  selector: 'app-character-list',
  templateUrl: './character-list.html',
  styleUrl: './character-list.scss',
})
export class CharacterList {
  private readonly characterService = inject(CharacterService);
  private readonly settingsService = inject(SettingsService);
  protected readonly characters = this.characterService.characterList;
  protected importError = false;

  protected removeCharacter(id: string, firstName: string, lastName: string): void {
    if (window.confirm(`Supprimer le personnage ${firstName} ${lastName} ?`)) {
      this.characterService.remove(id);
    }
  }


  protected isCreationComplete(character: Character): boolean {
    return this.getMissingSteps(character).length === 0;
  }

  protected getCreationStatusMessage(character: Character): string {
    const missingSteps = this.getMissingSteps(character);
    return missingSteps.length === 0
      ? 'Création terminée : personnage prêt.'
      : `Étapes manquantes : ${missingSteps.join(', ')}.`;
  }

  private getMissingSteps(character: Character): string[] {
    const missingSteps: string[] = [];
    const attributes = Object.values(character.attributes);
    const attributesComplete = attributes.length === 6
      && attributes.filter((value) => value > 0).length === 5
      && [1, 2, 3, 4, 5].every((value) => attributes.includes(value));
    const requiredAdvantages = this.settingsService.currentSettings().availableAdvantages;
    if (!character.firstName.trim() || !character.lastName.trim()) missingSteps.push('Qui suis-je ?');
    if (!attributesComplete) missingSteps.push('Caractéristiques');
    if (character.otherScores.combatBonus === null) missingSteps.push('Autres scores');
    if (character.skills.length !== 4 + character.attributes.intelligence) missingSteps.push('Compétences');
    if (character.advantages.length < requiredAdvantages) missingSteps.push('Atouts');
    if (character.flaws.length === 0) missingSteps.push('Travers');
    return missingSteps;
  }

  protected exportCharacters(): void {
    const file = new Blob([JSON.stringify(this.characters(), null, 2)], { type: 'application/json' });
    const downloadUrl = URL.createObjectURL(file);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = 'personnages-lanfeust-de-troy.json';
    link.click();
    URL.revokeObjectURL(downloadUrl);
  }

  protected importCharacters(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      try {
        this.importError = !this.characterService.importCharacters(JSON.parse(String(reader.result)));
      } catch {
        this.importError = true;
      }
      input.value = '';
    };
    reader.readAsText(file);
  }
}