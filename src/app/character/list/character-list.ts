import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CharacterService } from '../character.service';

@Component({
  imports: [RouterLink],
  selector: 'app-character-list',
  templateUrl: './character-list.html',
  styleUrl: './character-list.scss',
})
export class CharacterList {
  private readonly characterService = inject(CharacterService);
  protected readonly characters = this.characterService.characterList;
  protected importError = false;

  protected removeCharacter(id: string, firstName: string, lastName: string): void {
    if (window.confirm(`Supprimer le personnage ${firstName} ${lastName} ?`)) {
      this.characterService.remove(id);
    }
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