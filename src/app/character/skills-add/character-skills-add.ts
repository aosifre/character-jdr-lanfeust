import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CharacterSkill } from '../character.model';
import { CharacterService } from '../character.service';
import { Skill } from '../../skill/skill.model';
import { SkillService } from '../../skill/skill.service';
import { EquipmentService } from '../../equipment/equipment.service';
import { AdvantageService } from '../../advantage/advantage.service';

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
  private readonly advantageService = inject(AdvantageService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  protected readonly characterId = this.route.snapshot.paramMap.get('id');
  protected readonly character = this.characterId ? this.characterService.findById(this.characterId) : undefined;
  protected readonly skills = this.skillService.skillList;
  protected selectedNewSkill: string | undefined;
  protected readonly selectedDegreeSkills = new Map<string, number>();
  protected readonly attributes = [
    { key: 'force', label: 'Force' }, { key: 'dexterite', label: 'Dextérité' },
    { key: 'constitution', label: 'Constitution' }, { key: 'sagesse', label: 'Sagesse' },
    { key: 'intelligence', label: 'Intelligence' }, { key: 'charisme', label: 'Charisme' },
  ] as const;
  protected get maximumSkillDegree(): number { return (this.character?.level ?? 0) + 1; }
  protected readonly skillForm = new FormGroup({
    label: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    attributeOne: new FormControl<'force' | 'dexterite' | 'constitution' | 'sagesse' | 'intelligence' | 'charisme'>('force', { nonNullable: true }),
    attributeTwo: new FormControl<'force' | 'dexterite' | 'constitution' | 'sagesse' | 'intelligence' | 'charisme'>('force', { nonNullable: true }),
  });

  protected get maximumDegrees(): number {
    const selectedAdvantages = this.character?.advantages.map((item) => item.advantageId) ?? [];
    const attributes = this.character
      ? this.advantageService.effectiveAttributes(this.character.attributes, selectedAdvantages)
      : undefined;
    return 4 + (attributes?.intelligence ?? 0);
  }

  protected get allocatedDegrees(): number {
    return [...this.selectedDegreeSkills.values()].reduce((total, degree) => total + degree, 0);
  }

  protected isKnown(id: string): boolean { return this.character?.skills.some((skill) => skill.skillId === id) ?? false; }

  protected canIncreaseDegree(id: string): boolean {
    const skill = this.character?.skills.find((knownSkill) => knownSkill.skillId === id);
    return !!skill
      && skill.degree + (this.selectedDegreeSkills.get(id) ?? 0) < this.maximumSkillDegree
      && this.allocatedDegrees < this.maximumDegrees;
  }

  protected selectedDegreeCount(id: string): number { return this.selectedDegreeSkills.get(id) ?? 0; }

  protected isNewSelected(id: string): boolean { return this.selectedNewSkill === id; }

  protected selectNewSkill(skill: Skill): void {
    if (this.isKnown(skill.id) || this.maximumSkillDegree < 1) return;
    this.selectedNewSkill = this.isNewSelected(skill.id) ? undefined : skill.id;
  }

  protected addDegree(id: string): void {
    if (!this.canIncreaseDegree(id)) return;
    this.selectedDegreeSkills.set(id, this.selectedDegreeCount(id) + 1);
  }

  protected removeDegree(id: string): void {
    const selectedCount = this.selectedDegreeCount(id);
    if (selectedCount <= 1) this.selectedDegreeSkills.delete(id);
    else this.selectedDegreeSkills.set(id, selectedCount - 1);
  }

  protected addCustomSkill(): void {
    if (this.skillForm.invalid) return;
    const value = this.skillForm.getRawValue();
    this.skillService.add(value.label.trim(), value.attributeOne, value.attributeTwo);
    this.skillForm.controls.label.reset();
  }

  protected getBonus(skill: Skill): number {
    const selectedAdvantages = this.character?.advantages.map((item) => item.advantageId) ?? [];
    const attributes = this.character
      ? this.advantageService.effectiveAttributes(this.character.attributes, selectedAdvantages)
      : undefined;
    const equipmentIds = this.character?.equipment.filter((item) => item.equipped).map((item) => item.equipmentId) ?? [];
    return attributes
      ? attributes[skill.attributeOne] + attributes[skill.attributeTwo] + this.equipmentService.skillBonus(skill.id, equipmentIds) + this.advantageService.skillBonus(selectedAdvantages, skill.id)
      : 0;
  }

  protected save(): void {
    if (
      !this.characterId
      || this.maximumSkillDegree < 1
      || this.allocatedDegrees !== this.maximumDegrees
      || [...this.selectedDegreeSkills].some(([skillId, degree]) => {
        const currentDegree = this.character?.skills.find((skill) => skill.skillId === skillId)?.degree ?? 0;
        return currentDegree + degree > this.maximumSkillDegree;
      })
    ) return;
    const selectedSkills: CharacterSkill[] = (this.character?.skills ?? []).map((skill) => ({
      skillId: skill.skillId,
      degree: skill.degree + this.selectedDegreeCount(skill.skillId),
    }));
    if (this.selectedNewSkill) {
      selectedSkills.push({ skillId: this.selectedNewSkill, degree: 1 });
    }
    this.characterService.setSkills(this.characterId, selectedSkills);
    // on redirige vers la liste des personnages après l'ajout de l'avantage
    this.router.navigate(['/characters']);
  }
}
