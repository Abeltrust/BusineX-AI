import type { ButtonHTMLAttributes, PropsWithChildren, ReactNode } from 'react';
import { LoaderCircle } from 'lucide-react';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost';

const buttonVariants: Record<ButtonVariant, string> = {
  primary: 'bg-[#1f4f46] text-white hover:bg-[#173b34] shadow-[0_10px_24px_rgba(31,79,70,0.18)]',
  secondary: 'bg-[#9f6d38] text-white hover:bg-[#865a2d]',
  outline: 'border border-[#cfc9ba] bg-[#fbfaf6] text-[#1d2a24] hover:bg-[#f2efe6]',
  ghost: 'text-[#58645e] hover:bg-[#ece8dc] hover:text-[#1d2a24]',
};

export function Button({
  children,
  className = '',
  disabled,
  variant = 'primary',
  loading = false,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  loading?: boolean;
  variant?: ButtonVariant;
}) {
  return (
    <button
      className={`inline-flex cursor-pointer items-center justify-center gap-2 rounded-2xl px-5 py-3 font-medium transition duration-200 disabled:cursor-not-allowed disabled:opacity-50 ${buttonVariants[variant]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? <LoaderCircle className="h-4 w-4 animate-spin" /> : null}
      {children}
    </button>
  );
}

export function Card({
  children,
  className = '',
}: PropsWithChildren<{ className?: string }>) {
  return (
    <section className={`surface overflow-hidden rounded-[2rem] ${className}`}>
      {children}
    </section>
  );
}

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div className="max-w-2xl">
        {eyebrow ? (
          <p className="section-label">{eyebrow}</p>
        ) : null}
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-[#18211d] md:text-5xl">{title}</h1>
        {description ? <p className="text-soft mt-3 text-sm leading-6 md:text-base">{description}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-3">{actions}</div> : null}
    </div>
  );
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <Card className="p-8 text-center md:p-12">
      <h2 className="text-2xl font-semibold text-[#18211d]">{title}</h2>
      <p className="text-soft mx-auto mt-3 max-w-xl text-sm leading-6 md:text-base">{description}</p>
      {action ? <div className="mt-6 flex justify-center">{action}</div> : null}
    </Card>
  );
}
