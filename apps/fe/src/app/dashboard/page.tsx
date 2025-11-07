'use client';

import { Activity, Users, TrendingUp, DollarSign } from 'lucide-react';

const stats = [
  {
    title: 'Total Users',
    value: '2,543',
    change: '+12.5%',
    icon: Users,
    trend: 'up',
  },
  {
    title: 'Revenue',
    value: '$45,231',
    change: '+8.2%',
    icon: DollarSign,
    trend: 'up',
  },
  {
    title: 'Active Sessions',
    value: '1,234',
    change: '-2.4%',
    icon: Activity,
    trend: 'down',
  },
  {
    title: 'Growth',
    value: '+23.5%',
    change: '+4.1%',
    icon: TrendingUp,
    trend: 'up',
  },
];

export default function DashboardPage() {
  return (
    <div className="space-y-6 h-full flex flex-1 relative">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome to your dashboard overview
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.title}
            className="rounded-lg border bg-card p-6 shadow-sm"
          >
            <div className="flex items-center justify-between space-x-4">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </p>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p
                  className={`text-xs ${
                    stat.trend === 'up'
                      ? 'text-green-600'
                      : 'text-red-600'
                  }`}
                >
                  {stat.change} from last month
                </p>
              </div>
              <div className="rounded-full bg-primary/10 p-3">
                <stat.icon className="h-5 w-5 text-primary" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Content Area */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <div className="col-span-2 rounded-lg border bg-card p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold">Recent Activity</h2>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="flex items-center gap-4 rounded-md border p-3"
              >
                <div className="h-10 w-10 rounded-full bg-primary/10" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Activity #{i}</p>
                  <p className="text-xs text-muted-foreground">
                    {i} minutes ago
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold">Quick Actions</h2>
          <div className="space-y-2">
            {['Create New', 'Import Data', 'Export Report', 'Settings'].map(
              (action) => (
                <button
                  key={action}
                  className="w-full rounded-md border p-3 text-left text-sm hover:bg-accent transition-colors"
                >
                  {action}
                </button>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
