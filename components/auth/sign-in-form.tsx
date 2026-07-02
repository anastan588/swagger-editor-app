'use client';

import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';

import { Link, useRouter } from '@/i18n/navigation';
import { createClient } from '@/lib/supabase/client';
import { SignInFormData, signInSchema } from '@/lib/validation/auth';

import { Button } from '../ui/button';

export const SignInForm = () => {
  const t = useTranslations('Auth');
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignInFormData>({ mode: 'onSubmit', resolver: zodResolver(signInSchema) });

  const onSubmit = async (data: SignInFormData) => {
    setServerError(null);
    const supabase = createClient();

    const { error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });
    if (error) {
      setServerError(t('errors.invalidCredentials'));
      return;
    }

    router.push('/');
    router.refresh();
  };
  return (
    <form className="flex flex-col gap-4 w-full" onSubmit={handleSubmit(onSubmit)}>
      <h1>{t('signInTitle')}</h1>
      {serverError ? <div className="text-red-500 text-sm bg-red-50 p-3 rounded-md">{serverError}</div> : null}
      <div className="flex flex-col gap-1">
        <label htmlFor="email">{t('email')}</label>
        <input
          {...register('email')}
          className="border rounded-md px-3 py-2"
          id="email"
          placeholder={t('emailPlaceholder')}
          type="email"
        />
        {errors.email ? (
          <span className="text-red-500 text-xs">{t(`errors.${errors.email.message}` as Parameters<typeof t>[0])}</span>
        ) : null}
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="password">{t('password')}</label>
        <input
          {...register('password')}
          className="border rounded-md px-3 py-2"
          id="password"
          placeholder={t('passwordPlaceholder')}
          type="password"
        />
        {errors.password ? (
          <span className="text-red-500 text-xs">
            {t(`errors.${errors.password.message}` as Parameters<typeof t>[0])}
          </span>
        ) : null}
      </div>

      <Button className="w-full" disabled={isSubmitting} type="submit">
        {isSubmitting ? '...' : t('signInButton')}
      </Button>

      <p className="text-center">
        {t('noAccount')}{' '}
        <Link className="text-blue-600 hover:underline" href="/sign-up">
          {t('signUp')}
        </Link>
      </p>
    </form>
  );
};

export default SignInForm;
