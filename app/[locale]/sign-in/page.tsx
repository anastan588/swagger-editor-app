import { getLocale } from 'next-intl/server';

import SignInForm from '@/app/components/auth/sign-in-form';
import { redirect } from '@/i18n/navigation';
import { createClient } from '@/lib/supabase/server';

const SignInPage = async () => {
  const supabase = await createClient();
  const locale = await getLocale();
  const { data } = await supabase.auth.getClaims();

  if (data?.claims) {
    redirect({
      href: '/',
      locale: locale || 'en',
    });
  }

  return (
    <main className="flex flex-1 items-center justify-center">
      <SignInForm />
    </main>
  );
};

export default SignInPage;
