import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { FlawService } from '../flaw.service';

@Component({ imports: [ReactiveFormsModule, RouterLink], selector: 'app-flaw-list', templateUrl: './flaw-list.html', styleUrl: './flaw-list.scss' })
export class FlawList {
  private readonly service = inject(FlawService);
  protected readonly flaws = this.service.flawList;
  protected readonly form = new FormGroup({ title: new FormControl('', { nonNullable: true, validators: [Validators.required] }), description: new FormControl('', { nonNullable: true }) });
  protected importError = false;
  protected add(): void { if (this.form.invalid) return; const value = this.form.getRawValue(); this.service.add(value.title.trim(), value.description.trim()); this.form.reset({ title: '', description: '' }); }
  protected remove(id: string): void { this.service.remove(id); }
  protected export(): void { const blob = new Blob([JSON.stringify(this.flaws(), null, 2)], { type: 'application/json' }); const url = URL.createObjectURL(blob); const link = document.createElement('a'); link.href = url; link.download = 'travers-lanfeust-de-troy.json'; link.click(); URL.revokeObjectURL(url); }
  protected import(event: Event): void { const input = event.target as HTMLInputElement; const file = input.files?.[0]; if (!file) return; const reader = new FileReader(); reader.onload = () => { try { this.importError = !this.service.import(JSON.parse(String(reader.result))); } catch { this.importError = true; } input.value = ''; }; reader.readAsText(file); }
}