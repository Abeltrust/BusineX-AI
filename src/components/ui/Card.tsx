import type { Key, ReactNode } from 'react';

type CardProps = {
  children: ReactNode;
  className?: string;
  key?: Key;
};

export function Card({ children, className = '' }: CardProps) {
  return <div className={`panel rounded-[28px] ${className}`}>{children}</div>;
}
