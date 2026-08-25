import { Component, input } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  imports: [RouterLink, RouterLinkActive],
  selector: 'app-character-edit-tabs',
  templateUrl: './character-edit-tabs.html',
  styleUrl: './character-edit-tabs.scss',
})
export class CharacterEditTabs {
  readonly characterId = input.required<string>();
}