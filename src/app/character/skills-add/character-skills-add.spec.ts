import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { Character } from '../character.model';
import { CharacterService } from '../character.service';
import { EquipmentService } from '../../equipment/equipment.service';
import { Skill } from '../../skill/skill.model';
import { SkillService } from '../../skill/skill.service';
import { CharacterSkillsAddPage } from './character-skills-add';

describe('CharacterSkillsAddPage', () => {
  const knownSkills = Array.from({ length: 8 }, (_, index) => ({
    skillId: `known-${index + 1}`,
    degree: 1,
  }));
  let testCharacter: Character;
  const skillList = [
    ...knownSkills.map(({ skillId }) => ({ id: skillId, label: skillId, attributeOne: 'force', attributeTwo: 'force' })),
    { id: 'known-max', label: 'known-max', attributeOne: 'force', attributeTwo: 'force' },
    { id: 'new-1', label: 'new-1', attributeOne: 'force', attributeTwo: 'force' },
    { id: 'new-2', label: 'new-2', attributeOne: 'force', attributeTwo: 'force' },
  ] as Skill[];
  const setSkills = vi.fn();
  const navigate = vi.fn();
  let page: CharacterSkillsAddPage;

  beforeEach(() => {
    testCharacter = {
      id: 'character-1',
      firstName: 'Test',
      lastName: 'Hero',
      description: '',
      origin: 'human',
      level: 3,
      experience: 300,
      attributes: {
        force: 0,
        dexterite: 0,
        constitution: 0,
        sagesse: 0,
        intelligence: 1,
        charisme: 0,
      },
      skills: [...knownSkills, { skillId: 'known-max', degree: 4 }],
      equipment: [],
      advantages: [],
      flaws: [],
      money: { gold: 0, silver: 0, copper: 0 },
      otherScores: {
        attack: 0,
        defense: 0,
        save: 0,
        hitPoints: 0,
        energyPoints: 0,
        combatBonus: null,
        combatBonusPoints: { attack: 0, defense: 0, save: 0 },
      },
      history: [],
    };
    setSkills.mockClear();
    navigate.mockClear();
    TestBed.configureTestingModule({
      imports: [CharacterSkillsAddPage],
      providers: [
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: () => testCharacter.id } } } },
        { provide: Router, useValue: { navigate } },
        { provide: CharacterService, useValue: { findById: () => testCharacter, setSkills } },
        { provide: SkillService, useValue: { skillList: signal(skillList), add: vi.fn() } },
        { provide: EquipmentService, useValue: { skillBonus: () => 0 } },
      ],
    });
    const fixture = TestBed.createComponent(CharacterSkillsAddPage);
    page = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('allows several increases on one skill but respects the level and total-degree limits', () => {
    const internalPage = page as unknown as {
      canIncreaseDegree(id: string): boolean;
      addDegree(id: string): void;
      removeDegree(id: string): void;
      selectedDegreeSkills: Map<string, number>;
      maximumDegrees: number;
      maximumSkillDegree: number;
      allocatedDegrees: number;
    };

    expect(internalPage.maximumDegrees).toBe(5);
    expect(internalPage.maximumSkillDegree).toBe(testCharacter.level + 1);
    expect(internalPage.canIncreaseDegree('known-max')).toBe(false);
    internalPage.addDegree('known-max');
    expect(internalPage.selectedDegreeSkills.has('known-max')).toBe(false);

    internalPage.addDegree('known-1');
    internalPage.addDegree('known-1');
    internalPage.addDegree('known-1');
    expect(internalPage.selectedDegreeSkills.get('known-1')).toBe(3);
    expect(internalPage.canIncreaseDegree('known-1')).toBe(false);

    internalPage.addDegree('known-2');
    internalPage.addDegree('known-3');
    expect(internalPage.allocatedDegrees).toBe(5);
    internalPage.addDegree('known-4');
    expect(internalPage.allocatedDegrees).toBe(5);

    internalPage.removeDegree('known-1');
    expect(internalPage.selectedDegreeSkills.get('known-1')).toBe(2);
  });

  it('allocates the required degrees and only one new skill without exceeding the level cap', () => {
    const internalPage = page as unknown as {
      addDegree(id: string): void;
      selectNewSkill(skill: Skill): void;
      save(): void;
    };

    internalPage.addDegree('known-1');
    internalPage.addDegree('known-1');
    internalPage.addDegree('known-2');
    internalPage.addDegree('known-3');
    internalPage.addDegree('known-4');
    internalPage.selectNewSkill(skillList.find((skill) => skill.id === 'new-1')!);
    internalPage.selectNewSkill(skillList.find((skill) => skill.id === 'new-2')!);
    internalPage.save();

    expect(setSkills).toHaveBeenCalledOnce();
    const savedSkills = setSkills.mock.calls[0][1] as Character['skills'];
    expect(savedSkills.find((skill) => skill.skillId === 'known-1')?.degree).toBe(3);
    expect(savedSkills.find((skill) => skill.skillId === 'new-1')).toBeUndefined();
    expect(savedSkills.find((skill) => skill.skillId === 'new-2')?.degree).toBe(1);
    expect(savedSkills.every((skill) => skill.degree <= testCharacter.level + 1)).toBe(true);
    expect(navigate).toHaveBeenCalledOnce();
  });

  it('allows saving the level-up without selecting a new skill', () => {
    const internalPage = page as unknown as {
      addDegree(id: string): void;
      save(): void;
    };

    internalPage.addDegree('known-1');
    internalPage.addDegree('known-1');
    internalPage.addDegree('known-2');
    internalPage.addDegree('known-3');
    internalPage.addDegree('known-4');
    internalPage.save();

    expect(setSkills).toHaveBeenCalledOnce();
    const savedSkills = setSkills.mock.calls[0][1] as Character['skills'];
    expect(savedSkills.find((skill) => skill.skillId === 'known-1')?.degree).toBe(3);
    expect(savedSkills.some((skill) => skill.skillId.startsWith('new-'))).toBe(false);
    expect(navigate).toHaveBeenCalledOnce();
  });

  it('allows a level-one character to improve eight known skills during progression', () => {
    testCharacter.level = 1;
    testCharacter.attributes.intelligence = 4;
    testCharacter.skills = knownSkills.map(({ skillId }) => ({ skillId, degree: 1 }));

    const internalPage = page as unknown as {
      addDegree(id: string): void;
      allocatedDegrees: number;
      maximumDegrees: number;
      maximumSkillDegree: number;
      save(): void;
    };

    knownSkills.forEach(({ skillId }) => internalPage.addDegree(skillId));
    expect(internalPage.maximumSkillDegree).toBe(2);
    expect(internalPage.allocatedDegrees).toBe(8);
    expect(internalPage.maximumDegrees).toBe(8);
    internalPage.save();

    expect(setSkills).toHaveBeenCalledOnce();
    const savedSkills = setSkills.mock.calls[0][1] as Character['skills'];
    expect(savedSkills).toHaveLength(8);
    expect(savedSkills.every((skill) => skill.degree === 2)).toBe(true);
    expect(navigate).toHaveBeenCalledOnce();
  });
});