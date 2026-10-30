import { Pipe, PipeTransform, inject } from '@angular/core';
import { SkillService } from '../skill/skill.service';

@Pipe({ name: 'advantageDescription', standalone: true })
export class AdvantageDescriptionPipe implements PipeTransform {
  private readonly skills = inject(SkillService).skillList;

  transform(description: string | null | undefined): string {
    if (!description) return '';

    const skillNames = this.skills().flatMap(({ label }) => {
      const withoutAccents = label.normalize('NFD').replace(/\p{Diacritic}/gu, '');
      return [label, withoutAccents];
    });
    const highlightedTerms = [...new Set(['Attaque', 'Défense', 'Sauvegarde', ...skillNames])]
      .sort((left, right) => right.length - left.length)
      .map((term) => term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
    const skillPattern = highlightedTerms.join('|');
    const formattingPattern = new RegExp(
      `\\bjets?\\s+d(?:e|['’])\\s*(?:${skillPattern})\\b|\\b(?:\\d+\\s*)?d(?:6|k)\\b|(?<![\\p{L}\\p{N}_])(?:${skillPattern})(?![\\p{L}\\p{N}_])`,
      'giu',
    );

    return description
      .split(/(<br\s*\/?>|\r?\n)/gi)
      .map((part) => {
        if (/^(?:<br\s*\/?>|\r?\n)$/i.test(part)) return '<br/>';
        return this.escapeHtml(part).replace(formattingPattern, '<strong>$&</strong>');
      })
      .join('');
  }

  private escapeHtml(value: string): string {
    return value.replace(/[&<>"']/g, (character) => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
    })[character]!);
  }
}
