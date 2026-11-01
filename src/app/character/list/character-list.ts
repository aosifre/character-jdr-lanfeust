import { Component, computed, inject } from '@angular/core';
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
  protected readonly characters = computed(() => this.characterService.characterList().filter((character) => !character.ownerCharacterId));
  protected importError = false;

  protected removeCharacter(id: string, firstName: string, lastName: string): void {
    if (window.confirm(`Supprimer le personnage ${firstName} ${lastName} ?`)) {
      this.characterService.remove(id);
    }
  }

}
