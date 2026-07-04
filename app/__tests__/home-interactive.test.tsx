import '@testing-library/jest-dom/vitest';

import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import HomeInteractive from '@/app/components/HomeInteractive';

const mockUseAuth = vi.fn();
vi.mock('@/app/components/useAuth', () => ({
  useAuth: () => mockUseAuth(),
}));

vi.mock('@/i18n/navigation', () => ({
  Link: function MockLink({
    children,
    href,
    className,
  }: {
    children: React.ReactNode;
    href: string;
    className?: string;
  }) {
    return (
      <a className={className} href={href}>
        {children}
      </a>
    );
  },
}));

const mockProps: Record<string, string> = {
  welcome: 'Hello Guest',
  welcomeBack: 'Welcome Back User',
  guestSubtitle: 'Guest subtitle text',
  authSubtitle: 'Auth subtitle text',
  workspaceTitle: 'Workspace Title',
  workspaceAuthDesc: 'Auth description',
  workspaceGuestDesc: 'Guest description',
  historyLink: 'History Link Text',
  dashboardBtn: 'Go to Dashboard',
  getStartedBtn: 'Get Started Now',
};

describe('HomeInteractive Component', () => {
  it('renders nothing but a minimal height wrapper when auth state is not ready', () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: false,
      isAuthReady: false,
    });

    const { container } = render(<HomeInteractive {...mockProps} />);

    expect(container.firstChild).toHaveClass('min-h-[300px]');
    expect(screen.queryByRole('heading')).not.toBeInTheDocument();
  });

  it('renders guest interface configuration details when user is not authenticated', () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: false,
      isAuthReady: true,
    });

    render(<HomeInteractive {...mockProps} />);

    const title = screen.getByRole('heading', { level: 1 });
    expect(title).toHaveTextContent('Hello Guest');

    const subtitle = screen.getByText('Guest subtitle text');
    expect(subtitle).toBeInTheDocument();

    const desc = screen.getByText('Guest description');
    expect(desc).toBeInTheDocument();

    expect(screen.queryByText('History Link Text')).not.toBeInTheDocument();

    const actionLink = screen.getByRole('link', { name: 'Get Started Now' });
    expect(actionLink).toHaveAttribute('href', '/sign-in');
  });

  it('renders authorized dashboard settings options when user is successfully authenticated', () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
      isAuthReady: true,
    });

    render(<HomeInteractive {...mockProps} />);

    const title = screen.getByRole('heading', { level: 1 });
    expect(title).toHaveTextContent('Welcome Back User');

    const subtitle = screen.getByText('Auth subtitle text');
    expect(subtitle).toBeInTheDocument();

    const desc = screen.getByText('Auth description');
    expect(desc).toBeInTheDocument();

    const historyLink = screen.getByRole('link', { name: 'History Link Text' });
    expect(historyLink).toHaveAttribute('href', '/history');

    const actionLink = screen.getByRole('link', { name: 'Go to Dashboard' });
    expect(actionLink).toHaveAttribute('href', '/editor');
  });
});
