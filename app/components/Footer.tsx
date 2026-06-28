import { Link } from '@/i18n/navigation';

const Footer = () => {
  return (
    <footer className="border-t bg-white">
      <div className="mx-auto flex min-h-10 w-full max-w-7xl flex-wrap items-center justify-between gap-2 px-4 py-2 text-xs">
        <span className="text-muted-foreground">Created in 2026 for RS School React Course</span>

        <Link className="font-medium text-muted-foreground hover:text-primary hover:underline" href="/about">
          About Swagger Editor App
        </Link>
      </div>
    </footer>
  );
};

export default Footer;
