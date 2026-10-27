import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ColorTheme, FontStyle, SettingsService } from '../settings.service';

@Component({
  imports: [RouterLink],
  selector: 'app-appearance-settings',
  templateUrl: './appearance-settings.html',
  styleUrl: './appearance-settings.scss',
})
export class AppearanceSettings {
  private readonly settingsService = inject(SettingsService);
  protected readonly settings = this.settingsService.currentSettings;

  protected updateFontStyle(event: Event): void {
    const fontStyle = (event.target as HTMLSelectElement).value as FontStyle;
    this.settingsService.update({ ...this.settings(), fontStyle });
  }

  protected updateTheme(event: Event): void {
    const theme = (event.target as HTMLSelectElement).value as ColorTheme;
    this.settingsService.update({ ...this.settings(), theme });
  }
}
