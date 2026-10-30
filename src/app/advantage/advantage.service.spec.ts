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
});
