import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { ArrowRight, Heart, ShieldAlert } from 'lucide-react';
import { useApp, type SignUpProfile } from '@/context/AppContext';

const loginSchema = z.object({
  email: z.string().email('Enter a valid email address.'),
  password: z.string().min(8, 'Password must be at least 8 characters.'),
});

const signUpSchema = z.object({
  email: z.string().email('Enter a valid email address.'),
  password: z.string().min(8, 'Password must be at least 8 characters.'),
  confirmPassword: z.string(),
  name: z.string().min(2, 'Enter your full name.'),
  dob: z.string().min(1, 'Enter your date of birth.'),
  sex: z.enum(['male', 'female', 'other']),
  height_cm: z.coerce.number().min(50).max(250),
  weight_kg: z.coerce.number().min(10).max(300),
  goal: z.enum(['weight_loss', 'weight_gain', 'maintenance', 'muscle_gain']),
  activity_level: z.enum(['sedentary', 'light', 'moderate', 'active', 'very_active']),
  dietary_pref: z.enum(['vegetarian', 'non_vegetarian', 'vegan', 'eggetarian']),
  allergies: z.string(),
  medications: z.string(),
  conditions: z.string(),
  emergency_contact: z.string(),
}).refine(values => values.password === values.confirmPassword, {
  message: 'Passwords do not match.',
  path: ['confirmPassword'],
});

type LoginValues = z.infer<typeof loginSchema>;
type SignUpValues = z.infer<typeof signUpSchema>;

function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 sm:py-12">
      <div className="mx-auto max-w-2xl">
        <Link to="/login" className="mb-6 inline-flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-600 text-white"><Heart size={18} /></span>
          <span className="font-bold text-slate-800">HealthSaathi</span>
        </Link>
        <div className="mb-5 flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs leading-relaxed text-amber-900">
          <ShieldAlert size={15} className="mt-0.5 shrink-0" />
          <p>Demo authentication only. Accounts and health profiles stay in this browser; this is not secure production login. Do not use real health data or reuse important passwords.</p>
        </div>
        {children}
      </div>
    </main>
  );
}

function FieldError({ children }: { children?: string }) {
  return children ? <p className="mt-1 text-xs text-red-600">{children}</p> : null;
}

export function LoginPage() {
  const { isAuthenticated, signIn, signInDemo } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const [authError, setAuthError] = useState<string | null>(null);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
  });

  if (isAuthenticated) return <Navigate to="/" replace />;

  const destination = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname ?? '/';
  const onSubmit = async (values: LoginValues) => {
    setAuthError(null);
    try {
      await signIn(values.email, values.password);
      navigate(destination, { replace: true });
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : 'Could not sign in. Try again.');
    }
  };

  const enterDemo = () => {
    signInDemo();
    navigate('/', { replace: true });
  };

  return (
    <AuthShell>
      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
        <div className="mb-6">
          <p className="text-xs font-semibold uppercase tracking-wide text-teal-700">Welcome back</p>
          <h1 className="mt-1 text-2xl font-bold text-slate-900">Sign in</h1>
          <p className="mt-1 text-sm text-slate-500">Use the email and password you registered in this browser.</p>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="label" htmlFor="login-email">Email</label>
            <input id="login-email" type="email" autoComplete="email" className="input" {...register('email')} />
            <FieldError>{errors.email?.message}</FieldError>
          </div>
          <div>
            <label className="label" htmlFor="login-password">Password</label>
            <input id="login-password" type="password" autoComplete="current-password" className="input" {...register('password')} />
            <FieldError>{errors.password?.message}</FieldError>
          </div>
          {authError && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{authError}</p>}
          <button type="submit" className="btn-primary w-full justify-center" disabled={isSubmitting}>
            {isSubmitting ? 'Signing in...' : 'Sign in'} <ArrowRight size={15} />
          </button>
        </form>
        <div className="my-5 flex items-center gap-3 text-[10px] font-semibold uppercase text-slate-400">
          <span className="h-px flex-1 bg-slate-200" />or<span className="h-px flex-1 bg-slate-200" />
        </div>
        <button type="button" className="btn-secondary w-full justify-center" onClick={enterDemo}>Continue with demo profile</button>
        <p className="mt-5 text-center text-sm text-slate-600">
          New here? <Link className="font-semibold text-teal-700 hover:text-teal-800" to="/signup">Create an account</Link>
        </p>
      </section>
    </AuthShell>
  );
}

