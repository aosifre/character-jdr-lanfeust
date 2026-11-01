import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { AdvantageService } from '../../advantage/advantage.service';
import { EquipmentService } from '../../equipment/equipment.service';
import { SkillService } from '../../skill/skill.service';
import { Character } from '../character.model';
import { CharacterService } from '../character.service';
import { CharacterSkillsPage } from './character-skills';

describe('CharacterSkillsPage', () => {
  it('allows a companion to select more skills than the hero creation limit', () => {
    const character: Character = {
      id: 'animal-1',
      firstName: 'Félix',
      lastName: '',
      description: '',
      origin: 'other',
      level: 2,
      experience: 200,
      attributes: { force: 0, dexterite: 0, constitution: 0, sagesse: 0, intelligence: 0, charisme: 0 },
      otherScores: {
        attack: 0,
        defense: 0,
        save: 0,
        hitPoints: 0,
        energyPoints: 0,
        combatBonus: null,
        combatBonusPoints: { attack: 0, defense: 0, save: 0 },
      },
      money: { gold: 0, silver: 0, copper: 0 },
      skills: [],
      advantages: [],
      flaws: [],
      equipment: [],
      ownerCharacterId: 'hero-1',
      animalLevelCap: 5,
    };
    const skills = Array.from({ length: 6 }, (_, index) => ({
      id: `skill-${index}`,
      label: `Compétence ${index}`,
      attributeOne: 'force' as const,
      attributeTwo: 'dexterite' as const,
    }));
    const setSkills = vi.fn();
    const navigate = vi.fn();

    TestBed.configureTestingModule({
      imports: [CharacterSkillsPage],
      providers: [
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: () => character.id } } } },
        { provide: Router, useValue: { navigate } },
        { provide: CharacterService, useValue: { findById: () => character, setSkills } },
        { provide: SkillService, useValue: { skillList: signal(skills) } },
        { provide: EquipmentService, useValue: { skillBonus: () => 0 } },
        { provide: AdvantageService, useValue: {
          effectiveAttributes: (attributes: Character['attributes']) => attributes,
          skillBonus: () => 0,
        } },
      ],
    });

    const fixture = TestBed.createComponent(CharacterSkillsPage);
    fixture.detectChanges();
    const page = fixture.componentInstance as unknown as {
      toggle(skill: (typeof skills)[number]): void;
      save(): void;
    };
    skills.forEach((skill) => page.toggle(skill));
    page.save();

    expect(setSkills).toHaveBeenCalledWith(character.id, skills.map((skill) => ({ skillId: skill.id, degree: 1 })));
    expect(navigate).toHaveBeenCalledWith(['/characters', character.id, 'companion-setup'], { queryParams: { step: 4 } });
  });
});
