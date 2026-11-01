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

  it('creates a linked companion and raises its level cap by five per advantage occurrence', () => {
    const hero = service.add('Test', 'Hero', '', 'other');
    expect(hero).toBeDefined();
    if (!hero) return;

    service.setAdvantages(hero.id, [{ advantageId: 'compagnon-animal', animalName: 'Félix' }]);
    let companion = service.companionsFor(hero.id)[0];
    expect(companion).toMatchObject({ firstName: 'Félix', ownerCharacterId: hero.id, animalLevelCap: 5 });
    const companionId = companion.id;

    const cappedProgression = service.setExperience(companion.id, 900);
    expect(cappedProgression).toMatchObject({ level: 5, experience: 500 });

    service.setAdvantages(hero.id, [
      { advantageId: 'compagnon-animal', animalName: 'Félix' },
      { advantageId: 'compagnon-animal', animalName: 'Félix' },
    ]);
    companion = service.companionsFor(hero.id)[0];
    expect(companion.id).toBe(companionId);
    expect(companion).toMatchObject({ animalLevelCap: 10, level: 5, experience: 500 });
    expect(service.setExperience(companion.id, 1200)).toMatchObject({ level: 10, experience: 1000 });
  });

  it('calculates companion scores from its freely assigned attributes and level', () => {
    const hero = service.add('Test', 'Hero', '', 'other');
    expect(hero).toBeDefined();
    if (!hero) return;
    service.setAdvantages(hero.id, [{ advantageId: 'compagnon-animal', animalName: 'Félix' }]);
    const companion = service.companionsFor(hero.id)[0];
    const attributes = { force: 4, dexterite: 3, constitution: 3, sagesse: 2, intelligence: 2, charisme: 1 };

    expect(service.updateCompanionSetup(companion.id, 5, attributes, '1d6+2')).toBe(true);
    expect(service.findById(companion.id)).toMatchObject({
      level: 5,
      experience: 500,
      attributes,
      companionDamage: '1d6+2',
      otherScores: {
        attack: 9,
        defense: 7,
        save: 8,
        hitPoints: 40,
      },
    });
    expect(service.updateCompanionSetup(companion.id, 6, attributes, '')).toBe(false);
    expect(service.updateCompanionSetup(companion.id, 0, attributes, '')).toBe(false);
    expect(service.updateCompanionSetup(companion.id, 5, { ...attributes, force: 1.5 }, '')).toBe(false);

    service.setAttributes(companion.id, { ...attributes, force: 5 });
    expect(service.findById(companion.id)?.otherScores).toMatchObject({
      attack: 10,
      defense: 7,
      save: 8,
      hitPoints: 40,
    });
  });
});
