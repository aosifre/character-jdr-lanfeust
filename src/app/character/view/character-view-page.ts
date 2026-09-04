import { Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CharacterService } from '../character.service';
import { AdvantageService } from '../../advantage/advantage.service';
import { EquipmentService } from '../../equipment/equipment.service';
import { SkillService } from '../../skill/skill.service';
import { SettingsService } from '../../settings/settings.service';
import { Skill } from '../../skill/skill.model';

@Component({
  imports: [RouterLink],
  selector: 'app-character-view-page',
  templateUrl: './character-view-page.html',
  styleUrl: './character-view-page.scss',
})
export class CharacterViewPage {
  private readonly characterService = inject(CharacterService);
  private readonly advantageService = inject(AdvantageService);
  private readonly equipmentService = inject(EquipmentService);
  private readonly skillService = inject(SkillService);
  private readonly settingsService = inject(SettingsService);
  private readonly route = inject(ActivatedRoute);

  protected readonly characterId = this.route.snapshot.paramMap.get('id');
  protected readonly character = this.characterId ? this.characterService.findById(this.characterId) : undefined;
  protected readonly skills = this.skillService.skillList;
  protected readonly advantages = this.advantageService.advantageList;
  protected readonly flaws = this.settingsService.flawList;
  protected readonly equipment = this.equipmentService.equipmentList;
  protected damageTaken = 0;
  protected energySpent = 0;
  protected globalSkillPenalty = 0;
  protected combatPenalty = 0;
  protected readonly skillPenalties: Record<string, number> = {};

  protected get remainingHitPoints(): number {
    return Math.max(0, (this.character?.otherScores.hitPoints ?? 0) - this.numberOrZero(this.damageTaken));
  }

  protected get remainingEnergy(): number {
    return Math.max(0, (this.character?.otherScores.energyPoints ?? 0) - this.numberOrZero(this.energySpent));
  }

  protected getSkill(skillId: string): Skill | undefined {
    return this.skills().find((skill) => skill.id === skillId);
  }

  protected getSkillName(skillId: string): string {
    return this.getSkill(skillId)?.label ?? 'Compétence inconnue';
  }

  protected skillTotal(skillId: string): number {
    const skill = this.getSkill(skillId);
    if (!skill || !this.character) return 0;
    const attributes = this.character.attributes;
    const selected = this.character.skills.find((item) => item.skillId === skillId);
    const equipmentIds = this.character.equipment.filter((item) => item.equipped).map((item) => item.equipmentId);
    return attributes[skill.attributeOne]
      + attributes[skill.attributeTwo]
      + (selected?.degree ?? 0)
      + this.equipmentService.skillBonus(skillId, equipmentIds)
      - this.numberOrZero(this.globalSkillPenalty)
      - this.numberOrZero(this.skillPenalties[skillId]);
  }

  protected equipmentName(equipmentId: string): string {
    return this.equipment().find((item) => item.id === equipmentId)?.label ?? 'Équipement inconnu';
  }

  protected setDamage(value: string): void { this.damageTaken = this.nonNegativeValue(value); }
  protected setEnergySpent(value: string): void { this.energySpent = this.nonNegativeValue(value); }
  protected setGlobalSkillPenalty(value: string): void { this.globalSkillPenalty = this.nonNegativeValue(value); }
  protected setCombatPenalty(value: string): void { this.combatPenalty = this.nonNegativeValue(value); }
  protected setSkillPenalty(skillId: string, value: string): void { this.skillPenalties[skillId] = this.nonNegativeValue(value); }
  protected goToSection(event: Event, sectionId: string): void {
    event.preventDefault();
    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  private nonNegativeValue(value: string): number { return Math.max(0, Number.parseInt(value, 10) || 0); }
  private numberOrZero(value: number | undefined): number { return value !== undefined && Number.isFinite(value) ? value : 0; }
}
