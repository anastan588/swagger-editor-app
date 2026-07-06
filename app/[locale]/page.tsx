import { useTranslations } from 'next-intl';

import HomeInteractive from '@/app/components/HomeInteractive';

const Home = () => {
  const t = useTranslations('HomePage');

  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-white font-sans text-black dark:bg-black dark:text-white transition-colors duration-300 w-full">
      <div className="flex flex-1 w-full max-w-3xl flex-col items-center justify-center py-24 px-16 sm:items-start text-center sm:text-left mx-auto">
        <div className="mb-6 h-1 w-12 bg-black dark:bg-white" />
        <HomeInteractive
          authSubtitle={t('authSubtitle')}
          dashboardBtn={t('dashboardBtn')}
          getStartedBtn={t('getStartedBtn')}
          guestSubtitle={t('guestSubtitle')}
          historyLink={t('historyLink') || 'View History'}
          welcome={t('welcome')}
          welcomeBack={t('welcomeBack')}
          workspaceAuthDesc={t('workspaceAuthDesc') || 'Access your full design history and saved definitions.'}
          workspaceGuestDesc={
            t('workspaceGuestDesc') || 'Login or create an account to persist your API design history.'
          }
          workspaceTitle={t('workspaceTitle') || 'Swagger Workspace'}
        />
      </div>
    </div>
  );
};

export default Home;
