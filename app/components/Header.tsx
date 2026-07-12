'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';

import LanguageSwitcher from '@/app/components/LanguageSwitcher';
import { useAuth } from '@/app/components/useAuth';
import { Button } from '@/components/ui/button';
import { Link, usePathname, useRouter } from '@/i18n/navigation';

const Header = () => {
  const t = useTranslations('Header');
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, signOut } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);

  const isAboutPage = pathname === '/about';

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };

    handleScroll();

    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const handleSignOut = async () => {
    await signOut();
    router.replace('/');
    router.refresh();
  };

  return (
    <header
      className={`sticky top-0 z-50 border-b transition-colors ${isScrolled ? 'bg-zinc-100 shadow-sm' : 'bg-white'}`}
    >
      <div className="mx-auto flex min-h-14 w-full max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3">
        <div className="flex items-center gap-6">
          <Link className="text-base font-semibold" href="/">
            {t('logo')}
          </Link>

          <nav className="flex items-center gap-2">
            <Button asChild size="sm" variant={isAboutPage ? 'secondary' : 'ghost'}>
              <Link href="/about">{t('about')}</Link>
            </Button>
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <LanguageSwitcher />

          {isAuthenticated ? (
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
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
