import { calculateSnapshot } from '../../domain/budget';
import type { AppData, CompanionAction, EnvironmentContext, Transaction, WalletMood } from '../../domain/models';

export interface CompanionInsight {
  id: string;
  message: string;
  mood: WalletMood;
  reason: 'greeting' | 'income' | 'expense' | 'budget' | 'goal' | 'savings' | 'quiet' | 'action' | 'environment' | 'notification';
}

export interface GeneratedNotification {
  title: string;
  body: string;
  mood: WalletMood;
}

type Random = () => number;

const mulberry32 = (seed: number): Random => () => {
  seed |= 0; seed = seed + 0x6D2B79F5 | 0;
  let value = Math.imul(seed ^ seed >>> 15, 1 | seed);
  value = value + Math.imul(value ^ value >>> 7, 61 | value) ^ value;
  return ((value ^ value >>> 14) >>> 0) / 4294967296;
};

const hash = (value: string) => [...value].reduce((result, character) => Math.imul(result ^ character.charCodeAt(0), 16777619), 2166136261) >>> 0;
const pick = <T,>(items: T[], random: Random) => items[Math.min(items.length - 1, Math.floor(random() * items.length))];

const address = (data: AppData) => {
  const name = data.profile.name.trim();
  const prefix = { neutral: '', ate: 'Ate ', kuya: 'Kuya ', madam: 'Madam ', sir: 'Sir ' }[data.profile.addressStyle ?? 'neutral'];
  return name ? `${prefix}${name}` : prefix.trim() || 'friend';
};

/**
 * Bulsa Mini is a tiny on-device contextual model—not a cloud LLM. It scores a
 * compact feature vector to select emotion, then uses context-conditioned
 * probabilistic generation with repetition memory to compose Taglish language.
 */
export function generateActionReaction(data: AppData, action: CompanionAction, now = new Date()): CompanionInsight {
  const snapshot = calculateSnapshot(data, now);
  const environment = data.companion.environment;
  const mood = inferMood({ data, action, environment, hour: now.getHours() });
  const random = mulberry32(hash(`${action.id}-${action.occurredAt}-${data.transactions.length}`));
  const who = address(data);
  const amount = action.amount ? ` ${formatPeso(action.amount)}` : '';

  const openers: Record<CompanionAction['operation'], string[]> = {
    create: ['Nakuha ko ’yan', 'Added and remembered', 'Pasok na sa Bulsa', 'Okay, recorded', 'Fresh entry saved'],
    edit: ['Updated na', 'Change received', 'Mas accurate na tayo', 'Edit saved', 'Refined and ready'],
    delete: ['Removed na', 'Clean-up complete', 'Wala na sa list', 'Deleted as requested', 'Tidied up'],
    pay: ['Payment logged', 'Bayad na—nice', 'One less thing to remember', 'Settled and recorded', 'Done, paid na'],
    change: ['New vibe applied', 'Switch complete', 'Got the change', 'Fresh setting, fresh energy', 'Updated to match you'],
    import: ['Your data is back', 'Backup restored', 'Everything is unpacked', 'Bulsa memory restored'],
    reset: ['Fresh start ready', 'Clean slate activated', 'Reset complete—hinga muna'],
  };
  const entityLines: Record<CompanionAction['entity'], string[]> = {
    transaction: action.label === 'income'
      ? [`May${amount} na pumasok`, `Lumuwag nang kaunti ang wallet natin${amount}`, `Income boost detected${amount}`]
      : action.label === 'expense'
        ? [`Expense${amount} is now counted`, `Alam na natin saan napunta${amount}`, `Spending trail updated${amount}`]
        : [`Your money move${amount} is safely counted`, `Ledger updated${amount}`, `Financial picture refreshed${amount}`],
    goal: ['Your goal map is clearer now', 'Future-you just got an update', 'Another dream is organized'],
    category: ['The monthly guardrail now fits you better', 'Budget limit recalibrated', 'Category plan updated'],
    wallet: ['Your account picture is up to date', 'Wallet balance map refreshed', 'Account list is cleaner now'],
    payment: ['The calendar and reports are in sync', 'Your payment plan just got smarter', 'Due-date memory updated'],
    profile: [`I’ll remember how to address you, ${who}`, 'Your companion settings now fit you better', 'Profile details updated locally'],
    theme: ['This palette feels more like your space', 'New colors, same private wallet', 'The whole mood just shifted'],
    settings: ['Preference learned on this device', 'I’ll use that setting from now on', 'Companion behavior adjusted'],
    data: ['Your private records are updated', 'Local data operation complete', 'Everything stays on this device'],
  };
  const closers = contextualClosers(snapshot.budgetUsed, environment, mood, who);
  const message = composeUnique([openers[action.operation], entityLines[action.entity], closers], random, data.companion.recentMessages);
  return { id: action.id, message, mood, reason: 'action' };
}

