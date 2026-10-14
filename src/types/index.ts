// ──────────────────────────────────────────────────────────────
// HEALTHSAATHI AI — Shared TypeScript Types
// ──────────────────────────────────────────────────────────────

export type Sex = 'male' | 'female' | 'other';
export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
export type DietaryPref = 'vegetarian' | 'non_vegetarian' | 'vegan' | 'eggetarian';
export type HealthGoal = 'weight_loss' | 'weight_gain' | 'maintenance' | 'muscle_gain';
export type ReminderType = 'medication' | 'appointment' | 'wellness' | 'follow_up';
export type EventType = 'report' | 'measurement' | 'appointment' | 'medication' | 'note';
export type ActionPriority = 'high' | 'medium' | 'low';
export type ActionStatus = 'pending' | 'in_progress' | 'completed' | 'dismissed';
export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';
export type SkinType = 'oily' | 'dry' | 'combination' | 'normal' | 'sensitive';

// ── Profile ───────────────────────────────────────────────────
export interface HealthProfile {
  id: string;
  name: string;
  dob: string; // ISO date
  sex: Sex;
  height_cm: number;
  weight_kg: number;
  goal: HealthGoal;
  activity_level: ActivityLevel;
  dietary_pref: DietaryPref;
  allergies: string[];
  medications: string[];
  conditions: string[];
  emergency_contact?: string;
  avatar?: string;
  is_self: boolean;
  relationship?: string;
  created_at: string;
  updated_at: string;
}

// ── Medical Report ────────────────────────────────────────────
export interface ReportObservation {
  test_name: string;
  value: string;
  unit: string;
  ref_range?: string;
  flag?: 'high' | 'low' | 'normal' | 'critical';
  explanation?: string;
}

export interface MedicalReport {
  id: string;
  profile_id: string;
  title: string;
  report_type: string;
  report_date: string;
  file_url?: string;
  source_file_name?: string;
  extracted_text?: string;
  observations: ReportObservation[];
  ai_summary?: string;
  lab_name?: string;
  uploaded_at: string;
}

// ── Timeline ──────────────────────────────────────────────────
export interface TimelineEvent {
  id: string;
  profile_id: string;
  event_type: EventType;
  title: string;
  description?: string;
  event_date: string;
  metadata?: Record<string, unknown>;
}

// ── Nutrition ─────────────────────────────────────────────────
export interface NutritionTargets {
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  equation: string;
  notes: string;
}

export interface FoodItem {
  id: string;
  name: string;
  serving_size: string;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  cost_inr?: number;
  category?: string;
}

export interface FoodLogEntry {
  id: string;
  profile_id: string;
  meal_type: MealType;
  food_name: string;
  quantity: number;
  unit: string;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  logged_at: string;
}

export interface MealPlanItem {
  meal_type: MealType;
  foods: Array<FoodItem & { quantity: number }>;
  total_calories: number;
  total_protein_g: number;
  total_carbs_g: number;
  total_fat_g: number;
}

// ── Reminders ─────────────────────────────────────────────────
export interface Reminder {
  id: string;
  profile_id: string;
  type: ReminderType;
  title: string;
  description?: string;
  schedule: string; // e.g. "Daily at 08:00"
  is_active: boolean;
  next_due: string;
  is_overdue?: boolean;
}

// ── Action Plan ───────────────────────────────────────────────
export interface ActionItem {
  id: string;
  profile_id: string;
  title: string;
  description?: string;
  priority: ActionPriority;
  due_date?: string;
  status: ActionStatus;
  related_report_id?: string;
  created_at: string;
}

// ── Chat ──────────────────────────────────────────────────────
export interface ChatMessage {
  id: string;
  role: 'user' | 'ai';
  content: string;
  timestamp: string;
  is_demo?: boolean;
}

// ── Wellness ──────────────────────────────────────────────────
export interface WellnessLog {
  id: string;
  profile_id: string;
  date: string;
  sleep_hours?: number;
  water_ml?: number;
  steps?: number;
  mood?: 1 | 2 | 3 | 4 | 5;
  notes?: string;
}

// ── Skin ──────────────────────────────────────────────────────
export interface SkinDiaryEntry {
  id: string;
  profile_id: string;
  date: string;
  skin_type?: SkinType;
  observations: string;
  products_used?: string[];
  photo_url?: string;
}

// ── Measurement ───────────────────────────────────────────────
export interface HealthMeasurement {
  id: string;
  profile_id: string;
  metric: string;
  value: number;
  unit: string;
  recorded_at: string;
  notes?: string;
}

// ── Symptom ───────────────────────────────────────────────────
export interface SymptomReport {
  symptom: string;
  duration: string;
  severity: 1 | 2 | 3 | 4 | 5;
  location?: string;
  associated_symptoms?: string[];
  notes?: string;
}
