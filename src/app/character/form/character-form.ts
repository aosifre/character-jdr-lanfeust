import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CharacterService } from '../character.service';
import { CharacterOrigin } from '../character.model';

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
  protected readonly character = this.characterId ? this.characterService.findById(this.characterId) : undefined;
  protected readonly isEditing = this.characterId !== null;
  protected readonly form = new FormGroup({
    firstName: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    lastName: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    description: new FormControl('', { nonNullable: true }),
    origin: new FormControl<CharacterOrigin>('human', { nonNullable: true }),
  });

  constructor() {
    if (this.characterId) {
      if (this.character) this.form.setValue({
        firstName: this.character.firstName,
        lastName: this.character.lastName,
        description: this.character.description,
        origin: this.character.origin,
      });
    }
  }

  protected save(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    const { firstName, lastName, description, origin } = this.form.getRawValue();
    if (this.characterId) {
      this.characterService.update(this.characterId, firstName.trim(), lastName.trim(), description.trim(), origin);
      this.router.navigate(['/characters']);
    } else {
      const character = this.characterService.add(firstName.trim(), lastName.trim(), description.trim(), origin);
      this.router.navigate(['/characters', character.id, 'characteristics']);
    }
  }
}