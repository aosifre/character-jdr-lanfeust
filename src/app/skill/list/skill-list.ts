import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AttributeKey } from '../skill.model';
import { SkillService } from '../skill.service';

@Component({
  imports: [ReactiveFormsModule, RouterLink],
  selector: 'app-skill-list',
  templateUrl: './skill-list.html',
  styleUrl: './skill-list.scss',
})
export class SkillList {
  private readonly service = inject(SkillService);
  protected readonly skills = this.service.skillList;
  protected readonly attributes: { key: AttributeKey; label: string }[] = [
    { key: 'force', label: 'Force' }, { key: 'dexterite', label: 'Dextérité' }, { key: 'constitution', label: 'Constitution' },
    { key: 'sagesse', label: 'Sagesse' }, { key: 'intelligence', label: 'Intelligence' }, { key: 'charisme', label: 'Charisme' },
  ];
  protected readonly form = new FormGroup({ label: new FormControl('', { nonNullable: true, validators: [Validators.required] }), attributeOne: new FormControl<AttributeKey>('force', { nonNullable: true }), attributeTwo: new FormControl<AttributeKey>('force', { nonNullable: true }) });
  protected importError = false;
  protected add(): void { if (this.form.invalid) return; const value = this.form.getRawValue(); this.service.add(value.label.trim(), value.attributeOne, value.attributeTwo); this.form.controls.label.reset(); }
  protected remove(id: string): void { this.service.remove(id); }
  protected export(): void { const blob = new Blob([JSON.stringify(this.skills(), null, 2)], { type: 'application/json' }); const url = URL.createObjectURL(blob); const link = document.createElement('a'); link.href = url; link.download = 'competences-lanfeust-de-troy.json'; link.click(); URL.revokeObjectURL(url); }
  protected import(event: Event): void { const input = event.target as HTMLInputElement; const file = input.files?.[0]; if (!file) return; const reader = new FileReader(); reader.onload = () => { try { this.importError = !this.service.importSkills(JSON.parse(String(reader.result))); } catch { this.importError = true; } input.value = ''; }; reader.readAsText(file); }
}
