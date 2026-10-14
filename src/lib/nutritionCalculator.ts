// ──────────────────────────────────────────────────────────────
// Nutrition Calculator — Mifflin-St Jeor Equation
// Source: Mifflin MD et al., JADA 1990
// ──────────────────────────────────────────────────────────────

import type { ActivityLevel, HealthGoal, NutritionTargets } from '@/types';

const ACTIVITY_MULTIPLIERS: Record<ActivityLevel, number> = {
  sedentary:   1.2,
  light:       1.375,
  moderate:    1.55,
  active:      1.725,
  very_active: 1.9,
};

/**
 * Calculates BMR using the Mifflin-St Jeor equation.
 * Men:   (10 × weight_kg) + (6.25 × height_cm) − (5 × age_years) + 5
 * Women: (10 × weight_kg) + (6.25 × height_cm) − (5 × age_years) − 161
 */
function calculateBMR(weightKg: number, heightCm: number, ageYears: number, sex: 'male' | 'female' | 'other'): number {
  const base = (10 * weightKg) + (6.25 * heightCm) - (5 * ageYears);
  const sexAdjust = sex === 'male' ? 5 : -161;
  return Math.round(base + sexAdjust);
}

/**
 * Calculates TDEE (Total Daily Energy Expenditure)
 */
function calculateTDEE(bmr: number, activity: ActivityLevel): number {
  return Math.round(bmr * ACTIVITY_MULTIPLIERS[activity]);
}

/**
 * Adjusts calories based on health goal.
 * Weight loss: −300 to −500 kcal/day (conservative, avoids extreme deficit)
 * Weight gain: +300 to +400 kcal/day
 * Muscle gain: +200 to +300 kcal/day
 * Maintenance: no change
 */
function adjustForGoal(tdee: number, goal: HealthGoal): number {
  switch (goal) {
    case 'weight_loss':  return Math.max(tdee - 400, 1200); // floor at 1200 kcal
    case 'weight_gain':  return tdee + 350;
    case 'muscle_gain':  return tdee + 250;
    case 'maintenance':  return tdee;
    default:             return tdee;
  }
}

/**
 * Estimates protein target (grams) based on weight, goal, and activity.
 * Uses conservative general guidelines (not a clinical prescription).
 */
function estimateProtein(weightKg: number, goal: HealthGoal, activity: ActivityLevel): number {
  let multiplier = 1.2; // g/kg — general health baseline
  if (goal === 'muscle_gain') multiplier = 1.8;
  else if (goal === 'weight_loss') multiplier = 1.5;
  else if (activity === 'active' || activity === 'very_active') multiplier = 1.6;
  return Math.round(weightKg * multiplier);
}

export function calculateNutritionTargets(params: {
  weightKg: number;
  heightCm: number;
  ageYears: number;
  sex: 'male' | 'female' | 'other';
  activity: ActivityLevel;
  goal: HealthGoal;
}): NutritionTargets {
  const { weightKg, heightCm, ageYears, sex, activity, goal } = params;

  const bmr    = calculateBMR(weightKg, heightCm, ageYears, sex);
  const tdee   = calculateTDEE(bmr, activity);
  const calories = adjustForGoal(tdee, goal);

  const protein_g = estimateProtein(weightKg, goal, activity);
  const fat_g     = Math.round((calories * 0.28) / 9); // 28% from fat
  // Remaining from carbs
  const carbs_g   = Math.round((calories - (protein_g * 4) - (fat_g * 9)) / 4);

  return {
    calories,
    protein_g,
    carbs_g: Math.max(carbs_g, 100), // floor at 100g carbs
    fat_g,
    equation: 'Mifflin-St Jeor (Mifflin MD et al., JADA 1990)',
    notes: 'These are estimates based on population averages. Individual needs vary. Consult a registered dietitian or your doctor before making significant dietary changes. This is not a clinical prescription.',
  };
}

/**
 * Calculates age in years from a date of birth string (ISO format).
 */
export function calculateAge(dob: string): number {
  const today = new Date();
  const birth = new Date(dob);
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}

/**
 * Calculates BMI.
 */
export function calculateBMI(weightKg: number, heightCm: number): number {
  const h = heightCm / 100;
  return Math.round((weightKg / (h * h)) * 10) / 10;
}

export function bmiCategory(bmi: number): { label: string; color: string } {
  if (bmi < 18.5) return { label: 'Underweight', color: '#3b82f6' };
  if (bmi < 25)   return { label: 'Normal',      color: '#10b981' };
  if (bmi < 30)   return { label: 'Overweight',  color: '#f59e0b' };
  return             { label: 'Obese',       color: '#ef4444' };
}
