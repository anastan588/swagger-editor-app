import '@testing-library/jest-dom/vitest';

import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { EditorSkeleton } from '@/app/components/EditorSkeleton';

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}));

describe('EditorSkeleton Component', () => {
  it('renders base skeleton structure with loading messages placeholders correctly', () => {
    const { container } = render(<EditorSkeleton />);

    const rootWrapper = container.firstChild;
    expect(rootWrapper).toHaveClass('animate-pulse', 'flex-col', 'h-full', 'w-full', 'relative');

    const spinner = container.querySelector('.animate-spin');
    expect(spinner).toBeInTheDocument();
    expect(spinner).toHaveClass('rounded-full', 'border-2');

    expect(screen.getByText('loadingTitle')).toBeInTheDocument();
    expect(screen.getByText('loadingDescription')).toBeInTheDocument();

    const topBar = container.querySelector('.h-11');
    const bottomBar = container.querySelector('.h-14');
    expect(topBar).toBeInTheDocument();
    expect(bottomBar).toBeInTheDocument();
  });
});
