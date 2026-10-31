import { AfterViewInit, Component, HostListener, inject, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CharacterService } from '../character.service';
import { AdvantageService } from '../../advantage/advantage.service';
import { EquipmentService } from '../../equipment/equipment.service';
import { SkillService } from '../../skill/skill.service';
import { FlawService } from '../../flaw/flaw.service';
import { Skill } from '../../skill/skill.model';
import { equipmentIcon, Equipment } from '../../equipment/equipment.model';
import { CharacterMoney, CharacterRecipe } from '../character.model';
import { MagicPowerChoice } from '../magic-power.model';
import { CharacterAttributes } from '../character.model';
import { AdvantageDescriptionPipe } from '../../advantage/advantage-description.pipe';
import { MAJOR_ENCHANTMENTS } from '../major-enchantment.model';

@Component({
  imports: [RouterLink, DecimalPipe, AdvantageDescriptionPipe],
  selector: 'app-character-view-page',
  templateUrl: './character-view-page.html',
  styleUrl: './character-view-page.scss',
})
export class CharacterViewPage implements AfterViewInit {
  private readonly characterService = inject(CharacterService);
  private readonly advantageService = inject(AdvantageService);
  private readonly equipmentService = inject(EquipmentService);
  private readonly skillService = inject(SkillService);
  private readonly flawService = inject(FlawService);
  private readonly route = inject(ActivatedRoute);

  protected readonly characterId = this.route.snapshot.paramMap.get('id');
  protected readonly character = this.characterId ? this.characterService.findById(this.characterId) : undefined;
  protected readonly skills = this.skillService.skillList;
  protected readonly advantages = this.advantageService.advantageList;
  protected readonly flaws = this.flawService.flawList;
  protected readonly equipment = this.equipmentService.equipmentList;
  protected readonly majorEnchantments = MAJOR_ENCHANTMENTS;
  protected readonly activeSection = signal('attributes');
  protected damageTaken = 0;
  protected energySpent = 0;
  protected globalSkillPenalty = 0;
  protected combatPenalty = 0;
  protected readonly skillPenalties: Record<string, number> = {};

  ngAfterViewInit(): void {
    this.updateActiveSection();
  }

  @HostListener('window:scroll')
  protected onWindowScroll(): void {
    this.updateActiveSection();
  }

  protected get remainingHitPoints(): number {
    return Math.max(0, (this.character?.otherScores.hitPoints ?? 0) - this.numberOrZero(this.damageTaken));
  }

  protected get remainingEnergy(): number {
    return Math.max(0, (this.character?.otherScores.energyPoints ?? 0) - this.numberOrZero(this.energySpent));
  }

  protected get hasSageOfEckmul(): boolean {
    return this.character?.advantages.some((item) => item.advantageId === 'sage-d-eckmul') ?? false;
  }

  protected get effectiveAttributes(): CharacterAttributes | undefined {
    if (!this.character) return undefined;
    return this.advantageService.effectiveAttributes(
      this.character.attributes,
      this.character.advantages.map((item) => item.advantageId),
    );
  }

  protected getSkill(skillId: string): Skill | undefined {
    return this.skills().find((skill) => skill.id === skillId);
  }

  protected getSkillName(skillId: string): string {
    const skill = this.getSkill(skillId);
    if (!skill) return 'Compétence inconnue';
    const region = this.regionalRegion;
    return this.regionalSkillBonus(skill) > 0
      ? `${skill.label} (+4 dans ${region ? `la région « ${region} »` : 'la région'})`
      : skill.label;
  }

  protected get regionalRegion(): string | undefined {
    return this.character?.advantages.find((item) => item.advantageId === 'turf-attitre')?.chosenRegion?.trim() || undefined;
  }

  protected regionalSkillBonus(skill: Skill): number {
    return this.advantageService.contextualSkillBonus(
      this.character?.advantages.map((item) => item.advantageId) ?? [],
      skill.id,
      skill.label,
    );
  }

  protected skillTotal(skillId: string): number {
    const skill = this.getSkill(skillId);
    if (!skill || !this.character) return 0;
    const attributes = this.advantageService.effectiveAttributes(
      this.character.attributes,
      this.character.advantages.map((item) => item.advantageId),
    );
    const selected = this.character.skills.find((item) => item.skillId === skillId);
    const equipmentIds = this.character.equipment.filter((item) => item.equipped).map((item) => item.equipmentId);
    return attributes[skill.attributeOne]
      + attributes[skill.attributeTwo]
      + (selected?.degree ?? 0)
      + this.equipmentService.skillBonus(skillId, equipmentIds)
      + this.advantageService.skillBonus(this.character.advantages.map((item) => item.advantageId), skillId)
      + this.regionalSkillBonus(skill)
      - this.numberOrZero(this.globalSkillPenalty)
      - this.numberOrZero(this.skillPenalties[skillId]);
  }

  protected equipmentName(equipmentId: string): string {
    return this.equipment().find((item) => item.id === equipmentId)?.label ?? 'Équipement inconnu';
  }

  protected equipmentIcon(equipment: Equipment): string { return equipmentIcon(equipment); }

  protected equipmentQuantity(equipmentId: string): number {
    return this.character?.equipment.find((item) => item.equipmentId === equipmentId)?.quantity ?? 1;
  }

  protected isEquipped(equipmentId: string): boolean {
    return this.character?.equipment.some((item) => item.equipmentId === equipmentId && item.equipped) ?? false;
  }

  protected typeLabel(type: Equipment['type']): string {
    return { weapon: 'Arme', shield: 'Bouclier', armor: 'Armure', other: 'Autre' }[type];
  }