export function SignUpPage() {
  const { isAuthenticated, signUp } = useApp();
  const navigate = useNavigate();
  const [authError, setAuthError] = useState<string | null>(null);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<SignUpValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      sex: 'female', height_cm: 160, weight_kg: 60, goal: 'maintenance',
      activity_level: 'moderate', dietary_pref: 'vegetarian',
      allergies: '', medications: '', conditions: '', emergency_contact: '',
    },
  });

  if (isAuthenticated) return <Navigate to="/" replace />;

  const onSubmit = async (values: SignUpValues) => {
    setAuthError(null);
    const { email, password, confirmPassword: _confirmPassword, allergies, medications, conditions, emergency_contact, ...profileValues } = values;
    const profile: SignUpProfile = {
      ...profileValues,
      allergies: allergies.split(',').map(value => value.trim()).filter(Boolean),
      medications: medications.split(',').map(value => value.trim()).filter(Boolean),
      conditions: conditions.split(',').map(value => value.trim()).filter(Boolean),
      emergency_contact: emergency_contact.trim() || undefined,
      is_self: true,
    };

    try {
      await signUp(email, password, profile);
      navigate('/', { replace: true });
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : 'Could not create account. Try again.');
    }
  };

  return (
    <AuthShell>
      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
        <div className="mb-6">
          <p className="text-xs font-semibold uppercase tracking-wide text-teal-700">Create your account</p>
          <h1 className="mt-1 text-2xl font-bold text-slate-900">Sign up</h1>
          <p className="mt-1 text-sm text-slate-500">Your profile details will prefill your health profile.</p>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <fieldset className="space-y-4">
            <legend className="mb-2 text-sm font-bold text-slate-800">Account details</legend>
            <div>
              <label className="label" htmlFor="signup-email">Email</label>
              <input id="signup-email" type="email" autoComplete="email" className="input" {...register('email')} />
              <FieldError>{errors.email?.message}</FieldError>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className="label" htmlFor="signup-password">Password</label>
                <input id="signup-password" type="password" autoComplete="new-password" className="input" {...register('password')} />
                <FieldError>{errors.password?.message}</FieldError>
              </div>
              <div>
                <label className="label" htmlFor="signup-confirm">Confirm password</label>
                <input id="signup-confirm" type="password" autoComplete="new-password" className="input" {...register('confirmPassword')} />
                <FieldError>{errors.confirmPassword?.message}</FieldError>
              </div>
            </div>
          </fieldset>

          <fieldset className="space-y-4 border-t border-slate-100 pt-4">
            <legend className="mb-2 text-sm font-bold text-slate-800">Health profile</legend>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="label" htmlFor="signup-name">Full name</label>
                <input id="signup-name" autoComplete="name" className="input" {...register('name')} />
                <FieldError>{errors.name?.message}</FieldError>
              </div>
              <div>
                <label className="label" htmlFor="signup-dob">Date of birth</label>
                <input id="signup-dob" type="date" autoComplete="bday" className="input" {...register('dob')} />
                <FieldError>{errors.dob?.message}</FieldError>
              </div>
              <div>
                <label className="label" htmlFor="signup-sex">Sex</label>
                <select id="signup-sex" className="input" {...register('sex')}>
                  <option value="female">Female</option><option value="male">Male</option><option value="other">Other / prefer not to say</option>
                </select>
              </div>
              <div>
                <label className="label" htmlFor="signup-height">Height (cm)</label>
                <input id="signup-height" type="number" className="input" {...register('height_cm')} />
                <FieldError>{errors.height_cm?.message}</FieldError>
              </div>
              <div>
                <label className="label" htmlFor="signup-weight">Weight (kg)</label>
                <input id="signup-weight" type="number" step="0.1" className="input" {...register('weight_kg')} />
                <FieldError>{errors.weight_kg?.message}</FieldError>
              </div>
              <div>
                <label className="label" htmlFor="signup-goal">Health goal</label>
                <select id="signup-goal" className="input" {...register('goal')}>
                  <option value="weight_loss">Weight loss</option><option value="weight_gain">Weight gain</option><option value="maintenance">Maintenance</option><option value="muscle_gain">Muscle gain</option>
                </select>
              </div>
              <div>
                <label className="label" htmlFor="signup-activity">Activity level</label>
                <select id="signup-activity" className="input" {...register('activity_level')}>
                  <option value="sedentary">Sedentary</option><option value="light">Light</option><option value="moderate">Moderate</option><option value="active">Active</option><option value="very_active">Very active</option>
                </select>
              </div>
              <div>
                <label className="label" htmlFor="signup-diet">Dietary preference</label>
                <select id="signup-diet" className="input" {...register('dietary_pref')}>
                  <option value="vegetarian">Vegetarian</option><option value="non_vegetarian">Non-vegetarian</option><option value="vegan">Vegan</option><option value="eggetarian">Eggetarian</option>
                </select>
              </div>
              <div>
                <label className="label" htmlFor="signup-allergies">Allergies</label>
                <input id="signup-allergies" className="input" placeholder="Comma-separated" {...register('allergies')} />
              </div>
              <div>
                <label className="label" htmlFor="signup-medications">Medications</label>
                <input id="signup-medications" className="input" placeholder="Comma-separated" {...register('medications')} />
              </div>
              <div>
                <label className="label" htmlFor="signup-conditions">Health conditions</label>
                <input id="signup-conditions" className="input" placeholder="Comma-separated" {...register('conditions')} />
              </div>
              <div>
                <label className="label" htmlFor="signup-emergency">Emergency contact</label>
                <input id="signup-emergency" className="input" {...register('emergency_contact')} />
              </div>
            </div>
          </fieldset>

          {authError && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{authError}</p>}
          <button type="submit" className="btn-primary w-full justify-center" disabled={isSubmitting}>
            {isSubmitting ? 'Creating account...' : 'Create account'} <ArrowRight size={15} />
          </button>
        </form>
        <p className="mt-5 text-center text-sm text-slate-600">
          Already registered? <Link className="font-semibold text-teal-700 hover:text-teal-800" to="/login">Sign in</Link>
        </p>
      </section>
    </AuthShell>
  );
}
