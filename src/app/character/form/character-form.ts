import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CharacterService } from '../character.service';

@Component({
  imports: [ReactiveFormsModule, RouterLink],
  selector: 'app-character-form',
  templateUrl: './character-form.html',
  styleUrl: './character-form.scss',
})
export class CharacterForm {
  private readonly characterService = inject(CharacterService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  protected readonly characterId = this.route.snapshot.paramMap.get('id');
  protected readonly isEditing = this.characterId !== null;
  protected readonly form = new FormGroup({
    firstName: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    lastName: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
  });

  constructor() {
    if (this.characterId) {
      const character = this.characterService.findById(this.characterId);
      if (character) this.form.setValue({ firstName: character.firstName, lastName: character.lastName });
    }
  }

  protected save(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    const { firstName, lastName } = this.form.getRawValue();
    if (this.characterId) this.characterService.update(this.characterId, firstName.trim(), lastName.trim());
    else this.characterService.add(firstName.trim(), lastName.trim());
    this.router.navigate(['/characters']);
  }
}