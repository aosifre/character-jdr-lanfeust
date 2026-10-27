import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { FontStyle, SettingsService } from '../settings.service';

@Component({
  imports: [ReactiveFormsModule, RouterLink],
  selector: 'app-creation-settings',
  templateUrl: './creation-settings.html',
  styleUrl: './creation-settings.scss',
})
export class CreationSettings {
  private readonly settingsService = inject(SettingsService);
  protected readonly form = new FormGroup({
    availableAdvantages: new FormControl(3, { nonNullable: true, validators: [Validators.min(0), Validators.max(99)] }),
    fontStyle: new FormControl<FontStyle>('lanfeust', { nonNullable: true }),
  });

  constructor() {
    const settings = this.settingsService.currentSettings();
    this.form.setValue({
      availableAdvantages: settings.availableAdvantages,
      fontStyle: settings.fontStyle,
    });
  }

  protected save(): void {
    if (this.form.invalid) return;
    this.settingsService.update({ ...this.settingsService.currentSettings(), ...this.form.getRawValue() });
  }
}
