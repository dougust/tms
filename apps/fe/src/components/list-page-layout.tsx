import { Button } from '@dougust/ui';
import { Plus, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import { StatCard, StatCardProps } from './stat-card';
import React from 'react';

export type ListPageLayoutProps = React.PropsWithChildren & {
  title: string;
  description: string;
  createButton?: {
    text: string;
    href: string;
  };
  onRefreshClick?: () => void;
  stats?: StatCardProps[];
};

export const ListPageLayout = (props: ListPageLayoutProps) => {
  const { title, description, createButton, stats, onRefreshClick, children } =
    props;

  return (
    <div className="space-y-6 h-full flex flex-col flex-1">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
          <p className="text-muted-foreground">{description}</p>
        </div>
        <div className="flex items-center gap-2">
          {onRefreshClick && (
            <Button variant="outline" onClick={onRefreshClick}>
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
          )}
          {createButton && (
            <Link href={createButton.href}>
              <Button>
                <Plus className="h-4 w-4" />
                {createButton.text}
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-3">
          {stats.map((stat, index) => (
            <StatCard key={index} {...stat} />
          ))}
        </div>
      )}
      {children}
    </div>
  );
};
