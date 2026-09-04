import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CharacterSkill } from '../character.model';
import { CharacterService } from '../character.service';
import { Skill } from '../../skill/skill.model';
import { SkillService } from '../../skill/skill.service';
import { EquipmentService } from '../../equipment/equipment.service';

@Component({
  imports: [ReactiveFormsModule, RouterLink],
  selector: 'app-character-skills-add',
  templateUrl: './character-skills-add.html',
  styleUrl: './character-skills-add.scss',
})
export class CharacterSkillsAddPage {
  private readonly characterService = inject(CharacterService);
  private readonly skillService = inject(SkillService);
  private readonly equipmentService = inject(EquipmentService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  protected readonly characterId = this.route.snapshot.paramMap.get('id');
  protected readonly character = this.characterId ? this.characterService.findById(this.characterId) : undefined;
  protected readonly skills = this.skillService.skillList;
  protected selectedNewSkill: string | undefined;
  protected readonly selectedDegreeSkills = new Set<string>();
  protected readonly attributes = [
    { key: 'force', label: 'Force' }, { key: 'dexterite', label: 'Dextérité' },
    { key: 'constitution', label: 'Constitution' }, { key: 'sagesse', label: 'Sagesse' },
    { key: 'intelligence', label: 'Intelligence' }, { key: 'charisme', label: 'Charisme' },
  ] as const;
  protected readonly skillForm = new FormGroup({
    label: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    attributeOne: new FormControl<'force' | 'dexterite' | 'constitution' | 'sagesse' | 'intelligence' | 'charisme'>('force', { nonNullable: true }),
    attributeTwo: new FormControl<'force' | 'dexterite' | 'constitution' | 'sagesse' | 'intelligence' | 'charisme'>('force', { nonNullable: true }),
  });

  protected get maximumDegrees(): number { return 4 + (this.character?.attributes.intelligence ?? 0); }

  protected isKnown(id: string): boolean { return this.character?.skills.some((skill) => skill.skillId === id) ?? false; }

  protected isDegreeSelected(id: string): boolean { return this.selectedDegreeSkills.has(id); }

  protected isNewSelected(id: string): boolean { return this.selectedNewSkill === id; }

  protected selectSkill(skill: Skill): void {
    if (this.isKnown(skill.id)) {
      this.toggleDegree(skill.id);
      return;
    }
    this.selectedNewSkill = this.isNewSelected(skill.id) ? undefined : skill.id;
  }

  protected toggleDegree(id: string): void {
    if (this.selectedDegreeSkills.has(id)) this.selectedDegreeSkills.delete(id);
    else if (this.selectedDegreeSkills.size < this.maximumDegrees) this.selectedDegreeSkills.add(id);
  }

  protected addCustomSkill(): void {
    if (this.skillForm.invalid) return;
    const value = this.skillForm.getRawValue();
    this.skillService.add(value.label.trim(), value.attributeOne, value.attributeTwo);
    this.skillForm.controls.label.reset();
  }

  protected getBonus(skill: Skill): number {
    const attributes = this.character?.attributes;
    const equipmentIds = this.character?.equipment.filter((item) => item.equipped).map((item) => item.equipmentId) ?? [];
    return attributes ? attributes[skill.attributeOne] + attributes[skill.attributeTwo] + this.equipmentService.skillBonus(skill.id, equipmentIds) : 0;
  }

  protected save(): void {
    if (!this.characterId || !this.selectedNewSkill || this.selectedDegreeSkills.size !== this.maximumDegrees) return;
    const selectedSkills: CharacterSkill[] = (this.character?.skills ?? []).map((skill) => ({
      skillId: skill.skillId,
      degree: skill.degree + (this.selectedDegreeSkills.has(skill.skillId) ? 1 : 0),
    }));
    selectedSkills.push({ skillId: this.selectedNewSkill, degree: 1 });
    this.characterService.setSkills(this.characterId, selectedSkills);
    // on redirige vers la liste des personnages après l'ajout de l'avantage
    this.router.navigate(['/characters']);
  }
}
