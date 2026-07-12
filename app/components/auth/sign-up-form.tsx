'use client';

import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { Controller, useForm } from 'react-hook-form';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Field, FieldDescription, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Link, useRouter } from '@/i18n/navigation';
import { createClient } from '@/lib/supabase/client';
import { SignUpFormData, signUpSchema } from '@/lib/validation/auth';

import { Button } from '../../../components/ui/button';

export const SignUpForm = () => {
  const t = useTranslations('Auth');
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignUpFormData>({
    defaultValues: { email: '', password: '', confirmPassword: '' },
    mode: 'onSubmit',
    resolver: zodResolver(signUpSchema),
  });

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
  };

  return (
    <Card className="min-w-sm">
      <CardHeader>
        <CardTitle className="text-center text-2xl">{t('signUpTitle')}</CardTitle>
      </CardHeader>
      <CardContent>
        <form className="flex flex-col gap-2 w-full" onSubmit={handleSubmit(onSubmit)}>
          {serverError ? <div className="text-red-500 text-sm bg-red-50 p-3 rounded-md">{serverError}</div> : null}
          <FieldGroup>
            <Field data-invalid={!!errors.email}>
              <FieldLabel className="text-x1 font-semibold" htmlFor="email">
                {t('email')}
              </FieldLabel>
              <Controller
                control={control}
                name="email"
                render={({ field }) => (
                  <Input
                    {...field}
                    aria-invalid={!!errors.email}
                    disabled={isSubmitting}
                    id="email"
                    placeholder={t('emailPlaceholder')}
                  />
                )}
              />
              <FieldDescription>
                {errors.email ? (
                  <span className="text-red-500">{t(`errors.${errors.email.message}` as Parameters<typeof t>[0])}</span>
                ) : null}
              </FieldDescription>
            </Field>
            <Field data-invalid={!!errors.password}>
              <FieldLabel className="text-x1 font-semibold" htmlFor="password">
                {t('password')}
              </FieldLabel>
              <Controller
                control={control}
                name="password"
                render={({ field }) => (
                  <Input
                    {...field}
                    aria-invalid={!!errors.password}
                    disabled={isSubmitting}
                    id="password"
                    placeholder={t('passwordPlaceholder')}
                    type="password"
                  />
                )}
              />
              <FieldDescription>
                {errors.password ? (
                  <span className="text-red-500">
                    {t(`errors.${errors.password.message}` as Parameters<typeof t>[0])}
                  </span>
                ) : null}
              </FieldDescription>
            </Field>
            <Field data-invalid={!!errors.confirmPassword}>
              <FieldLabel className="text-x1 font-semibold" htmlFor="confirmPassword">
                {t('confirmPassword')}
              </FieldLabel>
              <Controller
                control={control}
                name="confirmPassword"
                render={({ field }) => (
                  <Input
                    {...field}
                    aria-invalid={!!errors.confirmPassword}
                    disabled={isSubmitting}
                    id="confirmPassword"
                    placeholder={t('passwordPlaceholder')}
                    type="password"
                  />
                )}
              />
              <FieldDescription>
                {errors.confirmPassword ? (
                  <span className="text-red-500">
                    {t(`errors.${errors.confirmPassword.message}` as Parameters<typeof t>[0])}
                  </span>
                ) : null}
              </FieldDescription>
            </Field>
          </FieldGroup>
          <Button className="w-full" disabled={isSubmitting} type="submit">
            {isSubmitting ? '...' : t('signUpButton')}
          </Button>
          <p className="text-center">
            {t('hasAccount')}{' '}
            <Link className="text-blue-600 hover:underline" href="/sign-in">
              {t('signIn')}
            </Link>
          </p>
        </form>
      </CardContent>
    </Card>
  );
};
