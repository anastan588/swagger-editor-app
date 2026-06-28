'use client';

import { useTranslations } from 'next-intl';

import { useAuth } from '@/app/components/useAuth';
import { Button } from '@/components/ui/button';
import { Link, useRouter } from '@/i18n/navigation';

import LanguageSwitcher from './LanguageSwitcher';

const Header = () => {
  const t = useTranslations('Header');
  const router = useRouter();
  const { isAuthenticated, isAuthReady, signOut } = useAuth();

  const handleSignOut = () => {
    signOut();
    router.replace('/');
  };

  return (
    <header className="border-b bg-white">
      <div className="mx-auto flex min-h-14 w-full max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3">
        <div className="flex items-center gap-6">
          <Link className="text-base font-semibold" href="/">
            {t('logo')}
          </Link>

          <nav className="flex items-center gap-2">
            <Button asChild size="sm" variant="ghost">
              <Link href="/">{t('editor')}</Link>
            </Button>

            <Button asChild size="sm" variant="ghost">
              <Link href="/about">{t('about')}</Link>
            </Button>
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <LanguageSwitcher />

          {isAuthReady ? (
            isAuthenticated ? (
              <>
                <Button asChild size="sm" variant="ghost">
                  <Link href="/history">{t('history')}</Link>
                </Button>

                <Button size="sm" variant="outline" onClick={handleSignOut}>
                  {t('signOut')}
                </Button>
              </>
            ) : (
              <>
                <Button asChild size="sm" variant="ghost">
                  <Link href="/sign-in">{t('signIn')}</Link>
                </Button>

                <Button asChild size="sm">
                  <Link href="/sign-up">{t('signUp')}</Link>
                </Button>
              </>
            )
          ) : null}
        </div>
      </div>
    </header>
  );
};

export default Header;
