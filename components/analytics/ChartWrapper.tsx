import React, { ReactNode } from 'react';

type ChartWrapperProps = {
  title: string;
  description?: string;
  children: ReactNode;
  action?: ReactNode;
};

export function ChartWrapper({
  title,
  description,
  children,
  action
}: ChartWrapperProps) {
  return (
    <div className="bg-card border-border rounded-lg border p-6 shadow-sm hover:shadow-md transition-shadow duration-300 flex flex-col h-full">
      <div className="mb-6 flex justify-between items-start">
        <div>
          <h3 className="text-card-foreground mb-1 text-xl font-semibold tracking-tight">
            {title}
          </h3>
          {description && (
            <p className="text-muted-foreground text-sm leading-relaxed max-w-prose">
              {description}
            </p>
          )}
        </div>
        {action && <div>{action}</div>}
      </div>
      <div className="w-full flex-grow min-h-[300px]">{children}</div>
    </div>
  );
}

// Error Boundary for Charts
export class ChartErrorBoundary extends React.Component<
  { children: ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center py-12 text-center h-full bg-[var(--color-muted)]/20 rounded-lg">
          <div className="mb-3 text-4xl opacity-50">📊</div>
          <h3 className="text-muted-foreground mb-1 text-lg font-semibold">
            Visualization unavailable
          </h3>
          <p className="text-muted-foreground text-sm">
            Could not render this chart.
          </p>
        </div>
      );
    }
    return this.props.children;
  }
}