import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SettingsService } from './settings.service';

@Component({
  imports: [RouterLink],
  selector: 'app-settings-page',
  templateUrl: './settings-page.html',
  styleUrl: './settings-page.scss',
})
export class SettingsPage {
  private readonly settingsService = inject(SettingsService);
  protected importError = false;

  protected exportSettings(): void { const blob = new Blob([JSON.stringify(this.settingsService.currentSettings(), null, 2)], { type: 'application/json' }); const url = URL.createObjectURL(blob); const link = document.createElement('a'); link.href = url; link.download = 'parametres-lanfeust.json'; link.click(); URL.revokeObjectURL(url); }
  protected importSettings(event: Event): void { const input = event.target as HTMLInputElement; const file = input.files?.[0]; if (!file) return; const reader = new FileReader(); reader.onload = () => { try { this.importError = !this.settingsService.importSettings(JSON.parse(String(reader.result))); } catch { this.importError = true; } input.value = ''; }; reader.readAsText(file); }
}
