export type AppRoute = 'home' | 'activity' | 'planner' | 'goals' | 'settings';

export const routeLabels: Record<AppRoute, string> = {
  home: 'Home',
  activity: 'Activity',
  planner: 'Plan',
  goals: 'Goals',
  settings: 'Settings',
};
