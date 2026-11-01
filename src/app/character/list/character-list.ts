import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CharacterService } from '../character.service';
import { Character, CompanionType } from '../character.model';

@Component({
  imports: [RouterLink],
  selector: 'app-character-list',
  templateUrl: './character-list.html',
  styleUrl: './character-list.scss',
})
export class CharacterList {
  private readonly characterService = inject(CharacterService);
  protected readonly characters = computed(() => this.characterService.characterList().filter((character) => !character.ownerCharacterId));
  protected readonly companions = computed(() => this.characterService.characterList().filter((character) => !!character.ownerCharacterId));
  protected readonly companionNames = new Map<string, string>();
  protected readonly companionTypes = new Map<string, CompanionType>();
  protected readonly creationErrors = new Set<string>();
  protected importError = false;

  protected companionNamesFor(characterId: string): string[] {
    return this.characterService.companionsFor(characterId).map((companion) => companion.firstName);
  }

  protected availableCompanionTypesFor(characterId: string): { value: CompanionType; label: string }[] {
    const types: { value: CompanionType; label: string }[] = [
      { value: 'animal', label: 'Animal' },
      { value: 'devoted-servant', label: 'Dévoué serviteur' },
      { value: 'hired-thug', label: 'Tête à claques' },
    ];
    return types.filter((type) => this.characterService.canCreateCompanionForHero(characterId, type.value));
  }

  protected selectedCompanionType(characterId: string): CompanionType {
    const available = this.availableCompanionTypesFor(characterId);
    const selected = this.companionTypes.get(characterId);
    return selected && available.some((type) => type.value === selected) ? selected : available[0]?.value ?? 'animal';
  }

  protected setCompanionType(characterId: string, event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    if (value === 'animal' || value === 'devoted-servant' || value === 'hired-thug') {
      this.companionTypes.set(characterId, value);
    }
  }

  protected companionNameFor(characterId: string): string {
    return this.companionNames.get(characterId) ?? '';
  }

  protected setCompanionName(characterId: string, event: Event): void {
    this.companionNames.set(characterId, (event.target as HTMLInputElement).value);
    this.creationErrors.delete(characterId);
  }

  protected createCompanion(characterId: string): void {
    const companion = this.characterService.createCompanionForHero(
      characterId,
      this.companionNameFor(characterId),
      this.selectedCompanionType(characterId),
    );
    if (!companion) {
      this.creationErrors.add(characterId);
      return;
    }
    this.creationErrors.delete(characterId);
    this.companionNames.delete(characterId);
    this.companionTypes.delete(characterId);
  }

  protected hasCreationError(characterId: string): boolean {
    return this.creationErrors.has(characterId);
  }

  protected ownerName(ownerCharacterId: string | undefined): string {
    const owner = ownerCharacterId ? this.characterService.findById(ownerCharacterId) : undefined;
    return owner ? `${owner.firstName} ${owner.lastName}`.trim() : 'Héros introuvable';
  }

  protected companionTypeLabel(companion: Character): string {
    switch (companion.companionType ?? (companion.animalLevelCap !== undefined ? 'animal' : 'devoted-servant')) {
      case 'animal': return 'Animal';
      case 'devoted-servant': return 'Dévoué serviteur';
      case 'hired-thug': return 'Tête à claques';
    }
  }

  protected removeCharacter(id: string, firstName: string, lastName: string): void {
    if (window.confirm(`Supprimer le personnage ${firstName} ${lastName} ?`)) {
      this.characterService.remove(id);
    }
  }

}
