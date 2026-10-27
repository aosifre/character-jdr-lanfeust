import { equipmentIcon } from './equipment.model';

describe('equipmentIcon', () => {
  it('chooses an icon from the equipment label', () => {
    expect(equipmentIcon({ label: 'Arc de chasse', type: 'weapon' })).toBe('🏹');
    expect(equipmentIcon({ label: 'Armure de cuir', type: 'armor' })).toBe('🦺');
    expect(equipmentIcon({ label: 'Bouclier, grand', type: 'shield' })).toBe('🛡️');
  });

  it('prefers an optional custom icon', () => {
    expect(equipmentIcon({ label: 'Arc de chasse', type: 'weapon', icon: '🌟' })).toBe('🌟');
  });

  it('falls back to the equipment type when the label has no match', () => {
    expect(equipmentIcon({ label: 'Objet étrange', type: 'other' })).toBe('🎒');
  });
});
