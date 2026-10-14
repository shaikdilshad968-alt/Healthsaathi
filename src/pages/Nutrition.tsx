import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { calculateNutritionTargets, calculateAge } from '@/lib/nutritionCalculator';
import { useActiveProfile } from '@/context/AppContext';
import { DEMO_MEAL_PLAN, DEMO_NUTRITION_TARGETS } from '@/lib/demoData';
import type { NutritionTargets, ActivityLevel, HealthGoal } from '@/types';
import { Calculator, Utensils, Info, ChevronDown, ChevronUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const schema = z.object({
  weight_kg: z.coerce.number().min(20).max(300),
  height_cm: z.coerce.number().min(50).max(250),
  age: z.coerce.number().min(5).max(100),
  sex: z.enum(['male','female','other']),
  activity: z.enum(['sedentary','light','moderate','active','very_active']),
  goal: z.enum(['weight_loss','weight_gain','maintenance','muscle_gain']),
});
type FormValues = z.infer<typeof schema>;

function MacroBar({ label, value, target, color }: { label: string; value: number; target: number; color: string }) {
  const pct = Math.min(Math.round((value / target) * 100), 100);
  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="font-semibold text-slate-600">{label}</span>
        <span className="text-slate-400">{value}g / {target}g ({pct}%)</span>
      </div>
      <div className="progress-bar">
        <div className="progress-fill h-3" style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
  );
}

