import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { AdvantageService } from '../../advantage/advantage.service';
import { Character } from '../character.model';
import { CharacterService } from '../character.service';
import { SettingsService } from '../../settings/settings.service';
import { CharacterAdvantagesAddPage } from './character-advantages-add';

describe('CharacterAdvantagesAddPage', () => {
  const repeatableAdvantage = {
    id: 'attaque-devastatrice',
    title: 'Attaque dévastatrice',
    category: 'combat' as const,
    description: '',
    conditionAttribute: null,
    conditionMinimum: null,
    prerequisiteId: null,
    minimumLevel: null,
    repeatable: true,
  };
  const specializationAdvantage = {
    id: 'specialisation',
    title: 'Spécialisation',
    category: 'combat' as const,
    description: '',
    conditionAttribute: null,
    conditionMinimum: null,
    prerequisiteId: null,
    minimumLevel: null,
    repeatable: true,
  };
  let character: Character;
  let setAdvantages: ReturnType<typeof vi.fn>;
  let page: CharacterAdvantagesAddPage;

  beforeEach(() => {
    character = {
      id: 'hero-1',
      firstName: 'Test',
      lastName: 'Hero',
      description: '',
      origin: 'human',
      level: 5,
      experience: 500,
      attributes: { force: 0, dexterite: 0, constitution: 0, sagesse: 0, intelligence: 0, charisme: 0 },
      otherScores: {
        attack: 0, defense: 0, save: 0, hitPoints: 0, energyPoints: 0, combatBonus: null,
        combatBonusPoints: { attack: 0, defense: 0, save: 0 },
      },
      money: { gold: 0, silver: 0, copper: 0 },
      skills: [],
      advantages: [{ advantageId: repeatableAdvantage.id }],
      flaws: [],
      equipment: [],
    };
    setAdvantages = vi.fn();

    TestBed.configureTestingModule({
      imports: [CharacterAdvantagesAddPage],
      providers: [
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: () => character.id } } } },
        { provide: Router, useValue: { navigate: vi.fn() } },
        { provide: CharacterService, useValue: { findById: () => character, setAdvantages } },
        { provide: AdvantageService, useValue: { advantageList: signal([repeatableAdvantage, specializationAdvantage]) } },
        { provide: SettingsService, useValue: { currentSettings: signal({ availableAdvantages: 0 }) } },
      ],
    });

    const fixture = TestBed.createComponent(CharacterAdvantagesAddPage);
    page = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('allows selecting a repeatable advantage again during level-up', () => {
    const internalPage = page as unknown as {
      toggle(id: string): void;
      selectedCount(id: string): number;
      selectedTotal: number;
      save(): void;
    };

    internalPage.toggle(repeatableAdvantage.id);

    expect(internalPage.selectedCount(repeatableAdvantage.id)).toBe(2);
    expect(internalPage.selectedTotal).toBe(2);

    internalPage.save();

    expect(setAdvantages).toHaveBeenCalledWith(character.id, [
      { advantageId: repeatableAdvantage.id },
      { advantageId: repeatableAdvantage.id },
    ]);
  });

  it('stores a distinct weapon for each specialization during level-up', () => {
    const internalPage = page as unknown as {
      toggle(id: string): void;
      setSpecializationWeapon(index: number, event: Event): void;
      save(): void;
      canSave: boolean;
      advantageMaximum: number;
    };

    internalPage.advantageMaximum = 3;
    internalPage.toggle(specializationAdvantage.id);
    internalPage.toggle(specializationAdvantage.id);
    internalPage.setSpecializationWeapon(0, { target: { value: 'Épée' } } as unknown as Event);
    internalPage.setSpecializationWeapon(1, { target: { value: 'épée' } } as unknown as Event);

    expect(internalPage.canSave).toBe(false);

    internalPage.setSpecializationWeapon(1, { target: { value: 'Hache' } } as unknown as Event);
    expect(internalPage.canSave).toBe(true);

    internalPage.save();

    expect(setAdvantages).toHaveBeenCalledWith(character.id, [
      { advantageId: repeatableAdvantage.id },
      { advantageId: specializationAdvantage.id, specializationWeapon: 'Épée' },
      { advantageId: specializationAdvantage.id, specializationWeapon: 'Hache' },
    ]);
  });
});
