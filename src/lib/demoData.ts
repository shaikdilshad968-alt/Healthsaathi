import type {
  HealthProfile, MedicalReport, TimelineEvent, FoodLogEntry,
  Reminder, ActionItem, ChatMessage, WellnessLog, HealthMeasurement,
  NutritionTargets, MealPlanItem, FoodItem,
} from '@/types';

// ──────────────────────────────────────────────────────────────
// DEMO PROFILES
// ──────────────────────────────────────────────────────────────
export const DEMO_PROFILES: HealthProfile[] = [
  {
    id: 'profile-priya',
    name: 'Priya Sharma',
    dob: '1990-03-15',
    sex: 'female',
    height_cm: 162,
    weight_kg: 63,
    goal: 'weight_loss',
    activity_level: 'moderate',
    dietary_pref: 'vegetarian',
    allergies: ['Peanuts', 'Shellfish'],
    medications: ['Vitamin D3 (60,000 IU weekly)', 'Iron supplement (65 mg daily)'],
    conditions: ['Mild anaemia', 'Hypothyroidism (under control)'],
    emergency_contact: 'Ravi Sharma — 9876543210',
    is_self: true,
    created_at: '2026-01-10T08:00:00Z',
    updated_at: '2026-10-02T10:00:00Z',
  },
  {
    id: 'profile-ravi',
    name: 'Ravi Sharma',
    dob: '1987-07-22',
    sex: 'male',
    height_cm: 175,
    weight_kg: 82,
    goal: 'weight_loss',
    activity_level: 'light',
    dietary_pref: 'non_vegetarian',
    allergies: [],
    medications: ['Atorvastatin 10 mg (nightly)'],
    conditions: ['Borderline high LDL cholesterol', 'Pre-hypertension'],
    is_self: false,
    relationship: 'Husband',
    created_at: '2026-01-10T08:00:00Z',
    updated_at: '2026-09-20T09:00:00Z',
  },
  {
    id: 'profile-ananya',
    name: 'Ananya Sharma',
    dob: '2016-11-05',
    sex: 'female',
    height_cm: 128,
    weight_kg: 26,
    goal: 'maintenance',
    activity_level: 'active',
    dietary_pref: 'vegetarian',
    allergies: ['Milk (mild lactose sensitivity)'],
    medications: [],
    conditions: [],
    is_self: false,
    relationship: 'Daughter',
    created_at: '2026-01-10T08:00:00Z',
    updated_at: '2026-08-15T08:00:00Z',
  },
];

export const ACTIVE_PROFILE_ID = 'profile-priya';

