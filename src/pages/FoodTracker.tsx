import { useState } from 'react';
import { useApp, useActiveProfile } from '@/context/AppContext';
import { DEMO_NUTRITION_TARGETS, INDIAN_FOODS } from '@/lib/demoData';
import { Plus, Trash2, Search, Target, X } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { DEMO_WEIGHT_HISTORY } from '@/lib/demoData';
import toast from 'react-hot-toast';
import type { FoodLogEntry, MealType } from '@/types';

const MEAL_TYPES: MealType[] = ['breakfast', 'lunch', 'snack', 'dinner'];
const MEAL_EMOJIS: Record<MealType, string> = { breakfast: '🌅', lunch: '☀️', snack: '🍎', dinner: '🌙' };

export default function FoodTracker() {
  const { foodLog, addFoodLog, removeFoodLog } = useApp();
  const profile = useActiveProfile();
  const [search, setSearch] = useState('');
  const [selectedMeal, setSelectedMeal] = useState<MealType>('breakfast');
  const [isLogOpen, setIsLogOpen] = useState(false);
  const targets = DEMO_NUTRITION_TARGETS;

  const results = search.length > 1
    ? INDIAN_FOODS.filter(f => f.name.toLowerCase().includes(search.toLowerCase())).slice(0, 8)
    : [];

  const todayLog = foodLog.filter(f => {
    const logDate = new Date(f.logged_at).toDateString();
    return logDate === new Date().toDateString();
  });

  const totals = todayLog.reduce((acc, f) => ({
    calories: acc.calories + f.calories,
    protein_g: acc.protein_g + f.protein_g,
    carbs_g: acc.carbs_g + f.carbs_g,
    fat_g: acc.fat_g + f.fat_g,
  }), { calories: 0, protein_g: 0, carbs_g: 0, fat_g: 0 });

  const addFood = (food: typeof INDIAN_FOODS[0]) => {
    const entry: FoodLogEntry = {
      id: Date.now().toString(),
      profile_id: profile?.id ?? '',
      meal_type: selectedMeal,
      food_name: food.name,
      quantity: 1,
      unit: food.serving_size,
      calories: food.calories,
      protein_g: food.protein_g,
      carbs_g: food.carbs_g,
      fat_g: food.fat_g,
      logged_at: new Date().toISOString(),
    };
    addFoodLog(entry);
    setSearch('');
    setIsLogOpen(false);
    toast.success(`Added ${food.name} to ${selectedMeal}`);
  };

  const weightData = DEMO_WEIGHT_HISTORY.map(m => ({
    date: formatDate(m.recorded_at, { month: 'short' }),
    weight: m.value,
  }));

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="section-title text-xl">Daily Food Tracker</h1>
          <p className="section-sub">{formatDate(new Date().toISOString())} · Track what you eat</p>
        </div>
        <button className="btn-primary shrink-0" onClick={() => setIsLogOpen(true)}>
          <Plus size={15} /> Log Food
        </button>
      </div>

      {/* Daily totals */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <p className="font-bold text-slate-800">Today's Progress</p>
          <span className="badge-teal">{Math.max(0, targets.calories - Math.round(totals.calories))} kcal remaining</span>
        </div>
        <div className="space-y-3">
          {[
            { label: 'Calories', val: Math.round(totals.calories), target: targets.calories, unit: 'kcal', color: '#0f9b8e' },
            { label: 'Protein',  val: Math.round(totals.protein_g), target: targets.protein_g, unit: 'g', color: '#10b981' },
            { label: 'Carbs',    val: Math.round(totals.carbs_g),  target: targets.carbs_g,   unit: 'g', color: '#3b82f6' },
            { label: 'Fat',      val: Math.round(totals.fat_g),   target: targets.fat_g,    unit: 'g', color: '#f59e0b' },
          ].map(m => (
            <div key={m.label}>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-semibold text-slate-600">{m.label}</span>
                <span className="text-slate-400">{m.val} / {m.target} {m.unit}</span>
              </div>
              <div className="progress-bar">
                <div className="h-2.5 rounded-full transition-all duration-500" style={{ width: `${Math.min((m.val / m.target) * 100, 100)}%`, background: m.color }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {isLogOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4"
          onMouseDown={event => { if (event.target === event.currentTarget) setIsLogOpen(false); }}
        >
          <section role="dialog" aria-modal="true" aria-labelledby="log-food-title" className="w-full max-w-lg rounded-xl bg-white p-5 shadow-xl">
            <div className="flex items-center justify-between gap-3 mb-4">
              <h2 id="log-food-title" className="font-bold text-slate-800">Log Food</h2>
              <button className="btn-ghost p-2" aria-label="Close food logger" onClick={() => setIsLogOpen(false)}>
                <X size={16} />
              </button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
              {MEAL_TYPES.map(meal => (
                <button
                  key={meal}
                  aria-pressed={selectedMeal === meal}
                  className={`py-2 rounded-lg text-xs font-semibold border transition-colors ${ selectedMeal === meal ? 'bg-teal-500 text-white border-teal-500' : 'bg-white text-slate-600 border-slate-200 hover:border-teal-200' }`}
                  onClick={() => setSelectedMeal(meal)}
                >
                  {MEAL_EMOJIS[meal]} {meal.charAt(0).toUpperCase() + meal.slice(1)}
                </button>
              ))}
            </div>
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                autoFocus
                className="input pl-8"
                aria-label="Search foods"
                placeholder="Search foods (e.g. idli, dal, rice, paneer)..."
                value={search}
                onChange={event => setSearch(event.target.value)}
              />
            </div>
            {search.length > 1 && results.length === 0 && (
              <p className="py-5 text-center text-sm text-slate-500">No matching foods found.</p>
            )}
            {results.length > 0 && (
              <div className="mt-2 max-h-72 overflow-y-auto border border-slate-200 rounded-lg">
                {results.map(food => (
                  <div key={food.name} className="flex items-center justify-between gap-3 px-3 py-2.5 border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-slate-700">{food.name}</p>
                      <p className="text-[11px] text-slate-400">{food.serving_size} · {food.calories} kcal · {food.protein_g}g protein</p>
                    </div>
                    <button className="btn-primary shrink-0 py-1.5 px-3 text-xs" onClick={() => addFood(food)}>
                      <Plus size={12} /> Add
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      )}

      {/* Meal log */}
      {MEAL_TYPES.map(meal => {
        const mealEntries = todayLog.filter(f => f.meal_type === meal);
        if (mealEntries.length === 0) return null;
        const mealCal = mealEntries.reduce((s, f) => s + f.calories, 0);
        return (
          <div key={meal} className="card p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="font-semibold text-slate-800">{MEAL_EMOJIS[meal]} {meal.charAt(0).toUpperCase() + meal.slice(1)}</p>
              <span className="text-xs text-slate-400">{Math.round(mealCal)} kcal</span>
            </div>
            <div className="space-y-1.5">
              {mealEntries.map(entry => (
                <div key={entry.id} className="flex items-center justify-between py-2 px-2 rounded-lg hover:bg-slate-50 transition-colors group">
                  <div>
                    <p className="text-sm font-medium text-slate-700">{entry.food_name}</p>
                    <p className="text-[11px] text-slate-400">{entry.unit} · {entry.calories} kcal · P:{Math.round(entry.protein_g)}g</p>
                  </div>
                  <button className="opacity-0 group-hover:opacity-100 transition-opacity btn-ghost text-red-400 hover:text-red-600 py-1 px-2" onClick={() => { removeFoodLog(entry.id); toast.success('Removed'); }}>
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        );
      })}

      {todayLog.length === 0 && (
        <div className="empty-state">
          <Target size={40} className="text-slate-300 mb-3" />
          <p className="font-semibold text-slate-500">No food logged today</p>
          <p className="text-sm mt-1">Search for foods above to start tracking</p>
        </div>
      )}

      {/* Weight chart */}
      <div className="card p-5">
        <p className="font-bold text-slate-800 mb-4">Weight History</p>
        <div style={{ height: 150 }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={weightData} margin={{ top: 0, right: 0, left: -25, bottom: 0 }}>
              <defs>
                <linearGradient id="wg2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis domain={[60,68]} tick={{ fontSize: 11 }} />
              <Tooltip formatter={(value) => [`${value ?? 0} kg`, 'Weight']} />
              <Area type="monotone" dataKey="weight" stroke="#10b981" strokeWidth={2.5} fill="url(#wg2)" dot={{ r: 3, fill: '#10b981' }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
