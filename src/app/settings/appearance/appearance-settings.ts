import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FontStyle, SettingsService } from '../settings.service';

@Component({
  imports: [RouterLink],
  selector: 'app-appearance-settings',
  templateUrl: './appearance-settings.html',
  styleUrl: './appearance-settings.scss',
})
export class AppearanceSettings {
  private readonly settingsService = inject(SettingsService);
  protected readonly fontStyle = this.settingsService.currentSettings().fontStyle;

  protected updateFontStyle(event: Event): void {
    const fontStyle = (event.target as HTMLSelectElement).value as FontStyle;
    this.settingsService.update({ ...this.settingsService.currentSettings(), fontStyle });
  }
}