// ──────────────────────────────────────────────────────────────
// DEMO MEDICAL REPORTS
// ──────────────────────────────────────────────────────────────
export const DEMO_REPORTS: MedicalReport[] = [
  {
    id: 'report-cbc-oct',
    profile_id: 'profile-priya',
    title: 'Complete Blood Count (CBC)',
    report_type: 'CBC',
    report_date: '2026-10-01',
    lab_name: 'Apollo Diagnostics, Hyderabad',
    observations: [
      { test_name: 'Haemoglobin', value: '10.8', unit: 'g/dL', ref_range: '12.0–16.0', flag: 'low', explanation: 'Haemoglobin is below normal range, consistent with mild anaemia. This may cause fatigue and breathlessness.' },
      { test_name: 'RBC Count', value: '3.9', unit: 'million/µL', ref_range: '4.0–5.2', flag: 'low', explanation: 'Slightly below range. Often seen alongside low haemoglobin in iron-deficiency anaemia.' },
      { test_name: 'WBC Count', value: '7200', unit: '/µL', ref_range: '4000–11000', flag: 'normal', explanation: 'White blood cell count is within normal range — no active infection indicated.' },
      { test_name: 'Platelets', value: '215000', unit: '/µL', ref_range: '150000–400000', flag: 'normal', explanation: 'Platelet count is normal.' },
      { test_name: 'MCV', value: '72', unit: 'fL', ref_range: '80–100', flag: 'low', explanation: 'Mean Corpuscular Volume is low, suggesting small red blood cells — a classic sign of iron-deficiency anaemia.' },
      { test_name: 'MCH', value: '22', unit: 'pg', ref_range: '27–33', flag: 'low', explanation: 'Low MCH further supports iron-deficiency anaemia.' },
    ],
    ai_summary: '⚠️ This CBC report suggests mild iron-deficiency anaemia — indicated by low Haemoglobin (10.8 g/dL), low MCV (72 fL), and low MCH (22 pg). The low red cell count and small cell size point to insufficient iron. This is consistent with your documented iron supplement use. Continue your prescribed iron supplementation and discuss with your doctor about dietary sources of iron.',
    uploaded_at: '2026-10-02T09:00:00Z',
  },
  {
    id: 'report-cbc-apr',
    profile_id: 'profile-priya',
    title: 'Complete Blood Count (CBC)',
    report_type: 'CBC',
    report_date: '2026-04-01',
    lab_name: 'Apollo Diagnostics, Hyderabad',
    observations: [
      { test_name: 'Haemoglobin', value: '9.6', unit: 'g/dL', ref_range: '12.0–16.0', flag: 'low', explanation: 'Below normal range.' },
      { test_name: 'RBC Count', value: '3.6', unit: 'million/µL', ref_range: '4.0–5.2', flag: 'low', explanation: 'Below normal range.' },
      { test_name: 'WBC Count', value: '6800', unit: '/µL', ref_range: '4000–11000', flag: 'normal' },
      { test_name: 'Platelets', value: '198000', unit: '/µL', ref_range: '150000–400000', flag: 'normal' },
      { test_name: 'MCV', value: '68', unit: 'fL', ref_range: '80–100', flag: 'low' },
      { test_name: 'MCH', value: '20', unit: 'pg', ref_range: '27–33', flag: 'low' },
    ],
    ai_summary: 'CBC from April 2026 showing moderate anaemia with Hb of 9.6 g/dL.',
    uploaded_at: '2026-04-02T09:00:00Z',
  },
  {
    id: 'report-lipid-ravi',
    profile_id: 'profile-ravi',
    title: 'Lipid Profile',
    report_type: 'Lipid Panel',
    report_date: '2026-09-15',
    lab_name: 'Vijaya Diagnostics, Hyderabad',
    observations: [
      { test_name: 'Total Cholesterol', value: '218', unit: 'mg/dL', ref_range: '<200', flag: 'high', explanation: 'Slightly above the desirable level of 200 mg/dL. Monitoring and lifestyle changes are advisable.' },
      { test_name: 'LDL Cholesterol', value: '142', unit: 'mg/dL', ref_range: '<130', flag: 'high', explanation: '"Bad" cholesterol is above optimal. Diet changes and medication (if prescribed) help reduce this.' },
      { test_name: 'HDL Cholesterol', value: '38', unit: 'mg/dL', ref_range: '>40', flag: 'low', explanation: '"Good" cholesterol is slightly low. Regular exercise can help raise HDL levels.' },
      { test_name: 'Triglycerides', value: '175', unit: 'mg/dL', ref_range: '<150', flag: 'high', explanation: 'Triglycerides are mildly elevated. Reducing refined carbohydrates and sugar can help.' },
    ],
    ai_summary: '⚠️ Lipid profile shows borderline high total cholesterol and LDL with low HDL — consistent with the documented pre-hypertension and Atorvastatin prescription. Dietary modifications and regular physical activity are recommended. Please discuss this report at your next cardiology follow-up.',
    uploaded_at: '2026-09-16T10:00:00Z',
  },
  {
    id: 'report-thyroid',
    profile_id: 'profile-priya',
    title: 'Thyroid Function Test (TFT)',
    report_type: 'Thyroid',
    report_date: '2026-10-01',
    lab_name: 'Apollo Diagnostics, Hyderabad',
    observations: [
      { test_name: 'TSH', value: '3.8', unit: 'µIU/mL', ref_range: '0.5–5.0', flag: 'normal', explanation: 'TSH (Thyroid Stimulating Hormone) is within normal range, indicating your thyroid is well-controlled.' },
      { test_name: 'T3', value: '112', unit: 'ng/dL', ref_range: '80–200', flag: 'normal', explanation: 'T3 level is normal.' },
      { test_name: 'T4', value: '8.5', unit: 'µg/dL', ref_range: '5.0–12.0', flag: 'normal', explanation: 'T4 level is normal.' },
    ],
    ai_summary: '✅ Thyroid function is within normal limits. TSH, T3, and T4 are all in the normal range — your hypothyroidism appears well-controlled with current management.',
    uploaded_at: '2026-10-02T09:00:00Z',
  },
];

