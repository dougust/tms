import React from 'react';

export interface StatCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
}

export const StatCard = (props: StatCardProps) => {
  const { title, value, icon } = props;

  return (
    <div className="rounded-lg border bg-card p-6 shadow-sm">
      <div className="flex items-center justify-between space-x-4">
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold">{value}</p>
        </div>
        <div className="rounded-full bg-primary/10 p-3">{icon}</div>
      </div>
    </div>
  );
};
