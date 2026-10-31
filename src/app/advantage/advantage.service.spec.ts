import { PLATFORM_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { AdvantageService } from './advantage.service';

describe('AdvantageService', () => {
  let service: AdvantageService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [{ provide: PLATFORM_ID, useValue: 'server' }],
    });
    service = TestBed.inject(AdvantageService);
  });

  it('applies the Gnome attribute bonuses and keeps Force at least -1', () => {
    const attributes = {
      force: 0,
      dexterite: 1,
      constitution: 0,
      sagesse: 0,
      intelligence: 0,
      charisme: 1,
    };

    expect(service.effectiveAttributes(attributes, ['gnome-de-troy'])).toEqual({
      ...attributes,
      force: -1,
      dexterite: 2,
      charisme: 2,
    });
    expect(service.effectiveAttributes({ ...attributes, force: -3 }, ['gnome-de-troy']).force).toBe(-1);
    expect(service.effectiveAttributes(attributes, []).force).toBe(0);
  });

  it('applies the Gnome Bluff bonus only when selected', () => {
    expect(service.skillBonus(['gnome-de-troy'], 'bluff')).toBe(4);
    expect(service.skillBonus([], 'bluff')).toBe(0);
  });

  it('applies the Dwarf defense bonus only when selected', () => {
    expect(service.combatScoreBonus(['nain'], 'defense')).toBe(2);
    expect(service.combatScoreBonus([], 'defense')).toBe(0);
    expect(service.combatScoreBonus(['nain'], 'attack')).toBe(0);
  });

  it('provides the Troll natural armor and water drawback', () => {
    const troll = service.advantageList().find((advantage) => advantage.id === 'troll');

    expect(troll?.benefits?.map(({ title }) => title)).toEqual(['Cuir épais', 'Armes de brutasse']);
    expect(troll?.drawbacks?.[0].title).toBe('Peur de l’eau');
    expect(service.damageReduction(['troll'])).toBe(4);
    expect(service.damageReduction([])).toBe(0);
  });

  it('grants Turf attitré contextual bonuses to regional skills', () => {
    const selected = ['turf-attitre'];

    expect(service.contextualSkillBonus(selected, 'renseignement', 'Renseignement')).toBe(4);
    expect(service.contextualSkillBonus(selected, 'custom-knowledge', 'Connaissances')).toBe(4);
    expect(service.contextualSkillBonus(selected, 'diplomatie', 'Diplomatie')).toBe(4);
    expect(service.contextualSkillBonus(selected, 'survie', 'Survie')).toBe(4);
    expect(service.contextualSkillBonus([], 'renseignement', 'Renseignement')).toBe(0);
    expect(service.contextualSkillBonus(selected, 'bluff', 'Bluff')).toBe(0);
  });

  it('limits Longue durée to three occurrences, including imported catalogs without the new limit', () => {
    const imported = {
      id: 'longue-duree',
      title: 'Longue durée',
      category: 'magic',
      description: '',
      conditionAttribute: null,
      conditionMinimum: null,
      prerequisiteId: null,
      repeatable: true,
    };

    expect(service.advantageList().find((advantage) => advantage.id === 'longue-duree')?.maxRepeatable).toBe(3);
    expect(service.importAdvantages([imported])).toBe(true);
    expect(service.advantageList()[0].maxRepeatable).toBe(3);
  });

  it('adds 10 energy points for the first Réserves d’énergie and 5 for each additional one', () => {
    const reserves = service.advantageList().find((advantage) => advantage.id === 'reserves-d-energie');

    expect(reserves?.repeatable).toBe(true);
    expect(reserves?.energyPointsBonus).toBe(10);
    expect(reserves?.additionalEnergyPointsBonus).toBe(5);
    expect(service.energyPointsBonus([])).toBe(0);
    expect(service.energyPointsBonus(['reserves-d-energie'])).toBe(10);
    expect(service.energyPointsBonus(['reserves-d-energie', 'reserves-d-energie'])).toBe(15);
    expect(service.energyPointsBonus(['reserves-d-energie', 'reserves-d-energie', 'reserves-d-energie'])).toBe(20);
  });

  it('calculates the Sage d’Eckmül emission radius with Wisdom and the Zone étendue level bonus', () => {
    const wisdom = { force: 0, dexterite: 0, constitution: 0, sagesse: 3, intelligence: 0, charisme: 0 };
    const sageAdvantages = ['sage-d-eckmul'];

    expect(service.emissionSurface([], wisdom, 5)).toBeUndefined();
    expect(service.emissionSurface(sageAdvantages, wisdom, 5)).toBe(13);
    expect(service.emissionSurface([...sageAdvantages, 'zone-etendue'], wisdom, 5)).toBe(18);

    const sage = service.advantageList().find((advantage) => advantage.id === 'sage-d-eckmul');
    const zone = service.advantageList().find((advantage) => advantage.id === 'zone-etendue');
    expect(sage?.emissionSurfaceBase).toBe(10);
    expect(sage?.emissionSurfaceAttribute).toBe('sagesse');
    expect(zone?.emissionSurfaceLevelBonus).toBe(true);
  });
});
