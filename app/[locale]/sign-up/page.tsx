import { getLocale } from 'next-intl/server';

import { SignUpForm } from '@/app/components/auth/sign-up-form';
import { redirect } from '@/i18n/navigation';
import { createClient } from '@/lib/supabase/server';

const SignUpPage = async () => {
  const supabase = await createClient();
  const locale = await getLocale();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect({
      href: '/',
      locale: locale || 'en',
    });
  }

  return (
    <main className="flex flex-1 items-center justify-center py-16">
      <SignUpForm />
    </main>
  );
};

export default SignUpPage;