// ──────────────────────────────────────────────────────────────
// DEMO TIMELINE EVENTS
// ──────────────────────────────────────────────────────────────
export const DEMO_TIMELINE: TimelineEvent[] = [
  { id: 'tl-1', profile_id: 'profile-priya', event_type: 'report', title: 'CBC & Thyroid Test', description: 'Apollo Diagnostics — Oct 2026', event_date: '2026-10-01' },
  { id: 'tl-2', profile_id: 'profile-priya', event_type: 'appointment', title: 'Gynaecologist Follow-up', description: 'Dr. Sunita Reddy, Yashoda Hospital', event_date: '2026-09-28' },
  { id: 'tl-3', profile_id: 'profile-priya', event_type: 'measurement', title: 'Weight: 63 kg', description: 'Home measurement', event_date: '2026-09-25' },
  { id: 'tl-4', profile_id: 'profile-priya', event_type: 'medication', title: 'Started Iron Supplement', description: 'Ferrous sulphate 65 mg — prescribed by Dr. Sunita Reddy', event_date: '2026-09-10' },
  { id: 'tl-5', profile_id: 'profile-priya', event_type: 'report', title: 'CBC (April 2026)', description: 'Apollo Diagnostics — follow-up for anaemia', event_date: '2026-04-01' },
  { id: 'tl-6', profile_id: 'profile-priya', event_type: 'note', title: 'Noticed increased fatigue', description: 'Feeling tired after climbing stairs — noted for doctor', event_date: '2026-03-15' },
  { id: 'tl-7', profile_id: 'profile-priya', event_type: 'measurement', title: 'Weight: 65 kg', description: 'Clinic measurement', event_date: '2026-01-20' },
];

// ──────────────────────────────────────────────────────────────
// DEMO FOOD LOG
// ──────────────────────────────────────────────────────────────
export const DEMO_FOOD_LOG: FoodLogEntry[] = [
  { id: 'fl-1', profile_id: 'profile-priya', meal_type: 'breakfast', food_name: 'Oats with milk', quantity: 1, unit: 'bowl', calories: 280, protein_g: 12, carbs_g: 48, fat_g: 6, logged_at: new Date().toISOString() },
  { id: 'fl-2', profile_id: 'profile-priya', meal_type: 'breakfast', food_name: 'Banana', quantity: 1, unit: 'medium', calories: 89, protein_g: 1.1, carbs_g: 23, fat_g: 0.3, logged_at: new Date().toISOString() },
  { id: 'fl-3', profile_id: 'profile-priya', meal_type: 'lunch', food_name: 'Dal rice (toor dal)', quantity: 1, unit: 'plate', calories: 380, protein_g: 14, carbs_g: 65, fat_g: 8, logged_at: new Date().toISOString() },
  { id: 'fl-4', profile_id: 'profile-priya', meal_type: 'lunch', food_name: 'Palak sabzi', quantity: 1, unit: 'katori', calories: 95, protein_g: 4, carbs_g: 8, fat_g: 5, logged_at: new Date().toISOString() },
  { id: 'fl-5', profile_id: 'profile-priya', meal_type: 'snack', food_name: 'Roasted chana', quantity: 30, unit: 'g', calories: 120, protein_g: 7, carbs_g: 18, fat_g: 2, logged_at: new Date().toISOString() },
  { id: 'fl-6', profile_id: 'profile-priya', meal_type: 'dinner', food_name: 'Multigrain roti', quantity: 1, unit: '2 rotis (60g)', calories: 160, protein_g: 6, carbs_g: 30, fat_g: 3, logged_at: new Date().toISOString() },
  { id: 'fl-7', profile_id: 'profile-priya', meal_type: 'dinner', food_name: 'Chana dal', quantity: 1, unit: '1 katori (150g)', calories: 160, protein_g: 10, carbs_g: 25, fat_g: 3, logged_at: new Date().toISOString() },
  { id: 'fl-8', profile_id: 'profile-priya', meal_type: 'dinner', food_name: 'Mixed vegetable sabzi', quantity: 1, unit: '1 katori (100g)', calories: 80, protein_g: 2.5, carbs_g: 12, fat_g: 3, logged_at: new Date().toISOString() },
];

