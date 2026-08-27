import { Component, inject } from "@angular/core";
import { CharacterService } from "../character.service";
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { CommonModule } from "@angular/common";

@Component({
    imports: [ReactiveFormsModule, RouterLink, CommonModule],
    selector: 'app-character-level-up-result',
    templateUrl: './character-level-up-result.html',
    styleUrl: './character-level-up-result.scss',
})
export class CharacterLevelUpResultPage {
    private readonly characterService = inject(CharacterService);
    private readonly route = inject(ActivatedRoute);
    private readonly router = inject(Router);
    protected readonly characterId = this.route.snapshot.paramMap.get('id');
    protected character = this.characterId ? this.characterService.findById(this.characterId) : undefined;
    protected readonly levelUpForm = new FormGroup({
        nextLevelChoice: new FormControl('', { nonNullable: true, validators: [Validators.required] })
    });
    public optionsLevelUp = [
        { value: 'skills', label: 'Apprendre de nouvelles compétences' },
        { value: 'advantages', label: 'Obtenir de nouveaux atouts' },
        { value: 'characteristics', label: 'Améliorer les caractéristiques du personnage' }
    ];
    protected nextLevelAchievement = false;

    constructor() { }

    protected save(): void {
        if (!this.characterId || !this.character) return;

        switch (this.levelUpForm.getRawValue().nextLevelChoice) {
            case 'skills':
                this.router.navigate(['/characters', this.characterId, 'skills']);
                break;
            case 'advantages':
                this.router.navigate(['/characters', this.characterId, 'advantages']);
                break;
            case 'characteristics':
                this.router.navigate(['/characters', this.characterId, 'characteristics']);
                break;
            default:
                break;
        }
    }
}