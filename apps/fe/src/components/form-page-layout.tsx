import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import React from 'react';

export type FormLayoutProps = React.PropsWithChildren & {
  returnButton: {
    text: string;
    href: string;
  };
  title: string;
  description: string;
};

export const FormPageLayout = (props: FormLayoutProps) => {
  const { title, description, returnButton, children } = props;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Link
              href={returnButton.href}
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              {returnButton.text}
            </Link>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
          <p className="text-muted-foreground">{description}</p>
        </div>
      </div>

      {/* Form */}
      <div className="rounded-lg border bg-card shadow-sm">{children}</div>
    </div>
  );
};