// ──────────────────────────────────────────────────────────────
// DEMO REMINDERS
// ──────────────────────────────────────────────────────────────
export const DEMO_REMINDERS: Reminder[] = [
  { id: 'rem-1', profile_id: 'profile-priya', type: 'medication', title: 'Iron Supplement', description: 'Ferrous sulphate 65 mg with orange juice', schedule: 'Daily at 08:00 AM', is_active: true, next_due: new Date().toISOString(), is_overdue: false },
  { id: 'rem-2', profile_id: 'profile-priya', type: 'medication', title: 'Vitamin D3', description: '60,000 IU once a week (Sunday)', schedule: 'Weekly on Sunday', is_active: true, next_due: new Date().toISOString(), is_overdue: false },
  { id: 'rem-3', profile_id: 'profile-priya', type: 'appointment', title: 'Next CBC Follow-up', description: 'Re-test haemoglobin levels — Dr. Sunita Reddy', schedule: 'On 2026-12-01', is_active: true, next_due: '2026-12-01T09:00:00Z', is_overdue: false },
  { id: 'rem-4', profile_id: 'profile-ravi', type: 'medication', title: 'Atorvastatin', description: '10 mg at bedtime', schedule: 'Daily at 10:00 PM', is_active: true, next_due: new Date().toISOString(), is_overdue: false },
  { id: 'rem-5', profile_id: 'profile-priya', type: 'wellness', title: 'Evening Walk', description: '30 minutes brisk walking', schedule: 'Daily at 06:00 PM', is_active: true, next_due: new Date().toISOString(), is_overdue: true },
];

// ──────────────────────────────────────────────────────────────
// DEMO ACTION PLAN
// ──────────────────────────────────────────────────────────────
export const DEMO_ACTIONS: ActionItem[] = [
  { id: 'act-1', profile_id: 'profile-priya', title: 'Schedule follow-up CBC test', description: 'Check haemoglobin improvement after 2 months of iron therapy', priority: 'high', due_date: '2026-12-01', status: 'pending', related_report_id: 'report-cbc-oct', created_at: '2026-10-02T09:00:00Z' },
  { id: 'act-2', profile_id: 'profile-priya', title: 'Add iron-rich foods to diet', description: 'Include spinach, rajma, dates, and fortified cereals daily', priority: 'high', due_date: '2026-10-15', status: 'in_progress', created_at: '2026-10-02T09:00:00Z' },
  { id: 'act-3', profile_id: 'profile-priya', title: '30-min walk, 5 days/week', description: 'Supports energy levels and metabolic health', priority: 'medium', due_date: '2026-10-31', status: 'in_progress', created_at: '2026-10-02T09:00:00Z' },
  { id: 'act-4', profile_id: 'profile-priya', title: 'Drink 2.5 L water daily', description: 'Helps absorption and general health', priority: 'low', status: 'pending', created_at: '2026-10-02T09:00:00Z' },
  { id: 'act-5', profile_id: 'profile-priya', title: 'Log meals for 2 weeks', description: 'Track protein and iron intake patterns', priority: 'medium', due_date: '2026-10-16', status: 'pending', created_at: '2026-10-02T09:00:00Z' },
];

// ──────────────────────────────────────────────────────────────
// DEMO CHAT MESSAGES
// ──────────────────────────────────────────────────────────────
export const DEMO_CHAT_MESSAGES: ChatMessage[] = [
  { id: 'msg-1', role: 'ai', content: 'Namaste Priya! 👋 I\'m HealthSaathi, your personal health copilot. I can see your recent CBC report shows low haemoglobin. How are you feeling today? Any specific questions about your health?', timestamp: new Date(Date.now() - 3600000).toISOString(), is_demo: true },
  { id: 'msg-2', role: 'user', content: 'I feel tired most of the time. Is it because of my low haemoglobin?', timestamp: new Date(Date.now() - 3000000).toISOString() },
  { id: 'msg-3', role: 'ai', content: 'Yes, that\'s very likely! Your haemoglobin is 10.8 g/dL (normal for women is 12–16 g/dL). Low haemoglobin means your blood carries less oxygen — causing fatigue, especially with any physical effort.\n\n**What can help:**\n- 🥬 Iron-rich foods: palak, rajma, til, dates, fortified atta\n- 🍊 Vitamin C with iron: lemon juice with your iron tablet (you\'re already taking ferrous sulphate)\n- 😴 Prioritise 7–8 hours of sleep\n- 🏃 Light walks (avoid heavy exercise until Hb improves)\n\nYour next follow-up test is planned for December — that will show if the iron therapy is working. Please consult your doctor if fatigue worsens or you feel breathless at rest.\n\n*HealthSaathi provides general educational information, not a medical diagnosis.*', timestamp: new Date(Date.now() - 2800000).toISOString(), is_demo: true },
];