  protected get equippedItems(): Equipment[] {
    const equippedIds = new Set(this.character?.equipment.filter((item) => item.equipped).map((item) => item.equipmentId) ?? []);
    return this.equipment().filter((item) => equippedIds.has(item.id));
  }

  protected get equippedWeapons(): Equipment[] { return this.equippedItems.filter((item) => item.type === 'weapon'); }
  protected get equippedArmor(): Equipment[] { return this.equippedItems.filter((item) => item.type === 'armor'); }
  protected get equippedShields(): Equipment[] { return this.equippedItems.filter((item) => item.type === 'shield'); }
  protected get ownedItems(): Equipment[] {
    return this.character?.equipment
      .map((item) => this.equipment().find((equipment) => equipment.id === item.equipmentId))
      .filter((item): item is Equipment => item !== undefined) ?? [];
  }

  protected get selectedAdvantageSummaries(): { id: string; title: string; description: string; benefits: { title: string; description: string }[]; drawbacks: { title: string; description: string }[]; count: number; weapons: string; region?: string; deity?: { name: string; circumstances: string; helpingHand: string }; recipes: CharacterRecipe[]; magicPowerChoice?: MagicPowerChoice }[] {
    const selections = new Map<string, { count: number; weapons: string[]; region?: string; deity?: { name: string; circumstances: string; helpingHand: string }; recipes: CharacterRecipe[]; magicPowerChoice?: MagicPowerChoice }>();
    for (const selected of this.character?.advantages ?? []) {
      const summary = selections.get(selected.advantageId) ?? { count: 0, weapons: [], recipes: [] };
      summary.count++;
      const weapon = selected.chosenWeapon ?? selected.specializationWeapon;
      if (weapon) summary.weapons.push(weapon);
      if (selected.chosenRegion) summary.region = selected.chosenRegion;
      if (selected.chosenDeity) summary.deity = selected.chosenDeity;
      if (selected.recipes) summary.recipes.push(...selected.recipes);
      if (selected.magicPowerChoice) summary.magicPowerChoice = selected.magicPowerChoice;
      selections.set(selected.advantageId, summary);
    }
    return [...selections].flatMap(([id, summary]) => {
      const advantage = this.advantages().find((item) => item.id === id);
      return advantage
        ? [{ id, title: advantage.title, description: advantage.description || 'Aucune description.', benefits: advantage.benefits ?? [], drawbacks: advantage.drawbacks ?? [], count: summary.count, weapons: summary.weapons.join(', '), region: summary.region, deity: summary.deity, recipes: summary.recipes, magicPowerChoice: summary.magicPowerChoice }]
        : [];
    });
  }

  protected get naturalArmorReduction(): number {
    return this.advantageService.damageReduction(
      this.character?.advantages.map((item) => item.advantageId) ?? [],
    );
  }

  protected get carriedWeight(): number {
    return this.ownedItems.reduce((total, item) => total + this.equipmentService.weight(item) * this.equipmentQuantity(item.id), 0);
  }

  protected get carryingCapacity(): number { return 10 + 10 * (this.effectiveAttributes?.force ?? 0); }
  protected get encumbrancePercentage(): number { return Math.min(100, this.carryingCapacity ? this.carriedWeight / this.carryingCapacity * 100 : 0); }

  protected damageDice(item: Equipment): string { return item.category ? `${item.category}D6` : 'Non applicable'; }

  protected isWeaponWeighted(equipmentId: string): boolean {
    return this.character?.equipment.some((item) => item.equipmentId === equipmentId && item.weighted) ?? false;
  }

  protected damageBonus(item: Equipment): number {
    return (this.effectiveAttributes?.force ?? 0) + (this.isWeaponWeighted(item.id) ? 2 : 0);
  }

  protected setDamage(value: string): void { this.damageTaken = this.nonNegativeValue(value); }
  protected setEnergySpent(value: string): void { this.energySpent = this.nonNegativeValue(value); }
  protected setGlobalSkillPenalty(value: string): void { this.globalSkillPenalty = this.nonNegativeValue(value); }
  protected setCombatPenalty(value: string): void { this.combatPenalty = this.nonNegativeValue(value); }
  protected setSkillPenalty(skillId: string, value: string): void { this.skillPenalties[skillId] = this.nonNegativeValue(value); }
  protected setMoney(coin: keyof CharacterMoney, value: string): void {
    if (!this.character) return;
    this.character.money[coin] = this.nonNegativeValue(value);
    this.characterService.setMoney(this.character.id, { ...this.character.money });
  }
  protected goToSection(event: Event, sectionId: string): void {
    event.preventDefault();
    this.activeSection.set(sectionId);
    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  private updateActiveSection(): void {
    if (typeof window === 'undefined') return;

    const navigation = document.querySelector<HTMLElement>('.section-nav');
    if (!navigation) return;

    const activationLine = navigation.getBoundingClientRect().bottom + 16;
    const sectionIds = ['attributes', 'scores', 'skills', 'advantages', 'flaws', 'equipment', 'encumbrance'];
    this.activeSection.set(sectionIds.reduce((activeId, sectionId) => {
      const section = document.getElementById(sectionId);
      return section && section.getBoundingClientRect().top <= activationLine ? sectionId : activeId;
    }, sectionIds[0]));
  }

  private nonNegativeValue(value: string): number { return Math.max(0, Number.parseInt(value, 10) || 0); }
  private numberOrZero(value: number | undefined): number { return value !== undefined && Number.isFinite(value) ? value : 0; }
}
