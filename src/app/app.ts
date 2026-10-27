import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SettingsService } from './settings/settings.service';

@Component({
  imports: [RouterOutlet],
  selector: 'app-root',
  styleUrl: './app.scss',
  templateUrl: './app.html',
})
export class App {
  private readonly settingsService = inject(SettingsService);
}
