import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FontStyle, SettingsService } from './settings.service';
import { CharacterService } from '../character/character.service';
import { SkillService } from '../skill/skill.service';
import { AdvantageService } from '../advantage/advantage.service';
import { FlawService } from '../flaw/flaw.service';

@Component({
  imports: [RouterLink],
  selector: 'app-settings-page',
  templateUrl: './settings-page.html',
  styleUrl: './settings-page.scss',
})
export class SettingsPage {
  private readonly settingsService = inject(SettingsService);
  private readonly characterService = inject(CharacterService);
  private readonly skillService = inject(SkillService);
  private readonly advantageService = inject(AdvantageService);
  private readonly flawService = inject(FlawService);
  protected importError = false;

  protected exportData(): void {
    const settings = this.settingsService.currentSettings();
    const archive = {
      format: 'jdr-lanfeust-archive',
      version: 1,
      exportedAt: new Date().toISOString(),
      characters: this.characterService.characterList(),
      settings,
      fontStyle: settings.fontStyle,
      skills: this.skillService.skillList(),
      advantages: this.advantageService.advantageList(),
      flaws: this.flawService.flawList(),
    };
    const file = new Blob([JSON.stringify(archive, null, 2)], { type: 'application/json' });
    const downloadUrl = URL.createObjectURL(file);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = 'archive-jdr-lanfeust-de-troy.json';
    link.click();
    URL.revokeObjectURL(downloadUrl);
  }

  protected importData(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        this.importError = !this.importArchive(JSON.parse(String(reader.result)) as Record<string, unknown>);
      } catch {
        this.importError = true;
      }
      input.value = '';
    };
    reader.readAsText(file);
  }

  private importArchive(archive: Record<string, unknown>): boolean {
    if (archive['format'] !== 'jdr-lanfeust-archive'
      || archive['version'] !== 1
      || !Array.isArray(archive['characters'])
      || !Array.isArray(archive['skills'])
      || !Array.isArray(archive['advantages'])
      || !Array.isArray(archive['flaws'])
      || typeof archive['settings'] !== 'object'
      || archive['settings'] === null) return false;
    const settings = archive['settings'] as Record<string, unknown>;
    if (archive['fontStyle'] !== settings['fontStyle']) return false;
    return this.characterService.importCharacters(archive['characters'])
      && this.settingsService.importSettings(settings)
      && this.skillService.importSkills(archive['skills'])
      && this.advantageService.importAdvantages(archive['advantages'])
      && this.flawService.import(archive['flaws']);
  }
}
