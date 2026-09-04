import { Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CharacterService } from '../character.service';
import { CharacterOrigin } from '../character.model';
import { MAX_PORTRAIT_DATA_URL_LENGTH } from '../character.service';

@Component({
  imports: [ReactiveFormsModule, RouterLink],
  selector: 'app-character-form',
  templateUrl: './character-form.html',
  styleUrl: './character-form.scss',
})
export class CharacterForm {
  private readonly characterService = inject(CharacterService);
  private readonly router = inject(Router);
  protected readonly portrait = signal<string | null>(null);
  protected imageError = '';
  protected imageProcessing = false;
  protected readonly form = new FormGroup({
    firstName: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    lastName: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    description: new FormControl('', { nonNullable: true }),
    origin: new FormControl<CharacterOrigin>('human', { nonNullable: true }),
  });

  protected save(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    if (this.imageProcessing) return;
    const { firstName, lastName, description, origin } = this.form.getRawValue();
    const character = this.characterService.add(firstName.trim(), lastName.trim(), description.trim(), origin, this.portrait() ?? undefined);
    if (!character) {
      this.imageError = 'La mémoire disponible est insuffisante. Supprimez une image ou un personnage avant de réessayer.';
      return;
    }
    this.router.navigate(['/characters', character.id, 'characteristics']);
  }

  protected selectPortrait(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      this.imageError = 'Sélectionnez un fichier image.';
      return;
    }
    this.imageProcessing = true;
    this.imageError = '';
    const reader = new FileReader();
    reader.onload = () => {
      const image = new Image();
      image.onload = () => {
        const size = Math.min(image.naturalWidth, image.naturalHeight);
        const sourceX = (image.naturalWidth - size) / 2;
        const sourceY = (image.naturalHeight - size) / 2;
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 512;
        const context = canvas.getContext('2d');
        if (!context) {
          this.imageError = 'Cette image ne peut pas être traitée.';
        } else {
          context.drawImage(image, sourceX, sourceY, size, size, 0, 0, 512, 512);
          const portrait = canvas.toDataURL('image/jpeg', .78);
          if (portrait.length > MAX_PORTRAIT_DATA_URL_LENGTH) {
            this.imageError = 'Cette image est trop volumineuse après compression. Choisissez une image plus simple.';
          } else {
            this.portrait.set(portrait);
          }
        }
        this.imageProcessing = false;
      };
      image.onerror = () => { this.imageError = 'Cette image ne peut pas être lue.'; this.imageProcessing = false; };
      image.src = String(reader.result);
    };
    reader.onerror = () => { this.imageError = 'Cette image ne peut pas être lue.'; this.imageProcessing = false; };
    reader.readAsDataURL(file);
  }
}