// ──────────────────────────────────────────────────────────────
// DEMO NUTRITION TARGETS (for Priya)
// ──────────────────────────────────────────────────────────────
export const DEMO_NUTRITION_TARGETS: NutritionTargets = {
  calories: 1680,
  protein_g: 63,
  carbs_g: 210,
  fat_g: 56,
  equation: 'Mifflin-St Jeor (moderate deficit for weight loss goal)',
  notes: 'Estimates only. Adjust based on progress and doctor guidance. Not a clinical prescription.',
};

// ──────────────────────────────────────────────────────────────
// DEMO WELLNESS LOGS
// ──────────────────────────────────────────────────────────────
export const DEMO_WELLNESS_LOGS: WellnessLog[] = [
  { id: 'wl-1', profile_id: 'profile-priya', date: '2026-10-01', sleep_hours: 7, water_ml: 2200, steps: 4800, mood: 3 },
  { id: 'wl-2', profile_id: 'profile-priya', date: '2026-10-02', sleep_hours: 6.5, water_ml: 1800, steps: 3200, mood: 2 },
  { id: 'wl-3', profile_id: 'profile-priya', date: '2026-10-03', sleep_hours: 7.5, water_ml: 2500, steps: 6100, mood: 4 },
  { id: 'wl-4', profile_id: 'profile-priya', date: '2026-10-04', sleep_hours: 8, water_ml: 2800, steps: 7200, mood: 4 },
  { id: 'wl-5', profile_id: 'profile-priya', date: '2026-10-05', sleep_hours: 6, water_ml: 1600, steps: 2900, mood: 2 },
  { id: 'wl-6', profile_id: 'profile-priya', date: '2026-10-06', sleep_hours: 7, water_ml: 2400, steps: 5500, mood: 3 },
  { id: 'wl-7', profile_id: 'profile-priya', date: '2026-10-07', sleep_hours: 7.5, water_ml: 2600, steps: 8200, mood: 5 },
];

// ──────────────────────────────────────────────────────────────
// DEMO WEIGHT HISTORY
// ──────────────────────────────────────────────────────────────
export const DEMO_WEIGHT_HISTORY: HealthMeasurement[] = [
  { id: 'm1', profile_id: 'profile-priya', metric: 'weight', value: 65, unit: 'kg', recorded_at: '2026-01-20T08:00:00Z' },
  { id: 'm2', profile_id: 'profile-priya', metric: 'weight', value: 64.5, unit: 'kg', recorded_at: '2026-03-01T08:00:00Z' },
  { id: 'm3', profile_id: 'profile-priya', metric: 'weight', value: 64.2, unit: 'kg', recorded_at: '2026-05-01T08:00:00Z' },
  { id: 'm4', profile_id: 'profile-priya', metric: 'weight', value: 63.8, unit: 'kg', recorded_at: '2026-07-01T08:00:00Z' },
  { id: 'm5', profile_id: 'profile-priya', metric: 'weight', value: 63.5, unit: 'kg', recorded_at: '2026-09-01T08:00:00Z' },
  { id: 'm6', profile_id: 'profile-priya', metric: 'weight', value: 63, unit: 'kg', recorded_at: '2026-10-01T08:00:00Z' },
];