export function generateInsight(data: AppData, now = new Date(), sessionStart?: number): CompanionInsight {
  const snapshot = calculateSnapshot(data, now);
  const latest = [...data.transactions].sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0];
  const completedGoal = data.goals.find((goal) => goal.targetAmount > 0 && goal.currentAmount >= goal.targetAmount);
  const random = mulberry32(hash(`${now.toDateString()}-${now.getHours()}-${data.transactions.length}`));
  const who = address(data);

  if (completedGoal) return { id: `goal-${completedGoal.id}`, mood: 'celebrating', reason: 'goal', message: composeUnique([
    ['Goal unlocked', 'We did it', 'Milestone reached'],
    [`${completedGoal.name} is fully funded`, `${completedGoal.name} made it to 100%`, `Complete na ang ${completedGoal.name}`],
    [`Ang galing, ${who}!`, 'That deserves a tiny wallet dance!', 'Future-you says thank you.'],
  ], random, data.companion.recentMessages) };
  if (snapshot.budgetUsed >= 1) return { id: 'budget-over', mood: 'sad', reason: 'budget', message: composeUnique([
    ['Budget check', 'Gentle heads-up', 'Okay, honest moment'],
    ['Lampas tayo sa monthly plan', 'The budget line has been crossed', 'Medyo napasobra ang gastos this month'],
    [`Reset tayo without judgment, ${who}.`, 'Small corrections count—kaya pa.', 'Pause, plan, then move forward.'],
  ], random, data.companion.recentMessages) };
  if (snapshot.budgetUsed >= .8) return { id: 'budget-near', mood: 'worried', reason: 'budget', message: `Heads up, ${who}: ${Math.round(snapshot.budgetUsed * 100)}% na ng monthly budget ang nagamit. Gentle spending mode muna?` };
  if (latest && now.getTime() - new Date(latest.createdAt).getTime() < 5 * 60_000 && (!sessionStart || new Date(latest.createdAt).getTime() >= sessionStart)) return insightForTransaction(latest, data, random);

  const generated = generateNotificationMessage(data, now, data.companion.environment, now.getHours());
  return { id: `ambient-${now.getHours()}-${now.getDate()}`, mood: generated.mood, reason: 'greeting', message: generated.body };
}

