import Image from 'next/image';

const teamMembers = [
  {
    name: 'Anastasiya Andronava',
    github: '@anastan588',
    githubUrl: 'https://github.com/anastan588',
    role: 'Team Lead',
    imageSrc: '/team/anastasia-account.jfif',
    alt: 'Anastasiya Andronava',
  },
  {
    name: 'Tatsiana Hladkaya',
    github: '@t-gladkaya',
    githubUrl: 'https://github.com/t-gladkaya',
    role: 'Developer',
    imageSrc: '/team/tatsiana-account.jfif',
    alt: 'Tatsiana Hladkaya',
  },
  {
    name: 'Artem Hlopov',
    github: '@artemhlopov',
    githubUrl: 'https://github.com/artemhlopov',
    role: 'Developer',
    imageSrc: '/team/artem-account.png',
    alt: 'Artem Hlopov',
  },
];

const technologies = ['Next.js', 'React', 'TypeScript', 'Tailwind CSS', 'next-intl', 'Vitest'];

const AboutPage = () => {
  return (
    <section className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-8 px-4 py-10">
      <div className="space-y-3">
        <h1 className="text-3xl font-semibold">About Swagger Editor App</h1>

        <p className="max-w-3xl text-muted-foreground">
          Swagger Editor App is a final project built for the RS School React course. The application is designed for
          working with Swagger and OpenAPI specifications, including editing, viewing, and managing request history.
        </p>
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
              <h2 className="text-xl font-semibold">RS School Course</h2>

              <p className="text-sm text-muted-foreground">
                RS School is a free community-based education program focused on modern web development. This project
                was created as part of the React course final task.
              </p>
            </div>
          </div>

          <a
            className="inline-flex text-sm font-medium text-primary hover:underline"
            href="https://rs.school/"
            rel="noreferrer"
            target="_blank"
          >
            RS School website
          </a>
        </section>

        <section className="flex h-full flex-col gap-4 rounded-lg border bg-white p-5">
          <h2 className="text-xl font-semibold">Project Resources</h2>

          <p className="text-sm text-muted-foreground">
            Explore the project source code and the original RS School final task requirements.
          </p>

          <div className="flex flex-col gap-2 text-sm">
            <a
              className="inline-flex items-center gap-2 rounded-md border px-3 py-2 font-medium text-primary transition-colors hover:bg-zinc-50"
              href="https://github.com/anastan588/swagger-editor-app/"
              rel="noreferrer"
              target="_blank"
            >
              <Image alt="icon" className="size-5 shrink-0" height={20} src="/github.svg" width={20} />
              Project repository
            </a>

            <a
              className="inline-flex rounded-md border px-3 py-2 font-medium text-primary transition-colors hover:bg-zinc-50"
              href="https://github.com/rolling-scopes-school/tasks/blob/master/react/modules/tasks/final.md"
              rel="noreferrer"
              target="_blank"
            >
              Final task description
            </a>
          </div>
        </section>
      </div>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Development Team</h2>

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

              <p className="mt-1 text-sm text-muted-foreground">{member.role}</p>

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
        <h2 className="text-xl font-semibold">Technologies</h2>

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