// ──────────────────────────────────────────────────────────────
// DEMO MEAL PLAN (Indian Foods)
// ──────────────────────────────────────────────────────────────
export const DEMO_MEAL_PLAN: MealPlanItem[] = [
  {
    meal_type: 'breakfast',
    foods: [
      { id: 'f1', name: 'Oats upma', serving_size: '1 bowl (200g)', calories: 250, protein_g: 8, carbs_g: 42, fat_g: 6, cost_inr: 20, quantity: 1 },
      { id: 'f2', name: 'Low-fat curd', serving_size: '150g', calories: 75, protein_g: 6, carbs_g: 8, fat_g: 2, cost_inr: 10, quantity: 1 },
      { id: 'f3', name: 'Banana', serving_size: '1 medium', calories: 89, protein_g: 1.1, carbs_g: 23, fat_g: 0.3, cost_inr: 8, quantity: 1 },
    ],
    total_calories: 414, total_protein_g: 15.1, total_carbs_g: 73, total_fat_g: 8.3,
  },
  {
    meal_type: 'lunch',
    foods: [
      { id: 'f4', name: 'Brown rice', serving_size: '1 cup cooked (180g)', calories: 215, protein_g: 5, carbs_g: 45, fat_g: 1.8, cost_inr: 15, quantity: 1 },
      { id: 'f5', name: 'Rajma curry', serving_size: '1 katori (150g)', calories: 155, protein_g: 9, carbs_g: 24, fat_g: 3, cost_inr: 30, quantity: 1 },
      { id: 'f6', name: 'Palak sabzi', serving_size: '1 katori (100g)', calories: 95, protein_g: 4, carbs_g: 8, fat_g: 5, cost_inr: 20, quantity: 1 },
      { id: 'f7', name: 'Salad (cucumber, tomato)', serving_size: '1 plate', calories: 40, protein_g: 1.5, carbs_g: 8, fat_g: 0.5, cost_inr: 15, quantity: 1 },
    ],
    total_calories: 505, total_protein_g: 19.5, total_carbs_g: 85, total_fat_g: 10.3,
  },
  {
    meal_type: 'snack',
    foods: [
      { id: 'f8', name: 'Roasted chana', serving_size: '30g', calories: 120, protein_g: 7, carbs_g: 18, fat_g: 2, cost_inr: 10, quantity: 1 },
      { id: 'f9', name: 'Jaggery piece', serving_size: '10g', calories: 38, protein_g: 0.1, carbs_g: 10, fat_g: 0, cost_inr: 3, quantity: 1 },
    ],
    total_calories: 158, total_protein_g: 7.1, total_carbs_g: 28, total_fat_g: 2,
  },
  {
    meal_type: 'dinner',
    foods: [
      { id: 'f10', name: 'Multigrain roti', serving_size: '2 rotis (60g)', calories: 160, protein_g: 6, carbs_g: 30, fat_g: 3, cost_inr: 10, quantity: 1 },
      { id: 'f11', name: 'Chana dal', serving_size: '1 katori (150g)', calories: 160, protein_g: 10, carbs_g: 25, fat_g: 3, cost_inr: 20, quantity: 1 },
      { id: 'f12', name: 'Mixed vegetable sabzi', serving_size: '1 katori (100g)', calories: 80, protein_g: 2.5, carbs_g: 12, fat_g: 3, cost_inr: 25, quantity: 1 },
    ],
    total_calories: 400, total_protein_g: 18.5, total_carbs_g: 67, total_fat_g: 9,
  },
];

