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

  it('includes Réserves d’énergie occurrences in maximum energy during recalculation', () => {
    const attributes = { force: 0, dexterite: 0, constitution: 0, sagesse: 0, intelligence: 0, charisme: 0 };
    const scores = {
      attack: 0,
      defense: 0,
      save: 0,
      hitPoints: 0,
      energyPoints: 0,
      combatBonus: null,
      combatBonusPoints: { attack: 0, defense: 0, save: 0 },
    } as const;
    const energyFor = (advantageIds: string[]) =>
      service.recalculateOtherScores(attributes, 0, scores, [], advantageIds).energyPoints;

    expect(energyFor([])).toBe(5);
    expect(energyFor(['reserves-d-energie'])).toBe(15);
    expect(energyFor(['reserves-d-energie', 'reserves-d-energie'])).toBe(20);
    expect(energyFor(['reserves-d-energie', 'reserves-d-energie', 'reserves-d-energie'])).toBe(25);
  });
});
