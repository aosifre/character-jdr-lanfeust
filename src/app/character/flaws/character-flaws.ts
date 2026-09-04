import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CharacterFlaw } from '../character.model';
import { CharacterService } from '../character.service';
import { FlawService } from '../../flaw/flaw.service';

@Component({ imports: [ReactiveFormsModule, RouterLink], selector: 'app-character-flaws', templateUrl: './character-flaws.html', styleUrl: './character-flaws.scss' })
export class CharacterFlawsPage {
  private readonly characterService = inject(CharacterService);
  private readonly flawService = inject(FlawService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  protected readonly characterId = this.route.snapshot.paramMap.get('id');
  protected readonly character = this.characterId ? this.characterService.findById(this.characterId) : undefined;
  protected readonly flaws = this.flawService.flawList;
  protected readonly selected = new Set(this.character?.flaws.map((flaw) => flaw.flawId) ?? []);
  protected readonly flawForm = new FormGroup({
    title: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    description: new FormControl('', { nonNullable: true }),
  });
  protected modalOpen = false;

  protected isSelected(id: string): boolean { return this.selected.has(id); }
  protected toggle(id: string): void { if (this.selected.has(id)) this.selected.delete(id); else this.selected.add(id); }
  protected openModal(): void { this.modalOpen = true; }
  protected closeModal(): void { this.modalOpen = false; }
  protected addCustomFlaw(): void {
    if (this.flawForm.invalid) return;
    const value = this.flawForm.getRawValue();
    this.flawService.add(value.title.trim(), value.description.trim());
    this.flawForm.reset({ title: '', description: '' });
    this.closeModal();
  }
  protected save(): void {
    if (!this.characterId) return;
    const selectedFlaws: CharacterFlaw[] = [...this.selected].map((flawId) => ({ flawId }));
    this.characterService.setFlaws(this.characterId, selectedFlaws);
    this.router.navigate(['/characters']);
  }
}