// ──────────────────────────────────────────────────────────────
// INDIAN FOOD DATABASE (sample — curated, clearly labelled)
// ──────────────────────────────────────────────────────────────
export const INDIAN_FOODS: Omit<FoodItem, 'id'>[] = [
  { name: 'Idli', serving_size: '2 pieces (80g)', calories: 77, protein_g: 2.6, carbs_g: 16, fat_g: 0.4, cost_inr: 15, category: 'South Indian' },
  { name: 'Dosa (plain)', serving_size: '1 dosa (80g)', calories: 120, protein_g: 3.5, carbs_g: 22, fat_g: 2.5, cost_inr: 20, category: 'South Indian' },
  { name: 'Sambar (katori)', serving_size: '150ml', calories: 65, protein_g: 3, carbs_g: 10, fat_g: 1.5, cost_inr: 10, category: 'South Indian' },
  { name: 'Upma', serving_size: '1 plate (150g)', calories: 165, protein_g: 4, carbs_g: 30, fat_g: 4, cost_inr: 20, category: 'South Indian' },
  { name: 'Poha', serving_size: '1 plate (150g)', calories: 180, protein_g: 3, carbs_g: 35, fat_g: 3.5, cost_inr: 15, category: 'Breakfast' },
  { name: 'Paratha (wheat)', serving_size: '1 medium (80g)', calories: 260, protein_g: 6, carbs_g: 38, fat_g: 9, cost_inr: 15, category: 'North Indian' },
  { name: 'Dal (toor)', serving_size: '1 katori (150g)', calories: 130, protein_g: 8.5, carbs_g: 22, fat_g: 1.5, cost_inr: 20, category: 'Lentils' },
  { name: 'Rajma curry', serving_size: '1 katori (150g)', calories: 155, protein_g: 9, carbs_g: 24, fat_g: 3, cost_inr: 30, category: 'Lentils' },
  { name: 'Chana dal', serving_size: '1 katori (150g)', calories: 160, protein_g: 10, carbs_g: 25, fat_g: 3, cost_inr: 20, category: 'Lentils' },
  { name: 'Paneer (100g)', serving_size: '100g', calories: 265, protein_g: 18, carbs_g: 3, fat_g: 20, cost_inr: 45, category: 'Dairy' },
  { name: 'Egg (boiled)', serving_size: '1 large (50g)', calories: 78, protein_g: 6, carbs_g: 0.6, fat_g: 5, cost_inr: 8, category: 'Protein' },
  { name: 'Chicken breast (cooked)', serving_size: '100g', calories: 165, protein_g: 31, carbs_g: 0, fat_g: 3.6, cost_inr: 80, category: 'Protein' },
  { name: 'Brown rice (cooked)', serving_size: '1 cup (180g)', calories: 215, protein_g: 5, carbs_g: 45, fat_g: 1.8, cost_inr: 15, category: 'Grains' },
  { name: 'White rice (cooked)', serving_size: '1 cup (180g)', calories: 240, protein_g: 4.4, carbs_g: 53, fat_g: 0.4, cost_inr: 10, category: 'Grains' },
  { name: 'Roti (wheat)', serving_size: '1 medium (30g)', calories: 80, protein_g: 3, carbs_g: 15, fat_g: 1.5, cost_inr: 5, category: 'Grains' },
  { name: 'Palak sabzi', serving_size: '1 katori (100g)', calories: 95, protein_g: 4, carbs_g: 8, fat_g: 5, cost_inr: 20, category: 'Vegetables' },
  { name: 'Curd (dahi)', serving_size: '150g', calories: 90, protein_g: 6, carbs_g: 10, fat_g: 3, cost_inr: 12, category: 'Dairy' },
  { name: 'Milk (full fat)', serving_size: '200ml', calories: 130, protein_g: 6.5, carbs_g: 9.5, fat_g: 7, cost_inr: 20, category: 'Dairy' },
  { name: 'Banana', serving_size: '1 medium (120g)', calories: 105, protein_g: 1.3, carbs_g: 27, fat_g: 0.4, cost_inr: 10, category: 'Fruits' },
  { name: 'Apple', serving_size: '1 medium (180g)', calories: 95, protein_g: 0.5, carbs_g: 25, fat_g: 0.3, cost_inr: 25, category: 'Fruits' },
  { name: 'Roasted chana', serving_size: '30g', calories: 120, protein_g: 7, carbs_g: 18, fat_g: 2, cost_inr: 10, category: 'Snacks' },
  { name: 'Peanuts (roasted)', serving_size: '30g', calories: 170, protein_g: 7, carbs_g: 5, fat_g: 14, cost_inr: 8, category: 'Snacks' },
  { name: 'Oats (cooked)', serving_size: '1 bowl (200g)', calories: 150, protein_g: 5, carbs_g: 27, fat_g: 3, cost_inr: 20, category: 'Breakfast' },
  { name: 'Masala chai (with milk)', serving_size: '200ml', calories: 100, protein_g: 3, carbs_g: 14, fat_g: 4, cost_inr: 10, category: 'Beverages' },
  { name: 'Mixed vegetable sabzi', serving_size: '1 katori (100g)', calories: 80, protein_g: 2.5, carbs_g: 12, fat_g: 3, cost_inr: 25, category: 'Vegetables' },
  { name: 'Fish curry (rohu)', serving_size: '1 piece + gravy (150g)', calories: 180, protein_g: 22, carbs_g: 8, fat_g: 7, cost_inr: 70, category: 'Protein' },
  { name: 'Sprouts (mixed)', serving_size: '1 katori (100g)', calories: 58, protein_g: 4, carbs_g: 10, fat_g: 0.5, cost_inr: 15, category: 'Protein' },
  { name: 'Dates (khajoor)', serving_size: '3 pieces (30g)', calories: 83, protein_g: 0.7, carbs_g: 22, fat_g: 0.1, cost_inr: 12, category: 'Fruits' },
];
