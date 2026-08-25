import { Routes } from '@angular/router';
import { CharacterForm } from './character/form/character-form';
import { CharacterList } from './character/list/character-list';
import { CharacterCharacteristics } from './character/characteristics/character-characteristics';
import { CharacterOtherScoresPage } from './character/otherscores/character-otherscores';
import { CharacterSkillsPage } from './character/skills/character-skills';
import { SkillList } from './skill/list/skill-list';
import { CharacterAdvantagesPage } from './character/advantages/character-advantages';
import { SettingsPage } from './settings/settings-page';
import { AdvantageList } from './advantage/list/advantage-list';
import { CreationSettings } from './settings/creation/creation-settings';
import { FlawList } from './flaw/list/flaw-list';
import { CharacterFlawsPage } from './character/flaws/character-flaws';
import { CharacterEditPage } from './character/edit/character-edit-page';

export const routes: Routes = [
	{ path: '', pathMatch: 'full', redirectTo: 'characters' },
	{ path: 'characters', component: CharacterList },
	{ path: 'characters/new', component: CharacterForm },
	{ path: 'characters/:id/characteristics', component: CharacterCharacteristics },
	{ path: 'characters/:id/otherscores', component: CharacterOtherScoresPage },
	{ path: 'characters/:id/skills', component: CharacterSkillsPage },
	{ path: 'characters/:id/advantages', component: CharacterAdvantagesPage },
	{ path: 'characters/:id/flaws', component: CharacterFlawsPage },
	{ path: 'skills', component: SkillList },
	{ path: 'settings', component: SettingsPage },
	{ path: 'settings/creation', component: CreationSettings },
	{ path: 'advantages', component: AdvantageList },
	{ path: 'flaws', component: FlawList },
	{ path: 'characters/:id/edit', component: CharacterEditPage },
	{ path: '**', redirectTo: 'characters' },
];
