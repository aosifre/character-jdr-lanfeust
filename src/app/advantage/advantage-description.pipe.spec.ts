import { TestBed } from '@angular/core/testing';
import { SkillService } from '../skill/skill.service';
import { AdvantageDescriptionPipe } from './advantage-description.pipe';

describe('AdvantageDescriptionPipe', () => {
  let pipe: AdvantageDescriptionPipe;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [{
        provide: SkillService,
        useValue: { skillList: () => [{ label: 'Équitation' }, { label: 'Acrobaties' }] },
      }],
    });
    pipe = TestBed.runInInjectionContext(() => new AdvantageDescriptionPipe());
  });

  it('bolds dice rolls, rule terms, and named skills', () => {
    expect(pipe.transform('Un jet d’Attaque, 2d6 et un test d’Equitation.'))
      .toBe('Un <strong>jet d’Attaque</strong>, <strong>2d6</strong> et un test d’<strong>Equitation</strong>.');
  });

  it('renders newlines and explicit br tags as line breaks', () => {
    expect(pipe.transform('Première ligne<br/>Deuxième ligne\nTroisième ligne'))
      .toBe('Première ligne<br/>Deuxième ligne<br/>Troisième ligne');
  });

  it('escapes arbitrary HTML while preserving supported formatting', () => {
    expect(pipe.transform('<img src=x onerror=alert(1)> <br/> <script>'))
      .toBe('&lt;img src=x onerror=alert(1)&gt; <br/> &lt;script&gt;');
  });
});
