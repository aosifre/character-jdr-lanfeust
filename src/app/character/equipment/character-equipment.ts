import { Component, computed, inject, signal } from '@angular/core';
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
  protected readonly character = this.characterId
    ? this.characterService.findById(this.characterId)
    : undefined;
  protected readonly equipment = this.equipmentService.equipmentList;
  protected readonly cart = new Set(this.character?.equipment.map((item) => item.equipmentId) ?? []);
  protected readonly quantities = new Map(this.character?.equipment.map((item) => [item.equipmentId, item.quantity ?? 1]) ?? []);
  protected readonly equipped = new Set(
    this.character?.equipment.filter((item) => item.equipped).map((item) => item.equipmentId) ?? [],
  );
  protected readonly weighted = new Set(
    this.character?.equipment.filter((item) => item.weighted).map((item) => item.equipmentId) ?? [],
  );
  protected modalOpen = false;

  // Signaux pour la recherche et la pagination
  protected searchQuery = signal('');
  protected equipmentFilter = signal<'all' | 'owned' | 'equipped' | 'not-equipped'>('all');
  private readonly cartVersion = signal(0);
  protected currentPage = signal(1);
  protected readonly pageSize = 10;

  protected readonly form = new FormGroup({
    label: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    type: new FormControl<EquipmentType>('weapon', { nonNullable: true }),
    category: new FormControl<'1' | '2' | '3' | 'none'>('1', { nonNullable: true }),
    attackBonus: new FormControl(0, { nonNullable: true }),
    defenseBonus: new FormControl(0, { nonNullable: true }),
    damageReduction: new FormControl(0, { nonNullable: true }),
    skillBonus: new FormControl('', { nonNullable: true }),
  });

  private normalizeString(str: string): string {
    return str
      .normalize('NFD')
      .replace(/\p{Diacritic}/gu, '')
      .toLowerCase()
      .trim();
  }

  // Liste filtrée selon la recherche
  protected filteredEquipmentList = computed(() => {
    this.cartVersion();
    const query = this.normalizeString(this.searchQuery());
    const filter = this.equipmentFilter();

    return this.equipment().filter((item) => {
      const matchesFilter = filter === 'all'
        || (filter === 'owned' && this.isOwned(item.id))
        || (filter === 'equipped' && this.isEquipped(item.id))
        || (filter === 'not-equipped' && !this.isEquipped(item.id));
      const label = this.normalizeString(item.label);
      const type = this.normalizeString(this.typeLabel(item.type));
      const category = this.normalizeString(this.categoryLabel(item.category));

      return matchesFilter && (!query || label.includes(query) || type.includes(query) || category.includes(query));
    });
  });

  // Nombre total de pages
  protected totalPages = computed(() => {
    return Math.max(1, Math.ceil(this.filteredEquipmentList().length / this.pageSize));
  });

  // Éléments affichés pour la page courante
  protected paginatedEquipment = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize;
    return this.filteredEquipmentList().slice(start, start + this.pageSize);
  });

  protected onSearchInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.searchQuery.set(value);
    this.currentPage.set(1); // Remet la pagination à zéro lors d'une recherche
  }

  protected onEquipmentFilterChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value as 'all' | 'owned' | 'equipped' | 'not-equipped';
    this.equipmentFilter.set(value);
    this.currentPage.set(1);
  }

  protected changePage(delta: number): void {
    const newPage = this.currentPage() + delta;
    if (newPage >= 1 && newPage <= this.totalPages()) {
      this.currentPage.set(newPage);
    }
  }

  protected isEquipped(id: string): boolean {
    return this.equipped.has(id);
  }

  protected isOwned(id: string): boolean {
    return this.cart.has(id);
  }

  protected addToInventory(item: Equipment): void {
    this.cart.add(item.id);
    this.quantities.set(item.id, 1);
    this.cartVersion.update((version) => version + 1);
  }

  protected removeFromInventory(item: Equipment): void {
    this.cart.delete(item.id);
    this.quantities.delete(item.id);
    this.equipped.delete(item.id);
    this.weighted.delete(item.id);
    this.cartVersion.update((version) => version + 1);
  }

  protected isWeighted(id: string): boolean { return this.weighted.has(id); }

  protected quantity(id: string): number { return this.quantities.get(id) ?? 1; }

  protected updateQuantity(item: Equipment, event: Event): void {
    if (!this.isOwned(item.id)) return;
    const value = Math.max(1, Math.floor(Number((event.target as HTMLInputElement).value) || 1));
    this.quantities.set(item.id, value);
    this.cartVersion.update((version) => version + 1);
  }

  protected toggleWeighted(item: Equipment): void {
    if (item.type !== 'weapon' || !this.isOwned(item.id)) return;
    if (this.weighted.has(item.id)) this.weighted.delete(item.id);
    else this.weighted.add(item.id);
    this.cartVersion.update((version) => version + 1);
  }

  protected toggleEquipped(item: Equipment): void {
    if (this.equipped.has(item.id)) {
      this.equipped.delete(item.id);
    } else if (this.canEquip(item)) {
      this.equipped.add(item.id);
    }
    this.cartVersion.update((version) => version + 1);
  }

  protected canEquip(item: Equipment): boolean {
    if (this.isEquipped(item.id)) return true;
    if (item.type === 'other') return true;
    const equippedCount = this.equipment()
      .filter((equipment) => equipment.type === item.type && this.isEquipped(equipment.id))
      .length;
    return equippedCount < (item.type === 'weapon' ? 2 : 1);
  }

  protected equipmentLimitLabel(type: EquipmentType): string {
    if (type === 'weapon') return 'Maximum : 2 armes';
    if (type === 'shield') return 'Maximum : 1 bouclier';
    if (type === 'armor') return 'Maximum : 1 armure';
    return '';
  }

  protected openModal(): void {
    this.modalOpen = true;
  }
  protected closeModal(): void {
    this.modalOpen = false;
  }

  protected addEquipment(): void {
    if (this.form.invalid) return;
    const value = this.form.getRawValue();
    const item = this.equipmentService.add(
      value.label.trim(),
      value.type,
      value.category === 'none' ? null : (Number(value.category) as 1 | 2 | 3),
      value.attackBonus,
      value.defenseBonus,
      value.damageReduction,
      this.parseSkillBonus(value.skillBonus),
    );
    this.cart.add(item.id);
    this.cartVersion.update((version) => version + 1);
    this.form.reset({
      label: '',
      type: 'weapon',
      category: '1',
      attackBonus: 0,
      defenseBonus: 0,
      damageReduction: 0,
      skillBonus: '',
    });
    this.closeModal();
  }

  protected save(): void {
    if (!this.characterId) return;
    const equipment: CharacterEquipment[] = [...this.cart].map((equipmentId) => ({
      equipmentId,
      quantity: this.quantity(equipmentId),
      equipped: this.equipped.has(equipmentId),
      weighted: this.weighted.has(equipmentId),
    }));
    this.characterService.setEquipment(this.characterId, equipment);
  }

  protected parseSkillBonus(value: string): Record<string, number> {
    return Object.fromEntries(
      value
        .split(',')
        .map((entry) => entry.trim().split(':'))
        .filter(([skillId, bonus]) => skillId && Number(bonus))
        .map(([skillId, bonus]) => [skillId, Number(bonus)]),
    );
  }

  protected typeLabel(type: EquipmentType): string {
    return { weapon: 'Arme', shield: 'Bouclier', armor: 'Armure', other: 'Autre' }[type];
  }

  protected categoryLabel(category: number | null): string {
    if (category === 1) return 'Amateur';
    if (category === 2) return 'Professionnel';
    if (category === 3) return 'Brutasse';
    return '-';
  }

  protected description(item: Equipment): string {
    if (item.type === 'weapon') return `${item.category}D6 + FOR`;
    if (item.type === 'shield') return `+${item.defenseBonus} DEF`;
    if (item.type === 'armor') return `-${item.damageReduction} dégâts`;
    return 'Équipement utilisable';
  }

  protected skillBonusDescription(item: Equipment): string {
    return Object.entries(item.skillBonuses)
      .map(([skillId, bonus]) => `+${bonus} ${skillId}`)
      .join(' · ');
  }

  protected get combatBonuses(): { attack: number; defense: number; damageReduction: number } {
    return this.equipment()
      .filter((item) => this.isEquipped(item.id))
      .reduce(
        (total, item) => ({
          attack: total.attack + item.attackBonus,
          defense: total.defense + item.defenseBonus,
          damageReduction: total.damageReduction + item.damageReduction,
        }),
        { attack: 0, defense: 0, damageReduction: 0 },
      );
  }

  protected get cartItems(): Equipment[] {
    return this.equipment().filter((item) => this.cart.has(item.id));
  }
}
