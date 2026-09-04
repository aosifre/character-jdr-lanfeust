import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  { path: 'characters/:id', renderMode: RenderMode.Server },
  { path: 'characters/:id/characteristics', renderMode: RenderMode.Server },
  { path: 'characters/:id/characteristics/add', renderMode: RenderMode.Server },
  { path: 'characters/:id/equipment', renderMode: RenderMode.Server },
  { path: 'characters/:id/otherscores', renderMode: RenderMode.Server },
  { path: 'characters/:id/skills', renderMode: RenderMode.Server },
  { path: 'characters/:id/skills/add', renderMode: RenderMode.Server },
  { path: 'characters/:id/advantages', renderMode: RenderMode.Server },
  { path: 'characters/:id/advantages/add', renderMode: RenderMode.Server },
  { path: 'characters/:id/flaws', renderMode: RenderMode.Server },
  { path: 'characters/:id/level', renderMode: RenderMode.Server },
  { path: 'characters/:id/level/result', renderMode: RenderMode.Server },
  {
    path: '**',
    renderMode: RenderMode.Prerender
  }
];