export function generateNotificationMessage(data: AppData, at: Date, environment: EnvironmentContext, sequence = 0): GeneratedNotification {
  const hour = at.getHours();
  const random = mulberry32(hash(`${at.toDateString()}-${hour}-${sequence}-${data.companion.recentMessages.join('|')}`));
  const who = address(data);
  const weather = describeWeather(environment);
  const travel = environment.locationChanged;
  let title = 'Bulsa check-in';
  let mood: WalletMood = inferMood({ data, environment, hour });
  let intents: string[][];

  if (travel) {
    title = 'New place, new plans?'; mood = 'excited';
    intents = [
      ['May bago tayong location ah', 'Mukhang may lakad tayo', 'Travel mode ba tayo today'],
      ['Magta-travel tayo? Baka mapagastos na naman', 'New place means new temptations—budget buddy is watching', 'Enjoy the trip, pero sama natin ang budget'],
      [`Ingat at enjoy, ${who}!`, 'Magtabi muna for pamasahe at food.', 'Adventure responsibly, okay?'],
    ];
  } else if (hour >= 5 && hour < 9) {
    title = 'Magandang umaga'; mood = weather.kind === 'cold' ? 'cold' : 'energized';
    intents = [
      ['Gising naaa', 'Good morning', 'Rise and budget', 'Magandang umaga'],
      weather.kind === 'cold' ? ['Malamig today—warm drink budget?', 'Cold morning detected. Cozy pero mindful tayo.', 'Jacket, breakfast, then laban.'] : ['Fresh day, fresh choices', 'One tiny money win muna today', 'Ready na ang wallet for a smart day'],
      [`Kaya natin ’to, ${who}!`, 'Breakfast muna bago budol.', 'Start steady, finish proud.'],
    ];
  } else if (hour >= 11 && hour < 14) {
    title = 'Kain na'; mood = 'happy';
    intents = [
      ['Lunch check', 'Kain na', 'Tiyan check muna'],
      ['Plan the meal before the cravings plan it for you', 'Masarap kumain, mas masarap within budget', 'Food break—check lang natin ang Food budget'],
      [`Enjoy, ${who}!`, 'Busog, hindi broke.', 'Hydrate din, libre ang tubig minsan.'],
    ];
  } else if (hour >= 14 && hour < 18) {
    title = 'Afternoon wallet pulse'; mood = weather.kind === 'hot' ? 'sleepy' : 'energized';
    intents = [
      ['Afternoon check-in', 'Midday money pulse', 'Quick wallet tap'],
      weather.kind === 'hot' ? ['Mainit—tubig muna bago impulse iced coffee', 'Heat can make every cold drink look necessary', 'Hydrate, then decide if that drink is still a need'] : ['Still on track?', 'One mindful choice can save the day', 'Kamusta ang spending pace natin?'],
      ['No pressure, just awareness.', `You’ve got this, ${who}.`, 'Tiny choices add up.'],
    ];
  } else if (hour >= 18 && hour < 22) {
    title = 'Evening money wrap'; mood = 'proud';
    intents = [
      ['Good evening', 'Day almost done', 'Quick end-of-day check'],
      ['May gastos bang hindi pa na-log?', 'Let’s close the money loop before rest', 'One-minute expense check lang'],
      [`Then pahinga na, ${who}.`, 'Tomorrow gets a cleaner start.', 'Honest logs beat perfect memory.'],
    ];
  } else {
    title = 'Pahinga mode'; mood = 'sleepy';
    intents = [
      ['Late na', 'Sleepy wallet here', 'Night check'],
      ['No midnight budol, please', 'Rest is free and highly recommended', 'Bukas na ang spending decisions'],
      [`Good night, ${who}.`, 'Charge phone, charge self.', 'See you tomorrow.'],
    ];
  }

  const body = composeUnique(intents, random, data.companion.recentMessages);
  return { title: weather.label ? `${title} · ${weather.label}` : title, body, mood };
}

function insightForTransaction(transaction: Transaction, data: AppData, random: Random): CompanionInsight {
  const who = address(data);
  const amount = formatPeso(transaction.amount);
  const isLarge = transaction.amount >= Math.max(1000, data.profile.monthlyBudget * .1);
  if (transaction.kind === 'income') return { id: `income-${transaction.id}`, mood: 'excited', reason: 'income', message: composeUnique([
    ['Income received', 'May pumasok', 'Wallet boost detected'],
    [`Added ${amount} to the picture`, `${amount} just landed`, `Huminga nang maluwag ang wallet by ${amount}`],
    [`Nice one, ${who}!`, 'Save a little before it gets ideas.', 'Love that for the budget.'],
  ], random, data.companion.recentMessages) };
  if (transaction.kind === 'savings') return { id: `saving-${transaction.id}`, mood: 'proud', reason: 'savings', message: `Savings updated by ${amount}. Future-you is quietly cheering, ${who}.` };
  if (transaction.kind === 'keep') return { id: `keep-${transaction.id}`, mood: 'happy', reason: 'savings', message: `${amount} moved into Keep. Guilt-free, but still intentional—deal, ${who}?` };
  return { id: `expense-${transaction.id}`, mood: isLarge ? 'shocked' : 'happy', reason: 'expense', message: composeUnique([
    [isLarge ? 'Big spend detected' : 'Expense logged', isLarge ? 'Oop, sizeable one' : 'Recorded na', isLarge ? 'Wallet felt that' : 'Money trail updated'],
    [`${amount} went to ${transaction.category}`, `Counted ${amount} under ${transaction.category}`, `${transaction.category} moved by ${amount}`],
    [isLarge ? 'Planned ba ’to? Quick check lang.' : 'Awareness is a win.', `Organized money behavior, ${who}.`, 'At least hindi mystery expense.'],
  ], random, data.companion.recentMessages) };
}

