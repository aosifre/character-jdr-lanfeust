import { Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CharacterEquipment } from '../character.model';
import { CharacterService } from '../character.service';
import { Equipment, EquipmentType } from '../../equipment/equipment.model';
import { EquipmentService } from '../../equipment/equipment.service';

@Component({
  imports: [RouterLink, ReactiveFormsModule],
  selector: 'app-character-equipment',
  templateUrl: './character-equipment.html',
  styleUrl: './character-equipment.scss',
})
export class CharacterEquipmentPage {
  private readonly characterService = inject(CharacterService);
  private readonly equipmentService = inject(EquipmentService);
  private readonly route = inject(ActivatedRoute);
  protected readonly characterId = this.route.snapshot.paramMap.get('id');
  protected readonly character = this.characterId ? this.characterService.findById(this.characterId) : undefined;
  protected readonly equipment = this.equipmentService.equipmentList;
  protected readonly cart = new Set(this.character?.equipment.filter((item) => item.equipped).map((item) => item.equipmentId) ?? []);
  protected modalOpen = false;
  protected readonly types: { key: EquipmentType; label: string }[] = [
    { key: 'weapon', label: 'Armes' }, { key: 'shield', label: 'Boucliers' },
    { key: 'armor', label: 'Armures' }, { key: 'other', label: 'Autres équipements' },
  ];
  protected readonly categories = [1, 2, 3] as const;
  protected readonly form = new FormGroup({
    label: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    type: new FormControl<EquipmentType>('weapon', { nonNullable: true }),
    category: new FormControl<'1' | '2' | '3' | 'none'>('1', { nonNullable: true }),
    attackBonus: new FormControl(0, { nonNullable: true }),
    defenseBonus: new FormControl(0, { nonNullable: true }),
    damageReduction: new FormControl(0, { nonNullable: true }),
    skillBonus: new FormControl('', { nonNullable: true }),
  });

  protected isEquipped(id: string): boolean {
    return this.cart.has(id);
  }

  protected filteredEquipment(type: EquipmentType, category: number | null): Equipment[] {
    return this.equipment().filter((item) => item.type === type && item.category === category);
  }

  protected equippedCount(type: EquipmentType): number {
    return this.equipment().filter((item) => item.type === type && this.isEquipped(item.id)).length;
  }

  protected toggle(item: Equipment): void {
    if (this.cart.has(item.id)) this.cart.delete(item.id);
    else this.cart.add(item.id);
  }

  protected openModal(): void { this.modalOpen = true; }
  protected closeModal(): void { this.modalOpen = false; }

  protected addEquipment(): void {
    if (this.form.invalid) return;
    const value = this.form.getRawValue();
    const item = this.equipmentService.add(value.label.trim(), value.type, value.category === 'none' ? null : Number(value.category) as 1 | 2 | 3, value.attackBonus, value.defenseBonus, value.damageReduction, this.parseSkillBonus(value.skillBonus));
    this.cart.add(item.id);
    this.form.reset({ label: '', type: 'weapon', category: '1', attackBonus: 0, defenseBonus: 0, damageReduction: 0, skillBonus: '' });
    this.closeModal();
  }

  protected save(): void {
    if (!this.characterId) return;
    const equipment: CharacterEquipment[] = [...this.cart].map((equipmentId) => ({ equipmentId, equipped: true }));
    this.characterService.setEquipment(this.characterId, equipment);
  }

  protected parseSkillBonus(value: string): Record<string, number> {
    return Object.fromEntries(value.split(',').map((entry) => entry.trim().split(':')).filter(([skillId, bonus]) => skillId && Number(bonus)).map(([skillId, bonus]) => [skillId, Number(bonus)]));
  }

  protected typeLabel(type: EquipmentType): string {
    return { weapon: 'Arme', shield: 'Bouclier', armor: 'Armure', other: 'Autre' }[type];
  }

  protected description(item: Equipment): string {
    if (item.type === 'weapon') return `Catégorie ${item.category} · ${item.category}D6 + FOR`;
    if (item.type === 'shield') return `Catégorie ${item.category} · +${item.defenseBonus} DEF`;
    if (item.type === 'armor') return `Catégorie ${item.category} · -${item.damageReduction} dégâts`;
    return 'Équipement utilisable';
  }

  protected combatDescription(item: Equipment): string {
    const bonuses = [];
    if (item.attackBonus) bonuses.push(`+${item.attackBonus} ATT`);
    if (item.defenseBonus) bonuses.push(`+${item.defenseBonus} DEF`);
    if (item.damageReduction) bonuses.push(`-${item.damageReduction} dégâts`);
    return bonuses.join(' · ');
  }

  protected skillBonusDescription(item: Equipment): string {
    return Object.entries(item.skillBonuses).map(([skillId, bonus]) => `+${bonus} ${skillId}`).join(' · ');
  }

  protected get combatBonuses(): { attack: number; defense: number; damageReduction: number } {
    return this.equipment().filter((item) => this.isEquipped(item.id)).reduce((total, item) => ({
      attack: total.attack + item.attackBonus,
      defense: total.defense + item.defenseBonus,
      damageReduction: total.damageReduction + item.damageReduction,
    }), { attack: 0, defense: 0, damageReduction: 0 });
  }
}