import { Component, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CharacterService } from '../character.service';

@Component({
  imports: [RouterLink, DatePipe],
  selector: 'app-character-history-page',
  templateUrl: './character-history-page.html',
  styleUrl: './character-history-page.scss',
})
export class CharacterHistoryPage {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly characterService = inject(CharacterService);
  protected readonly characterId = this.route.snapshot.paramMap.get('id');
  protected readonly character = this.characterId ? this.characterService.findById(this.characterId) : undefined;
  protected readonly history = this.character?.history ?? [];
  protected copyError = false;

  protected copySnapshot(snapshotId: string): void {
    if (!this.characterId) return;
    const copy = this.characterService.copyFromSnapshot(this.characterId, snapshotId);
    if (!copy) {
      this.copyError = true;
      return;
    }
    this.router.navigate(['/characters', copy.id]);
  }
}
