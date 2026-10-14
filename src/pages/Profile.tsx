import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useApp, useActiveProfile } from '@/context/AppContext';
import { calculateAge, calculateBMI, bmiCategory } from '@/lib/nutritionCalculator';
import { formatDate } from '@/lib/utils';
import { Save, Edit3, User, Heart, AlertTriangle, Activity, Utensils, LogOut } from 'lucide-react';
import toast from 'react-hot-toast';
import type { HealthProfile } from '@/types';

const schema = z.object({
  name: z.string().min(1),
  dob: z.string().min(1),
  sex: z.enum(['male','female','other']),
  height_cm: z.coerce.number().min(50).max(250),
  weight_kg: z.coerce.number().min(10).max(300),
  goal: z.enum(['weight_loss','weight_gain','maintenance','muscle_gain']),
  activity_level: z.enum(['sedentary','light','moderate','active','very_active']),
  dietary_pref: z.enum(['vegetarian','non_vegetarian','vegan','eggetarian']),
  allergies: z.string(),
  medications: z.string(),
  conditions: z.string(),
  emergency_contact: z.string().optional(),
});
type FormValues = z.infer<typeof schema>;

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between py-2.5 border-b border-slate-100 last:border-0 gap-1">
      <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{label}</span>
      <span className="text-sm text-slate-800 font-medium">{value}</span>
    </div>
  );
}

