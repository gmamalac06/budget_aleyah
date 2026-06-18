import type { ThemeId } from '../../domain/models';

export const themes: { id: ThemeId; name: string; colors: [string, string, string] }[] = [
  { id: 'strawberry', name: 'Sandstone', colors: ['#b16a3b', '#f4f1eb', '#2d2925'] },
  { id: 'lavender', name: 'Imperial', colors: ['#6654a3', '#eeecf6', '#302a46'] },
  { id: 'matcha', name: 'Forest', colors: ['#4f7758', '#edf1e9', '#26382b'] },
  { id: 'ocean', name: 'Cobalt', colors: ['#2878a9', '#edf4f6', '#1f3d50'] },
  { id: 'sunset', name: 'Ember', colors: ['#b95535', '#f6eee8', '#4b2d25'] },
  { id: 'midnight', name: 'Night Drive', colors: ['#6570c8', '#171b2d', '#eef0ff'] },
  { id: 'mono', name: 'Paper & Ink', colors: ['#5c5c58', '#f3f2ee', '#242422'] },
];
