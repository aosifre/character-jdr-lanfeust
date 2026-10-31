import { PLATFORM_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { AdvantageService } from '../advantage/advantage.service';
import { EquipmentService } from '../equipment/equipment.service';
import { CharacterService } from './character.service';

describe('CharacterService', () => {
  let service: CharacterService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        { provide: PLATFORM_ID, useValue: 'server' },
        { provide: EquipmentService, useValue: { combatBonuses: () => ({ attack: 0, defense: 0 }) } },
        { provide: AdvantageService, useValue: {
          effectiveAttributes: (attributes: object) => attributes,
          combatScoreBonus: () => 0,
        } },
      ],
    });
    service = TestBed.inject(CharacterService);
  });

  it('accepts all origins used by the character form and legacy data', () => {
    const characters = ['baronies', 'barronies', 'other'].map((origin, index) => ({
      id: `hero-${index}`,
      firstName: 'Test',
      lastName: `Hero ${index}`,
      origin,
    }));

    expect(service.importCharacters(characters)).toBe(true);
    expect(service.characterList().map((character) => character.origin)).toEqual(characters.map((character) => character.origin));
  });
});
