import React, { ReactNode } from 'react';

type ChartWrapperProps = {
  title: string;
  description?: string;
  children?: ReactNode;
  action?: ReactNode;
};

export function ChartWrapper({
  title,
  description,
  children,
  action
}: ChartWrapperProps) {
  return (
    <div className="group relative bg-card/80 backdrop-blur-sm border border-border/60 rounded-xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col h-full overflow-hidden">
      {/* Decorative top gradient line */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[var(--color-primary)] to-transparent opacity-0 group-hover:opacity-50 transition-opacity" />
      
      <div className="mb-6 flex justify-between items-start relative z-10">
        <div>
          <h3 className="text-card-foreground mb-1 text-xl font-bold tracking-tight">
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
      <div className="w-full flex-grow min-h-[300px] relative z-10">{children}</div>
    </div>
  );
}

// Error Boundary for Charts
type ErrorBoundaryProps = { children?: ReactNode };
type ErrorBoundaryState = { hasError: boolean };

export class ChartErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center py-12 text-center h-full bg-[var(--color-muted)]/20 rounded-lg border-2 border-dashed border-[var(--color-border)]">
          <div className="mb-3 text-4xl opacity-50 grayscale">📊</div>
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
