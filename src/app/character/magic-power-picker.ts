import { Component, OnInit, input, output, signal } from '@angular/core';
import { MAGIC_CONDITIONS, MAGIC_POWER_LEVELS, MAGIC_POWERS, MagicPowerChoice, MagicPowerLevel, NumberedMagicOption } from './magic-power.model';

@Component({
  selector: 'app-magic-power-picker',
  templateUrl: './magic-power-picker.html',
  styleUrl: './magic-power-picker.scss',
})
export class MagicPowerPicker implements OnInit {
  readonly initialChoice = input<MagicPowerChoice | undefined>();
  readonly choiceSelected = output<MagicPowerChoice>();
  readonly closed = output<void>();

  protected readonly levels = MAGIC_POWER_LEVELS;
  protected readonly powerLevel = signal<MagicPowerLevel>('commun');
  protected readonly powerNumber = signal<number | null>(null);
  protected readonly conditionNumber = signal<number | null>(null);
  protected readonly customPowers = signal<(NumberedMagicOption & { level: MagicPowerLevel })[]>([]);
  protected readonly customConditions = signal<NumberedMagicOption[]>([]);
  protected readonly creatingPower = signal(false);
  protected readonly creatingCondition = signal(false);
  protected readonly customPowerNumber = signal('');
  protected readonly customPowerLabel = signal('');
  protected readonly customConditionNumber = signal('');
  protected readonly customConditionLabel = signal('');
  protected readonly randomError = signal('');
  protected readonly rollResult = signal('');

  ngOnInit(): void {
    const choice = this.initialChoice();
    if (!choice) return;
    this.powerLevel.set(choice.level);
    this.customPowers.set([{ ...choice.power, level: choice.level }]);
    this.customConditions.set([choice.condition]);
    this.powerNumber.set(choice.power.number);
    this.conditionNumber.set(choice.condition.number);
  }

  protected powersForLevel(): NumberedMagicOption[] {
    const customPowers = this.customPowers().filter((power) => power.level === this.powerLevel());
    const customNumbers = new Set(customPowers.map((power) => power.number));
    return [...MAGIC_POWERS[this.powerLevel()].filter((power) => !customNumbers.has(power.number)), ...customPowers];
  }

  protected conditions(): NumberedMagicOption[] {
    const customNumbers = new Set(this.customConditions().map((condition) => condition.number));
    return [...MAGIC_CONDITIONS.filter((condition) => !customNumbers.has(condition.number)), ...this.customConditions()];
  }

  protected changeLevel(event: Event): void {
    const level = (event.target as HTMLSelectElement).value as MagicPowerLevel;
    this.powerLevel.set(level);
    this.powerNumber.set(null);
    this.randomError.set('');
    this.rollResult.set('');
  }

  protected setPowerNumber(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    this.powerNumber.set(value === '' ? null : Number(value));
    this.randomError.set('');
  }

  protected setConditionNumber(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    this.conditionNumber.set(value === '' ? null : Number(value));
    this.randomError.set('');
  }

  protected createPower(): void {
    const number = this.parseCustomNumber(this.customPowerNumber());
    const label = this.customPowerLabel().trim();
    if (number === null || !label) return;
    const power = { number, label, level: this.powerLevel() };
    this.customPowers.update((powers) => [...powers.filter((item) => !(item.number === number && item.level === power.level)), power]);
    this.powerNumber.set(number);
    this.customPowerNumber.set('');
    this.customPowerLabel.set('');
    this.creatingPower.set(false);
  }

  protected createCondition(): void {
    const number = this.parseCustomNumber(this.customConditionNumber());
    const label = this.customConditionLabel().trim();
    if (number === null || !label) return;
    const condition = { number, label };
    this.customConditions.update((conditions) => [...conditions.filter((item) => item.number !== number), condition]);
    this.conditionNumber.set(number);
    this.customConditionNumber.set('');
    this.customConditionLabel.set('');
    this.creatingCondition.set(false);
  }

  protected rollRandom(): void {
    this.powerNumber.set(null);
    this.conditionNumber.set(null);
    const powerRoll = this.rollTwoDiceAsNumber();
    const conditionRoll = this.rollTwoDiceAsNumber();
    const power = this.powersForLevel().find((item) => item.number === powerRoll);
    const condition = this.conditions().find((item) => item.number === conditionRoll);
    this.rollResult.set(`Pouvoir : ${powerRoll} · Condition : ${conditionRoll}`);
    this.randomError.set(!power || !condition
      ? `Aucune entrée correspondante dans les tables pour ${!power && !condition ? 'le pouvoir et la condition' : !power ? 'le pouvoir' : 'la condition'}.`
      : '');
    if (power) this.powerNumber.set(power.number);
    if (condition) this.conditionNumber.set(condition.number);
  }

  protected get canConfirm(): boolean {
    return this.selectedPower() !== undefined && this.selectedCondition() !== undefined;
  }

  protected confirm(): void {
    const power = this.selectedPower();
    const condition = this.selectedCondition();
    if (!power || !condition) return;
    this.choiceSelected.emit({ level: this.powerLevel(), power, condition });
  }

  protected selectedPower(): NumberedMagicOption | undefined {
    return this.powersForLevel().find((item) => item.number === this.powerNumber());
  }

  protected selectedCondition(): NumberedMagicOption | undefined {
    return this.conditions().find((item) => item.number === this.conditionNumber());
  }

  protected setCustomValue(field: 'powerNumber' | 'powerLabel' | 'conditionNumber' | 'conditionLabel', event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    if (field === 'powerNumber') this.customPowerNumber.set(value);
    if (field === 'powerLabel') this.customPowerLabel.set(value);
    if (field === 'conditionNumber') this.customConditionNumber.set(value);
    if (field === 'conditionLabel') this.customConditionLabel.set(value);
  }

  protected get canCreatePower(): boolean { return this.parseCustomNumber(this.customPowerNumber()) !== null && !!this.customPowerLabel().trim(); }
  protected get canCreateCondition(): boolean { return this.parseCustomNumber(this.customConditionNumber()) !== null && !!this.customConditionLabel().trim(); }

  private rollTwoDiceAsNumber(): number {
    const firstDie = Math.floor(Math.random() * 6) + 1;
    const secondDie = Math.floor(Math.random() * 6) + 1;
    return firstDie * 10 + secondDie;
  }

  private parseCustomNumber(value: string): number | null {
    if (!/^\d{1,2}$/.test(value)) return null;
    const number = Number(value);
    return Number.isInteger(number) ? number : null;
  }
}