export default function Profile() {
  const { updateProfile, signOut } = useApp();
  const navigate = useNavigate();
  const profile = useActiveProfile();
  const [editing, setEditing] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      ...profile,
      allergies:   profile?.allergies.join(', ') ?? '',
      medications: profile?.medications.join(', ') ?? '',
      conditions:  profile?.conditions.join(', ') ?? '',
    },
  });

  if (!profile) return null;

  const age    = calculateAge(profile.dob);
  const bmi    = calculateBMI(profile.weight_kg, profile.height_cm);
  const bmiCat = bmiCategory(bmi);

  const onSubmit = (data: FormValues) => {
    const updated: HealthProfile = {
      ...profile,
      ...data,
      allergies:   data.allergies.split(',').map(s => s.trim()).filter(Boolean),
      medications: data.medications.split(',').map(s => s.trim()).filter(Boolean),
      conditions:  data.conditions.split(',').map(s => s.trim()).filter(Boolean),
      updated_at:  new Date().toISOString(),
    };
    updateProfile(updated);
    setEditing(false);
    toast.success('Profile updated successfully!');
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="section-title text-xl">My Health Profile</h1>
          <p className="section-sub">Last updated: {formatDate(profile.updated_at)}</p>
        </div>
        <div className="flex gap-2">
          <button className={editing ? 'btn-secondary' : 'btn-primary'} onClick={() => setEditing(!editing)}>
            <Edit3 size={14} />{editing ? 'Cancel' : 'Edit Profile'}
          </button>
          <button className="btn-secondary" onClick={() => { signOut(); navigate('/login', { replace: true }); }}>
            <LogOut size={14} />Sign out
          </button>
        </div>
      </div>

      {/* Avatar + summary card */}
      <div className="card p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-teal flex items-center justify-center text-white text-2xl font-bold shadow-teal">
            {profile.name.split(' ').map(n => n[0]).join('').slice(0,2)}
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800">{profile.name}</h2>
            <p className="text-sm text-slate-500">{age} years · {profile.sex} · {profile.is_self ? 'This is you' : profile.relationship}</p>
            <div className="flex gap-2 mt-1.5">
              <span className="badge-teal">BMI {bmi}</span>
              <span className="badge" style={{ background: bmiCat.color + '18', color: bmiCat.color }}>{bmiCat.label}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {[
            { icon: User,      label: 'Age',      value: `${age} years` },
            { icon: Activity,  label: 'Weight',   value: `${profile.weight_kg} kg` },
            { icon: Heart,     label: 'Height',   value: `${profile.height_cm} cm` },
            { icon: Utensils,  label: 'Diet',     value: profile.dietary_pref.replace('_', ' ') },
          ].map(s => (
            <div key={s.label} className="bg-slate-50 rounded-xl p-3 text-center">
              <s.icon size={16} className="mx-auto text-teal-500 mb-1" />
              <p className="text-lg font-bold text-slate-800">{s.value}</p>
              <p className="text-[10px] text-slate-400 uppercase tracking-wide">{s.label}</p>
            </div>
          ))}
        </div>

        {!editing ? (
          <div>
            <InfoRow label="Goal" value={profile.goal.replace('_', ' ')} />
            <InfoRow label="Activity" value={profile.activity_level.replace('_', ' ')} />
            <InfoRow label="Dietary Preference" value={profile.dietary_pref.replace('_', ' ')} />
            <InfoRow label="Allergies" value={profile.allergies.join(', ') || 'None reported'} />
            <InfoRow label="Medications" value={profile.medications.join('; ') || 'None'} />
            <InfoRow label="Conditions" value={profile.conditions.join('; ') || 'None'} />
            {profile.emergency_contact && <InfoRow label="Emergency Contact" value={profile.emergency_contact} />}
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="label">Full Name</label>
                <input className="input" {...register('name')} />
                {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
              </div>
              <div>
                <label className="label">Date of Birth</label>
                <input type="date" className="input" {...register('dob')} />
              </div>
              <div>
                <label className="label">Sex</label>
                <select className="input" {...register('sex')}>
                  <option value="female">Female</option>
                  <option value="male">Male</option>
                  <option value="other">Other / Prefer not to say</option>
                </select>
              </div>
              <div>
                <label className="label">Height (cm)</label>
                <input type="number" className="input" {...register('height_cm')} />
              </div>
              <div>
                <label className="label">Weight (kg)</label>
                <input type="number" step="0.1" className="input" {...register('weight_kg')} />
              </div>
              <div>
                <label className="label">Health Goal</label>
                <select className="input" {...register('goal')}>
                  <option value="weight_loss">Weight Loss</option>
                  <option value="weight_gain">Weight Gain</option>
                  <option value="maintenance">Maintenance</option>
                  <option value="muscle_gain">Muscle Gain</option>
                </select>
              </div>
              <div>
                <label className="label">Activity Level</label>
                <select className="input" {...register('activity_level')}>
                  <option value="sedentary">Sedentary (desk job, no exercise)</option>
                  <option value="light">Light (1–3 days/week)</option>
                  <option value="moderate">Moderate (3–5 days/week)</option>
                  <option value="active">Active (6–7 days/week)</option>
                  <option value="very_active">Very Active (physical job)</option>
                </select>
              </div>
              <div>
                <label className="label">Dietary Preference</label>
                <select className="input" {...register('dietary_pref')}>
                  <option value="vegetarian">Vegetarian</option>
                  <option value="non_vegetarian">Non-Vegetarian</option>
                  <option value="vegan">Vegan</option>
                  <option value="eggetarian">Eggetarian</option>
                </select>
              </div>
            </div>
            <div>
              <label className="label">Allergies (comma-separated)</label>
              <input className="input" placeholder="e.g. Peanuts, Shellfish" {...register('allergies')} />
            </div>
            <div>
              <label className="label">Current Medications (comma-separated)</label>
              <input className="input" placeholder="e.g. Vitamin D3 60,000 IU weekly" {...register('medications')} />
            </div>
            <div>
              <label className="label">Health Conditions (comma-separated)</label>
              <input className="input" placeholder="e.g. Hypothyroidism" {...register('conditions')} />
            </div>
            <div>
              <label className="label">Emergency Contact (optional)</label>
              <input className="input" placeholder="Name — Phone number" {...register('emergency_contact')} />
            </div>
            <div className="flex gap-2 pt-2">
              <button type="submit" className="btn-primary"><Save size={14} />Save Profile</button>
              <button type="button" className="btn-secondary" onClick={() => setEditing(false)}>Cancel</button>
            </div>
          </form>
        )}
      </div>

      {/* Safety note */}
      <div className="flex items-start gap-2 p-3 rounded-xl bg-amber-50 border border-amber-100 text-xs text-amber-800">
        <AlertTriangle size={13} className="flex-shrink-0 mt-0.5" />
        <span>Profile data is stored locally in your browser (demo mode). No data is sent to any server. Update medications and conditions with your doctor's guidance.</span>
      </div>
    </div>
  );
}
