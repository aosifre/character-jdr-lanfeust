import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AdvantageService } from '../advantage.service';
import { AdvantageCategory } from '../advantage.model';
import { AttributeKey } from '../../skill/skill.model';

@Component({
  imports: [ReactiveFormsModule, RouterLink],
  selector: 'app-advantage-list',
  templateUrl: './advantage-list.html',
  styleUrl: './advantage-list.scss',
})
export class AdvantageList {
  private readonly service = inject(AdvantageService);
  protected readonly advantages = this.service.advantageList;
  protected readonly attributes: { key: AttributeKey; label: string }[] = [
    { key: 'force', label: 'Force' }, { key: 'dexterite', label: 'Dextérité' }, { key: 'constitution', label: 'Constitution' },
    { key: 'sagesse', label: 'Sagesse' }, { key: 'intelligence', label: 'Intelligence' }, { key: 'charisme', label: 'Charisme' },
  ];
  protected readonly categories: { key: AdvantageCategory; label: string }[] = [
    { key: 'combat', label: 'Atouts de combat' }, { key: 'origin', label: "Atouts d'origine" },
    { key: 'magic', label: 'Atouts magiques' }, { key: 'social', label: 'Atouts sociaux' }, { key: 'heroic', label: 'Atouts héroïques' },
  ];
  protected readonly form = new FormGroup({
    title: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    category: new FormControl<AdvantageCategory>('heroic', { nonNullable: true }),
    description: new FormControl('', { nonNullable: true }),
    conditionAttribute: new FormControl<AttributeKey | null>(null, { nonNullable: true }),
    conditionMinimum: new FormControl<number | null>(null, { nonNullable: true }),
    prerequisiteId: new FormControl<string | null>(null, { nonNullable: true }),
  });
  protected importError = false;
  protected modalOpen = false;

  protected add(): void {
    if (this.form.invalid) return;
    const value = this.form.getRawValue();
    this.service.add(value.title.trim(), value.category, value.description.trim(), value.conditionAttribute, value.conditionMinimum, value.prerequisiteId);
    this.form.reset({ title: '', category: 'heroic', description: '', conditionAttribute: null, conditionMinimum: null, prerequisiteId: null });
    this.modalOpen = false;
  }

  protected openModal(): void { this.modalOpen = true; }
  protected closeModal(): void { this.modalOpen = false; }

  protected remove(id: string): void { this.service.remove(id); }
  protected categoryLabel(category: AdvantageCategory): string {
    return this.categories.find((item) => item.key === category)?.label ?? category;
  }

  protected export(): void {
    const blob = new Blob([JSON.stringify(this.advantages(), null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'atouts-lanfeust-de-troy.json';
    link.click();
    URL.revokeObjectURL(url);
  }

  protected import(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try { this.importError = !this.service.importAdvantages(JSON.parse(String(reader.result))); }
      catch { this.importError = true; }
      input.value = '';
    };
    reader.readAsText(file);
  }
}
