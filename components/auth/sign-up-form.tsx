'use client';

import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';

import { Link, useRouter } from '@/i18n/navigation';
import { createClient } from '@/lib/supabase/client';
import { SignUpFormData, signUpSchema } from '@/lib/validation/auth';

import { Button } from '../ui/button';

export const SignUpForm = () => {
  const t = useTranslations('Auth');
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignUpFormData>({ mode: 'onSubmit', resolver: zodResolver(signUpSchema) });

  const onSubmit = async (data: SignUpFormData) => {
    setServerError(null);
    const supabase = createClient();

    const { error } = await supabase.auth.signUp({ email: data.email, password: data.password });
    if (error) {
      if (error.message.includes('already registered')) {
        setServerError(t('errors.emailTaken'));
      } else {
        setServerError(t('errors.generic'));
      }
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

      <div className="flex flex-col gap-1">
        <label htmlFor="password">{t('password')}</label>
        <input
          {...register('confirmPassword')}
          className="border rounded-md px-3 py-2"
          id="confirmPassword"
          placeholder={t('passwordPlaceholder')}
          type="password"
        />
        {errors.confirmPassword ? (
          <span className="text-red-500 text-xs">
            {t(`errors.${errors.confirmPassword.message}` as Parameters<typeof t>[0])}
          </span>
        ) : null}
      </div>

      <Button className="w-full" disabled={isSubmitting} type="submit">
        {isSubmitting ? '...' : t('signUpButton')}
      </Button>

      <p className="text-center">
        {t('noAccount')}{' '}
        <Link className="text-blue-600 hover:underline" href="/sign-in">
          {t('signIn')}
        </Link>
      </p>
    </form>
  );
};
