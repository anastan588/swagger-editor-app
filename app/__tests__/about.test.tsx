import { type ImgHTMLAttributes } from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import AboutPage from '@/app/[locale]/about/page';

vi.mock('next/image', () => ({
  default: ({ alt, ...props }: ImgHTMLAttributes<HTMLImageElement>) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img alt={alt} {...props} />
  ),
}));

vi.mock('next-intl', () => ({
  useTranslations:
    (namespace: string) =>
    (key: string): string =>
      `${namespace}.${key}`,
}));

describe('About page', () => {
  it('renders project, course, resources, team, and technologies sections', () => {
    render(<AboutPage />);

    expect(screen.getByRole('heading', { level: 1, name: 'AboutPage.title' })).toBeInTheDocument();
    expect(screen.getByText('AboutPage.description')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: 'AboutPage.course.title' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'AboutPage.course.link' })).toHaveAttribute('href', 'https://rs.school/');
    expect(screen.getByRole('link', { name: /AboutPage.resources.repository/ })).toHaveAttribute(
      'href',
      'https://github.com/anastan588/swagger-editor-app/',
    );
    expect(screen.getByRole('link', { name: 'AboutPage.resources.task' })).toHaveAttribute(
      'href',
      'https://github.com/rolling-scopes-school/tasks/blob/master/react/modules/tasks/final.md',
    );

    expect(screen.getByText('Anastasiya Andronava')).toBeInTheDocument();
    expect(screen.getByText('Tatsiana Hladkaya')).toBeInTheDocument();
    expect(screen.getByText('Artem Hlopov')).toBeInTheDocument();
    expect(screen.getByText('Next.js')).toBeInTheDocument();
    expect(screen.getByText('Vitest')).toBeInTheDocument();
  });
});
