import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
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
  protected readonly form = new FormGroup({
    firstName: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    lastName: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    description: new FormControl('', { nonNullable: true }),
    origin: new FormControl<CharacterOrigin>('human', { nonNullable: true }),
  });

  protected save(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    const { firstName, lastName, description, origin } = this.form.getRawValue();
    const character = this.characterService.add(firstName.trim(), lastName.trim(), description.trim(), origin);
    this.router.navigate(['/characters', character.id, 'characteristics']);
  }
}