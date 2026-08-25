import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CharacterSkill } from '../character.model';
import { CharacterService } from '../character.service';
import { Skill } from '../../skill/skill.model';
import { SkillService } from '../../skill/skill.service';

@Component({
  imports: [ReactiveFormsModule, RouterLink],
  selector: 'app-character-skills',
  templateUrl: './character-skills.html',
  styleUrl: './character-skills.scss',
})
export class CharacterSkillsPage {
  private readonly characterService = inject(CharacterService);
  private readonly skillService = inject(SkillService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  protected readonly characterId = this.route.snapshot.paramMap.get('id');
  protected readonly character = this.characterId ? this.characterService.findById(this.characterId) : undefined;
  protected readonly skills = this.skillService.skillList;
  protected readonly selected = new Set(this.character?.skills.map((skill) => skill.skillId) ?? []);
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

  protected get maximum(): number { return 4 + (this.character?.attributes.intelligence ?? 0); }
  protected isSelected(id: string): boolean { return this.selected.has(id); }
  protected toggle(skill: Skill): void {
    if (this.selected.has(skill.id)) this.selected.delete(skill.id);
    else if (this.selected.size < this.maximum) this.selected.add(skill.id);
  }
  protected addCustomSkill(): void {
    if (this.skillForm.invalid) return;
    const value = this.skillForm.getRawValue();
    this.skillService.add(value.label.trim(), value.attributeOne, value.attributeTwo);
    this.skillForm.controls.label.reset();
  }
  protected getBonus(skill: Skill): number {
    const attributes = this.character?.attributes;
    return attributes ? attributes[skill.attributeOne] + attributes[skill.attributeTwo] : 0;
  }
  protected save(): void {
    if (!this.characterId || this.selected.size !== this.maximum) return;
    const selectedSkills: CharacterSkill[] = [...this.selected].map((skillId) => ({ skillId, degree: 1 }));
    this.characterService.setSkills(this.characterId, selectedSkills);
    this.router.navigate(['/characters']);
  }
}
