import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { AdvantageService } from '../../advantage/advantage.service';
import { Character } from '../character.model';
import { CharacterService } from '../character.service';
import { SettingsService } from '../../settings/settings.service';
import { SkillService } from '../../skill/skill.service';
import { CharacterAdvantagesAddPage } from './character-advantages-add';
import { CharacterAdvantagesPage } from '../advantages/character-advantages';

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
  const weaponChoiceAdvantage = {
    id: 'surspecialisation',
    title: 'Surspécialisation',
    category: 'combat' as const,
    description: '',
    conditionAttribute: null,
    conditionMinimum: null,
    prerequisiteId: null,
    minimumLevel: null,
    repeatable: true,
    weaponChoice: true,
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
    weaponChoice: true,
  };
  const souardAdvantage = {
    id: 'bon-sens-souard',
    title: 'Bon sens souard',
    category: 'origin' as const,
    description: '',
    conditionAttribute: null,
    conditionMinimum: null,
    conditionOrigin: 'souardie' as const,
    prerequisiteId: null,
    minimumLevel: null,
  };
  const deityChoiceAdvantage = {
    id: 'chouchou-d-un-dieu',
    title: "Chouchou d'un dieu",
    category: 'origin' as const,
    description: '',
    conditionAttribute: null,
    conditionMinimum: null,
    prerequisiteId: null,
    minimumLevel: null,
    repeatable: false,
    deityChoice: true,
  };
  const shamanAdvantage = {
    id: 'chaman',
    title: 'Chaman',
    category: 'origin' as const,
    description: '',
    conditionAttribute: null,
    conditionMinimum: null,
    conditionOrigin: 'region-primitive-reculee' as const,
    conditionSkillId: 'metier-alchimiste',
    conditionSkillMinimum: 5,
    prerequisiteId: null,
    excludedAdvantageIds: ['pouvoir-magique', 'sage-d-eckmul'],
    recipeChoice: true,
    recipeCount: 2,
  };
  const newRecipeAdvantage = {
    id: 'nouvelle-recette',
    title: 'Nouvelle recette',
    category: 'origin' as const,
    description: '',
    conditionAttribute: null,
    conditionMinimum: null,
    prerequisiteId: 'chaman',
    minimumLevel: 1,
    repeatable: true,
    recipeChoice: true,
    recipeCount: 1,
    evolutionOnly: true,
  };
  const magicPowerAdvantage = {
    id: 'pouvoir-magique',
    title: 'Pouvoir magique',
    category: 'origin' as const,
    description: '',
    conditionAttribute: null,
    conditionMinimum: null,
    prerequisiteId: null,
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
      origin: 'darshan',
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
      imports: [CharacterAdvantagesAddPage, CharacterAdvantagesPage],
      providers: [
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: () => character.id } } } },
        { provide: Router, useValue: { navigate: vi.fn() } },
        { provide: CharacterService, useValue: { findById: () => character, setAdvantages } },
        { provide: AdvantageService, useValue: {
          advantageList: signal([repeatableAdvantage, specializationAdvantage, weaponChoiceAdvantage, souardAdvantage, deityChoiceAdvantage, shamanAdvantage, newRecipeAdvantage, magicPowerAdvantage]),
          effectiveAttributes: (attributes: Character['attributes']) => attributes,
          skillBonus: () => 0,
        } },
        { provide: SkillService, useValue: { skillList: signal([{ id: 'metier-alchimiste', label: 'Alchimie', attributeOne: 'intelligence', attributeTwo: 'sagesse' }]) } },
        { provide: SettingsService, useValue: { currentSettings: signal({ availableAdvantages: 2 }) } },
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
      setWeaponChoice(id: string, index: number, event: Event): void;
      save(): void;
      canSave: boolean;
      advantageMaximum: number;
    };

    internalPage.advantageMaximum = 3;
    internalPage.toggle(specializationAdvantage.id);
    internalPage.toggle(specializationAdvantage.id);
    internalPage.setWeaponChoice(specializationAdvantage.id, 0, { target: { value: 'Épée' } } as unknown as Event);
    internalPage.setWeaponChoice(specializationAdvantage.id, 1, { target: { value: 'épée' } } as unknown as Event);

    expect(internalPage.canSave).toBe(false);

    internalPage.setWeaponChoice(specializationAdvantage.id, 1, { target: { value: 'Hache' } } as unknown as Event);
    expect(internalPage.canSave).toBe(true);

    internalPage.save();

    expect(setAdvantages).toHaveBeenCalledWith(character.id, [
      { advantageId: repeatableAdvantage.id },
      { advantageId: specializationAdvantage.id, chosenWeapon: 'Épée' },
      { advantageId: specializationAdvantage.id, chosenWeapon: 'Hache' },
    ]);
  });

  it('uses the weapon choice attribute for other advantages', () => {
    const internalPage = page as unknown as {
      toggle(id: string): void;
      setWeaponChoice(id: string, index: number, event: Event): void;
      save(): void;
      canSave: boolean;
      advantageMaximum: number;
    };
    internalPage.advantageMaximum = 2;
    internalPage.toggle(weaponChoiceAdvantage.id);

    expect(internalPage.canSave).toBe(false);

    internalPage.setWeaponChoice(weaponChoiceAdvantage.id, 0, { target: { value: 'Épée' } } as unknown as Event);
    expect(internalPage.canSave).toBe(true);

    internalPage.save();

    expect(setAdvantages).toHaveBeenCalledWith(character.id, [
      { advantageId: repeatableAdvantage.id },
      { advantageId: weaponChoiceAdvantage.id, chosenWeapon: 'Épée' },
    ]);
  });

  it('only makes the Bon sens souard advantage available to Souardie characters', () => {
    const internalPage = page as unknown as { isAvailable(advantage: typeof souardAdvantage): boolean };

    expect(internalPage.isAvailable(souardAdvantage)).toBe(false);

    character.origin = 'souardie';
    expect(internalPage.isAvailable(souardAdvantage)).toBe(true);
  });

  it('stores the chosen deity and custom details for Chouchou d’un dieu', () => {
    const internalPage = page as unknown as {
      toggle(id: string): void;
      selectedCount(id: string): number;
      isRepeatable(advantage: typeof deityChoiceAdvantage): boolean;
      setDeityChoice(id: string, field: string, event: Event): void;
      canSave: boolean;
      save(): void;
      advantageMaximum: number;
    };
    character.origin = 'darshan';
    internalPage.advantageMaximum = 2;
    internalPage.toggle(deityChoiceAdvantage.id);

    expect(internalPage.isRepeatable(deityChoiceAdvantage)).toBe(false);
    internalPage.setDeityChoice(deityChoiceAdvantage.id, 'selection', { target: { value: 'Autre' } } as unknown as Event);
    internalPage.setDeityChoice(deityChoiceAdvantage.id, 'customName', { target: { value: 'Mon dieu' } } as unknown as Event);
    internalPage.setDeityChoice(deityChoiceAdvantage.id, 'circumstances', { target: { value: 'En cas de danger' } } as unknown as Event);
    internalPage.setDeityChoice(deityChoiceAdvantage.id, 'helpingHand', { target: { value: 'Protège le héros' } } as unknown as Event);

    expect(internalPage.canSave).toBe(true);
    internalPage.save();

    expect(setAdvantages).toHaveBeenCalledWith(character.id, [
      { advantageId: repeatableAdvantage.id },
      {
        advantageId: deityChoiceAdvantage.id,
        chosenDeity: { name: 'Mon dieu', circumstances: 'En cas de danger', helpingHand: 'Protège le héros' },
      },
    ]);
  });

  it('requires Alchemy 5 and blocks Chaman when an excluded advantage is selected', () => {
    const internalPage = page as unknown as {
      isAvailable(advantage: { id: string }): boolean;
      selected: Map<string, number>;
    };
    character.origin = 'region-primitive-reculee';
    character.skills = [{ skillId: 'metier-alchimiste', degree: 4 }];

    expect(internalPage.isAvailable(shamanAdvantage)).toBe(false);

    character.skills = [{ skillId: 'metier-alchimiste', degree: 5 }];
    expect(internalPage.isAvailable(shamanAdvantage)).toBe(true);

    internalPage.selected.set(magicPowerAdvantage.id, 1);
    expect(internalPage.isAvailable(shamanAdvantage)).toBe(false);

    internalPage.selected.clear();
    internalPage.selected.set(shamanAdvantage.id, 1);
    expect(internalPage.isAvailable(magicPowerAdvantage)).toBe(false);
  });

  it('requires a rare ingredient for major Chaman recipes and saves an extra recipe during level-up', () => {
    const internalPage = page as unknown as {
      toggle(id: string): void;
      setRecipeChoice(id: string, index: number, field: string, event: Event): void;
      recipeChoices: Map<string, { ingredients: string; power: string; powerType: string; range: string; duration: string; energyCost: number | null; rareIngredient: string }[]>;
      selected: Map<string, number>;
      advantageMaximum: number;
      canSave: boolean;
      canConfirmRecipeModal: boolean;
      recipeModalAdvantageId: string | null;
      confirmRecipeModal(): void;
      save(): void;
    };
    const recipe = (powerType = 'communs') => ({
      ingredients: 'Herbes',
      power: 'Soin',
      powerType,
      range: 'Toucher',
      duration: 'Instantanée',
      energyCost: 2,
      rareIngredient: '',
    });
    const enterRecipe = (advantageId: string, index: number, values: ReturnType<typeof recipe>) => {
      for (const [field, value] of Object.entries(values)) {
        internalPage.setRecipeChoice(advantageId, index, field, { target: { value: String(value) } } as unknown as Event);
      }
    };

    internalPage.advantageMaximum = 3;
    character.origin = 'region-primitive-reculee';
    character.skills = [{ skillId: 'metier-alchimiste', degree: 5 }];
    internalPage.toggle(shamanAdvantage.id);
    expect(internalPage.recipeModalAdvantageId).toBe(shamanAdvantage.id);
    enterRecipe(shamanAdvantage.id, 0, recipe('majeurs'));
    enterRecipe(shamanAdvantage.id, 1, recipe());
    expect(internalPage.canConfirmRecipeModal).toBe(false);
    internalPage.setRecipeChoice(shamanAdvantage.id, 0, 'rareIngredient', { target: { value: 'Racine rare' } } as unknown as Event);
    expect(internalPage.canConfirmRecipeModal).toBe(true);
    internalPage.confirmRecipeModal();

    internalPage.toggle(newRecipeAdvantage.id);
    expect(internalPage.recipeModalAdvantageId).toBe(newRecipeAdvantage.id);
    enterRecipe(newRecipeAdvantage.id, 0, recipe());
    expect(internalPage.canSave).toBe(false);
    internalPage.confirmRecipeModal();
    expect(internalPage.canSave).toBe(true);

    internalPage.save();

    expect(setAdvantages).toHaveBeenCalledWith(character.id, [
      { advantageId: repeatableAdvantage.id },
      { advantageId: shamanAdvantage.id, recipes: [{ ...recipe('majeurs'), rareIngredient: 'Racine rare' }, recipe()] },
      { advantageId: newRecipeAdvantage.id, recipes: [recipe()] },
    ]);
  });

  it('keeps the extra Chaman recipe unavailable during character creation', () => {
    const creationPage = TestBed.createComponent(CharacterAdvantagesPage).componentInstance as unknown as {
      isAvailable(advantage: typeof newRecipeAdvantage): boolean;
      toggle(id: string): void;
      selected: Map<string, number>;
      recipeModalAdvantageId: string | null;
    };
    creationPage.selected.set(shamanAdvantage.id, 1);

    expect(creationPage.isAvailable(newRecipeAdvantage)).toBe(false);

    creationPage.selected.clear();
    character.origin = 'region-primitive-reculee';
    character.skills = [{ skillId: 'metier-alchimiste', degree: 5 }];
    creationPage.toggle(shamanAdvantage.id);
    expect(creationPage.recipeModalAdvantageId).toBe(shamanAdvantage.id);
  });
});