function composeUnique(groups: string[][], random: Random, recent: string[]) {
  let result = '';
  for (let attempt = 0; attempt < 8; attempt++) {
    result = groups.map((group) => pick(group, random)).join('. ').replace(/\.([!?])/g, '$1');
    if (!recent.includes(result)) return result;
  }
  return `${result} ${pick(['✦', 'Okay?', 'Deal?', 'Tiny win.'], random)}`;
}

function contextualClosers(budgetUsed: number, environment: EnvironmentContext, mood: WalletMood, who: string) {
  if (environment.locationChanged) return ['New place today—enjoy, but bring the budget with you.', 'Travel energy detected. Pamasahe and food check muna.', 'Adventure mode, mindful spending mode.'];
  if (budgetUsed >= .8) return ['Close na tayo sa limit—gentle choices muna.', `Budget guard is awake, ${who}.`, 'One pause before the next spend.'];
  if (mood === 'cold') return ['Malamig—warm up without burning the budget.', 'Cozy mode, controlled spend.', `Stay warm, ${who}.`];
  return [`Nice work, ${who}.`, 'I’m keeping the bigger picture updated.', 'Small action, clearer money.', 'That was handled.'];
}

function inferMood({ data, action, environment, hour }: { data: AppData; action?: CompanionAction; environment: EnvironmentContext; hour: number }): WalletMood {
  const snapshot = calculateSnapshot(data);
  const features = {
    positive: action?.operation === 'create' || action?.operation === 'pay' ? 1 : 0,
    removal: action?.operation === 'delete' || action?.operation === 'reset' ? 1 : 0,
    money: action?.amount ? Math.min(1, action.amount / Math.max(1, data.profile.monthlyBudget)) : 0,
    pressure: Math.min(1.4, snapshot.budgetUsed),
    morning: hour >= 5 && hour < 11 ? 1 : 0,
    night: hour >= 22 || hour < 5 ? 1 : 0,
    cold: environment.weather && environment.weather.temperature < 20 ? 1 : 0,
    travel: environment.locationChanged ? 1 : 0,
  };
  const scores: Partial<Record<WalletMood, number>> = {
    happy: .4 + features.positive * .4,
    excited: features.travel * .8 + (action?.entity === 'wallet' || action?.entity === 'goal' ? .35 : 0),
    proud: action?.operation === 'pay' ? 1 : features.positive * .35,
    worried: features.pressure * .65 + features.money * .5,
    sad: features.pressure >= 1 ? 1.2 : features.removal * .25,
    shocked: features.money > .18 ? 1.1 : 0,
    sleepy: features.night * 1.1,
    thinking: features.removal * .5 + (action?.operation === 'edit' ? .3 : 0),
    cold: features.cold * 1.3,
    energized: features.morning * .8 + features.positive * .25,
  };
  return Object.entries(scores).sort(([, a], [, b]) => b - a)[0][0] as WalletMood;
}

function describeWeather(environment: EnvironmentContext) {
  const weather = environment.weather;
  if (!weather) return { kind: 'unknown' as const, label: '' };
  if (weather.temperature < 20) return { kind: 'cold' as const, label: `${Math.round(weather.temperature)}°C` };
  if ([51, 53, 55, 61, 63, 65, 80, 81, 82, 95, 96, 99].includes(weather.weatherCode)) return { kind: 'rain' as const, label: 'rain nearby' };
  if (weather.temperature >= 31) return { kind: 'hot' as const, label: `${Math.round(weather.temperature)}°C` };
  return { kind: 'clear' as const, label: `${Math.round(weather.temperature)}°C` };
}

const formatPeso = (amount: number) => `₱${amount.toLocaleString('en-PH', { maximumFractionDigits: 2 })}`;
