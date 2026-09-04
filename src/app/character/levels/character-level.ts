import { Component, inject } from "@angular/core";
import { CharacterService } from "../character.service";
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { CommonModule } from "@angular/common";

@Component({
    imports: [ReactiveFormsModule, RouterLink, CommonModule],
    selector: 'app-character-level',
    templateUrl: './character-level.html',
    styleUrl: './character-level.scss',
})
export class CharacterLevelPage {
    private readonly characterService = inject(CharacterService);
    private readonly route = inject(ActivatedRoute);
    private readonly router = inject(Router);
    protected readonly characterId = this.route.snapshot.paramMap.get('id');
    protected character = this.characterId ? this.characterService.findById(this.characterId) : undefined;
    protected readonly form = new FormGroup({
        currentExperience: new FormControl(this.character?.experience.toString() || '', { nonNullable: true, validators: [Validators.required] }),
        winExperience: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    });

    constructor() {
        if (this.character) {
            this.form.setValue({
                currentExperience: this.character.experience.toString(),
                winExperience: '',
            });
        }
    }

    protected save(): void {
        if (!this.characterId || !this.character || this.form.invalid) return;
        
        const experienceTotal = parseInt(this.form.getRawValue().winExperience, 10) + this.character.experience;
        const currentLevel = this.character.level;
        const currentExperience = this.character.experience;

        //  this.characterService.setExperience(this.characterId, 10);
        this.characterService.setExperience(this.characterId, experienceTotal);

        if (experienceTotal > currentExperience && Math.floor(experienceTotal / 100) + 1 > currentLevel) {
            this.router.navigate(['/characters', this.characterId, 'level', 'result']);
        } else {
            this.router.navigate(['/characters', this.characterId]);
        }
    }
}