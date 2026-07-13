'use client';

import { useContext } from 'react';

import { AuthContext } from '@/app/context/AuthContext';
import { Link } from '@/i18n/navigation';

const HomeInteractive = ({
  welcome,
  welcomeBack,
  guestSubtitle,
  authSubtitle,
  workspaceTitle,
  workspaceAuthDesc,
  workspaceGuestDesc,
  historyLink,
  dashboardBtn,
  getStartedBtn,
}: Record<string, string>) => {
  const auth = useContext(AuthContext);
  const isAuthenticated = auth?.isAuthenticated ?? false;
  const userName = auth?.userName;

  return (
    <>
      <h1 className="text-2xl font-extrabold tracking-tight sm:text-4xl mb-4">
        {isAuthenticated ? `${welcomeBack}, ${userName || ''}` : welcome}
      </h1>

      <p className="text-base text-neutral-500 dark:text-neutral-400 max-w-md font-light leading-relaxed mb-8">
        {isAuthenticated ? authSubtitle : guestSubtitle}
      </p>

      <div className="w-full border border-neutral-200 dark:border-neutral-800 rounded-sm p-8 bg-neutral-50 dark:bg-neutral-900 text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-6">
        <div>
          <h2 className="text-lg font-bold mb-1">{workspaceTitle}</h2>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 font-light">
            {isAuthenticated ? workspaceAuthDesc : workspaceGuestDesc}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto justify-end">
          {isAuthenticated ? (
            <Link
              className="text-sm font-medium underline underline-offset-4 hover:text-neutral-500 dark:hover:text-neutral-400 transition-colors py-2 px-4 whitespace-nowrap"
              href="/history"
            >
              {historyLink}
            </Link>
          ) : null}

          <Link
            className="px-6 py-3 text-sm font-medium border border-black bg-black text-white hover:bg-white hover:text-black dark:border-white dark:bg-white dark:text-black dark:hover:bg-black dark:hover:text-white transition-all duration-200 text-center inline-block whitespace-nowrap w-full sm:w-auto"
            href={isAuthenticated ? '/editor' : '/sign-in'}
          >
            {isAuthenticated ? dashboardBtn : getStartedBtn}
          </Link>
        </div>
      </div>
    </>
  );
};

export default HomeInteractive;
