import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter, Router } from '@angular/router';
import { Character } from '../character.model';
import { CharacterService } from '../character.service';
import { CharacterLevelUpResultPage } from './character-level-up-result';

describe('CharacterLevelUpResultPage', () => {
  let character: Character;
  let fixture: ReturnType<typeof TestBed.createComponent<CharacterLevelUpResultPage>>;
  let page: CharacterLevelUpResultPage;
  let router: Router;

  beforeEach(() => {
    character = {
      id: 'hero-1',
      firstName: 'Test',
      lastName: 'Hero',
      description: '',
      origin: 'human',
      level: 4,
      experience: 400,
      attributes: { force: 0, dexterite: 0, constitution: 0, sagesse: 0, intelligence: 0, charisme: 0 },
      otherScores: {
        attack: 0, defense: 0, save: 0, hitPoints: 0, energyPoints: 0, combatBonus: null,
        combatBonusPoints: { attack: 0, defense: 0, save: 0 },
      },
      money: { gold: 0, silver: 0, copper: 0 },
      skills: [],
      advantages: [],
      flaws: [],
      equipment: [],
    };

    TestBed.configureTestingModule({
      imports: [CharacterLevelUpResultPage],
      providers: [
        provideRouter([]),
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: () => character.id } } } },
        { provide: CharacterService, useValue: { findById: () => character, addCombatBonusPoints: vi.fn() } },
      ],
    });

    fixture = TestBed.createComponent(CharacterLevelUpResultPage);
    page = fixture.componentInstance;
    router = TestBed.inject(Router);
    vi.spyOn(router, 'navigate');
    fixture.detectChanges();
  });

  it('only offers characteristic improvement at level 1 and every fifth level', () => {
    const internalPage = page as unknown as {
      optionsLevelUp: { value: string }[];
    };
    const hasCharacteristicOption = () =>
      internalPage.optionsLevelUp.some((option) => option.value === 'characteristics');

    expect(hasCharacteristicOption()).toBe(false);
    character.level = 1;
    expect(hasCharacteristicOption()).toBe(true);
    character.level = 5;
    expect(hasCharacteristicOption()).toBe(true);
    character.level = 10;
    expect(hasCharacteristicOption()).toBe(true);
    character.level = 11;
    expect(hasCharacteristicOption()).toBe(false);
  });

  it('does not navigate to characteristic improvement at other levels', () => {
    const internalPage = page as unknown as {
      form: CharacterLevelUpResultPage['form'];
      combatBonusSelectionComplete: boolean;
      save(): void;
    };
    internalPage.form.setValue({ nextLevelChoice: 'characteristics' });
    internalPage.combatBonusSelectionComplete = true;
    internalPage.save();

    expect(router.navigate).not.toHaveBeenCalled();
  });
});
