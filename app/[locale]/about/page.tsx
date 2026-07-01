import Image from 'next/image';
import { useTranslations } from 'next-intl';

const teamMembers = [
  {
    name: 'Anastasiya Andronava',
    github: '@anastan588',
    githubUrl: 'https://github.com/anastan588',
    roleKey: 'teamLead',
    imageSrc: '/team/anastasia-account.jfif',
    alt: 'Anastasiya Andronava',
  },
  {
    name: 'Tatsiana Hladkaya',
    github: '@t-gladkaya',
    githubUrl: 'https://github.com/t-gladkaya',
    roleKey: 'developer',
    imageSrc: '/team/tatsiana-account.jfif',
    alt: 'Tatsiana Hladkaya',
  },
  {
    name: 'Artem Hlopov',
    github: '@artemhlopov',
    githubUrl: 'https://github.com/artemhlopov',
    roleKey: 'developer',
    imageSrc: '/team/artem-account.png',
    alt: 'Artem Hlopov',
  },
];

const technologies = ['Next.js', 'React', 'TypeScript', 'Tailwind CSS', 'next-intl', 'Vitest'];

const AboutPage = () => {
  const t = useTranslations('AboutPage');

  return (
    <section className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-8 px-4 py-10">
      <div className="space-y-3">
        <h1 className="text-3xl font-semibold">{t('title')}</h1>

        <p className="max-w-3xl text-muted-foreground">{t('description')}</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <section className="h-full space-y-4 rounded-lg border bg-white p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="flex h-20 w-28 shrink-0 items-center justify-center rounded-md border bg-zinc-50 p-3">
              <Image
                alt="RS School"
                className="max-h-full max-w-full object-contain"
                height={80}
                src="/course-logo.png"
                width={112}
              />
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-semibold">{t('course.title')}</h2>

              <p className="text-sm text-muted-foreground">{t('course.description')}</p>
            </div>
          </div>

          <a
            className="inline-flex text-sm font-medium text-primary hover:underline"
            href="https://rs.school/"
            rel="noreferrer"
            target="_blank"
          >
            {t('course.link')}
          </a>
        </section>

        <section className="flex h-full flex-col gap-4 rounded-lg border bg-white p-5">
          <h2 className="text-xl font-semibold">{t('resources.title')}</h2>

          <p className="text-sm text-muted-foreground">{t('resources.description')}</p>

          <div className="flex flex-col gap-2 text-sm">
            <a
              className="inline-flex items-center gap-2 rounded-md border px-3 py-2 font-medium text-primary transition-colors hover:bg-zinc-50"
              href="https://github.com/anastan588/swagger-editor-app/"
              rel="noreferrer"
              target="_blank"
            >
              <Image alt="icon" className="size-5 shrink-0" height={20} src="/github.svg" width={20} />
              {t('resources.repository')}
            </a>

            <a
              className="inline-flex rounded-md border px-3 py-2 font-medium text-primary transition-colors hover:bg-zinc-50"
              href="https://github.com/rolling-scopes-school/tasks/blob/master/react/modules/tasks/final.md"
              rel="noreferrer"
              target="_blank"
            >
              {t('resources.task')}
            </a>
          </div>
        </section>
      </div>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">{t('team.title')}</h2>

        <div className="grid gap-4 md:grid-cols-3">
          {teamMembers.map((member) => (
            <article key={member.github} className="rounded-lg border bg-white p-5">
              <div className="mb-4 flex justify-center">
                <Image
                  alt={member.alt}
                  className="size-28 rounded-full border object-cover"
                  height={112}
                  src={member.imageSrc}
                  width={112}
                />
              </div>
              <h3 className="font-semibold">{member.name}</h3>

              <p className="mt-1 text-sm text-muted-foreground">{t(`team.roles.${member.roleKey}`)}</p>

              <div className="mt-4 flex items-center gap-2">
                <Image alt="icon" className="size-5 shrink-0" height={20} src="/github.svg" width={20} />
                <a
                  className="text-sm font-medium text-primary hover:underline"
                  href={member.githubUrl}
                  rel="noreferrer"
                  target="_blank"
                >
                  {member.github}
                </a>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">{t('technologies')}</h2>

        <ul className="flex flex-wrap gap-2">
          {technologies.map((technology) => (
            <li key={technology} className="rounded-md border bg-white px-3 py-1 text-sm">
              {technology}
            </li>
          ))}
        </ul>
      </section>
    </section>
  );
};

export default AboutPage;
