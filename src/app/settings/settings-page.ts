import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SettingsService } from './settings.service';
import { FlawService } from '../flaw/flaw.service';

@Component({
  imports: [RouterLink],
  selector: 'app-settings-page',
  templateUrl: './settings-page.html',
  styleUrl: './settings-page.scss',
})
export class SettingsPage {
  private readonly settingsService = inject(SettingsService);
  private readonly flawService = inject(FlawService);
  protected readonly flaws = this.flawService.flawList;
  protected importError = false;

  protected exportSettings(): void { const data = { settings: this.settingsService.currentSettings(), flaws: this.flaws() }; const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }); const url = URL.createObjectURL(blob); const link = document.createElement('a'); link.href = url; link.download = 'parametres-lanfeust.json'; link.click(); URL.revokeObjectURL(url); }
  protected importSettings(event: Event): void { const input = event.target as HTMLInputElement; const file = input.files?.[0]; if (!file) return; const reader = new FileReader(); reader.onload = () => { try { const data = JSON.parse(String(reader.result)); const importedSettings = this.settingsService.importSettings(data); const importedFlaws = typeof data === 'object' && data !== null && 'flaws' in data ? this.flawService.import((data as { flaws?: unknown }).flaws) : true; this.importError = !importedSettings || !importedFlaws; } catch { this.importError = true; } input.value = ''; }; reader.readAsText(file); }
}
