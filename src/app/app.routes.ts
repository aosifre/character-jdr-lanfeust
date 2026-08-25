import { Routes } from '@angular/router';
import { CharacterForm } from './character/form/character-form';
import { CharacterList } from './character/list/character-list';
import { CharacterCharacteristics } from './character/characteristics/character-characteristics';
import { CharacterOtherScoresPage } from './character/otherscores/character-otherscores';
import { CharacterSkillsPage } from './character/skills/character-skills';
import { SkillList } from './skill/list/skill-list';

export const routes: Routes = [
	{ path: '', pathMatch: 'full', redirectTo: 'characters' },
	{ path: 'characters', component: CharacterList },
	{ path: 'characters/new', component: CharacterForm },
	{ path: 'characters/:id/characteristics', component: CharacterCharacteristics },
	{ path: 'characters/:id/otherscores', component: CharacterOtherScoresPage },
	{ path: 'characters/:id/skills', component: CharacterSkillsPage },
	{ path: 'skills', component: SkillList },
	{ path: 'characters/:id/edit', component: CharacterForm },
	{ path: '**', redirectTo: 'characters' },
];