function MealCard({ meal }: { meal: typeof DEMO_MEAL_PLAN[0] }) {
  const [open, setOpen] = useState(false);
  const label = meal.meal_type.charAt(0).toUpperCase() + meal.meal_type.slice(1);
  const emojis: Record<string, string> = { breakfast: '🌅', lunch: '☀️', dinner: '🌙', snack: '🍎' };
  return (
    <div className="card">
      <button className="w-full flex items-center justify-between px-4 py-3 hover:bg-slate-50 transition-colors" onClick={() => setOpen(!open)}>
        <div className="flex items-center gap-2">
          <span className="text-xl">{emojis[meal.meal_type]}</span>
          <div className="text-left">
            <p className="font-semibold text-slate-800 text-sm">{label}</p>
            <p className="text-[11px] text-slate-400">{meal.total_calories} kcal · {meal.total_protein_g}g protein</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="badge-teal text-[10px]">{meal.foods.length} foods</span>
          {open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </div>
      </button>
      {open && (
        <div className="border-t border-slate-100">
          {meal.foods.map((food, i) => (
            <div key={i} className="flex items-center justify-between px-4 py-2.5 border-b border-slate-50 last:border-0 text-xs">
              <div>
                <p className="font-medium text-slate-700">{food.name}</p>
                <p className="text-slate-400">{food.serving_size}</p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-slate-700">{food.calories} kcal</p>
                <p className="text-slate-400">P: {food.protein_g}g · C: {food.carbs_g}g · F: {food.fat_g}g</p>
                {food.cost_inr && <p className="text-emerald-600">~₹{food.cost_inr}</p>}
              </div>
            </div>
          ))}
          <div className="px-4 py-2 bg-slate-50 flex justify-between text-xs font-semibold text-slate-600">
            <span>Total</span>
            <span>{meal.total_calories} kcal · P:{meal.total_protein_g}g · C:{meal.total_carbs_g}g · F:{meal.total_fat_g}g</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Nutrition() {
  const profile = useActiveProfile();
  const [targets, setTargets] = useState<NutritionTargets>(DEMO_NUTRITION_TARGETS);
  const [calculated, setCalculated] = useState(false);

  const defaultAge = profile?.dob ? calculateAge(profile.dob) : 30;
  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      weight_kg: profile?.weight_kg ?? 60,
      height_cm: profile?.height_cm ?? 165,
      age: defaultAge,
      sex: (profile?.sex === 'other' ? 'female' : profile?.sex) ?? 'female',
      activity: (profile?.activity_level ?? 'moderate') as ActivityLevel,
      goal: (profile?.goal ?? 'maintenance') as HealthGoal,
    },
  });

  const onSubmit = (data: FormValues) => {
    const result = calculateNutritionTargets({
      weightKg: data.weight_kg,
      heightCm: data.height_cm,
      ageYears: data.age,
      sex: data.sex === 'other' ? 'female' : data.sex,
      activity: data.activity,
      goal: data.goal,
    });
    setTargets(result);
    setCalculated(true);
  };

  const chartData = [
    { name: 'Protein', grams: targets.protein_g, kcal: targets.protein_g * 4, fill: '#0f9b8e' },
    { name: 'Carbs',   grams: targets.carbs_g,   kcal: targets.carbs_g * 4,   fill: '#3b82f6' },
    { name: 'Fat',     grams: targets.fat_g,     kcal: targets.fat_g * 9,     fill: '#f59e0b' },
  ];

  const totalCost = DEMO_MEAL_PLAN.flatMap(m => m.foods).reduce((s, f) => s + (f.cost_inr ?? 0), 0);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="section-title text-xl">Nutrition Planner</h1>
        <p className="section-sub">Personalised calorie & macro targets + Indian meal plan</p>
      </div>

      {/* Calculator */}
      <div className="card p-5">
        <div className="flex items-center gap-2 mb-4">
          <Calculator size={18} className="text-teal-500" />
          <p className="font-bold text-slate-800">Calorie & Macro Calculator</p>
          <span className="badge-teal text-[10px] ml-auto">Mifflin-St Jeor Equation</span>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <div><label className="label">Weight (kg)</label><input type="number" step="0.1" className="input" {...register('weight_kg')} /></div>
          <div><label className="label">Height (cm)</label><input type="number" className="input" {...register('height_cm')} /></div>
          <div><label className="label">Age (years)</label><input type="number" className="input" {...register('age')} /></div>
          <div><label className="label">Sex</label>
            <select className="input" {...register('sex')}>
              <option value="female">Female</option>
              <option value="male">Male</option>
              <option value="other">Other (uses female equation)</option>
            </select>
          </div>
          <div><label className="label">Activity Level</label>
            <select className="input" {...register('activity')}>
              <option value="sedentary">Sedentary</option>
              <option value="light">Light</option>
              <option value="moderate">Moderate</option>
              <option value="active">Active</option>
              <option value="very_active">Very Active</option>
            </select>
          </div>
          <div><label className="label">Goal</label>
            <select className="input" {...register('goal')}>
              <option value="weight_loss">Weight Loss</option>
              <option value="weight_gain">Weight Gain</option>
              <option value="maintenance">Maintenance</option>
              <option value="muscle_gain">Muscle Gain</option>
            </select>
          </div>
          <div className="col-span-2 sm:col-span-3">
            <button type="submit" className="btn-primary w-full">
              <Calculator size={15} />Calculate My Targets
            </button>
          </div>
        </form>

        {calculated && (
          <div className="mt-4 p-3 bg-teal-50 border border-teal-100 rounded-xl text-xs text-teal-800 flex items-start gap-2">
            <Info size={13} className="flex-shrink-0 mt-0.5" />
            <span><strong>Equation used:</strong> {targets.equation}. {targets.notes}</span>
          </div>
        )}
      </div>

      {/* Macro Targets */}
      <div className="card p-5">
        <p className="font-bold text-slate-800 mb-4">Your Daily Targets</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-5">
          {[
            { label: 'Calories', value: targets.calories, unit: 'kcal', color: '#0f9b8e' },
            { label: 'Protein',  value: targets.protein_g, unit: 'g',   color: '#10b981' },
            { label: 'Carbs',    value: targets.carbs_g,  unit: 'g',   color: '#3b82f6' },
            { label: 'Fat',      value: targets.fat_g,    unit: 'g',   color: '#f59e0b' },
          ].map(m => (
            <div key={m.label} className="text-center p-3 rounded-xl bg-slate-50">
              <p className="text-2xl font-bold" style={{ color: m.color }}>{m.value}</p>
              <p className="text-[10px] text-slate-400 uppercase tracking-wide">{m.label} ({m.unit})</p>
            </div>
          ))}
        </div>
        <div style={{ height: 140 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip formatter={(value, name) => [name === 'kcal' ? `${value ?? 0} kcal` : `${value ?? 0}g`, name]} />
              <Bar dataKey="kcal" radius={[4,4,0,0]} fill="#0f9b8e" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Meal Plan */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-bold text-slate-800">Sample Meal Plan</p>
            <p className="text-xs text-slate-400">Indian vegetarian · ~₹{totalCost}/day estimated · Clearly labelled sample data</p>
          </div>
          <div className="flex items-center gap-2">
            <Utensils size={14} className="text-teal-500" />
            <span className="text-xs text-slate-500">
              {DEMO_MEAL_PLAN.reduce((s, m) => s + m.total_calories, 0)} kcal total
            </span>
          </div>
        </div>
        {DEMO_MEAL_PLAN.map(meal => <MealCard key={meal.meal_type} meal={meal} />)}
        <p className="text-[11px] text-slate-400 text-center pt-2">
          ⚠️ Sample data only. Nutritional values are estimates. Consult a registered dietitian for personalised meal plans.
          Not a clinical prescription.
        </p>
      </div>
    </div>
  );
}
