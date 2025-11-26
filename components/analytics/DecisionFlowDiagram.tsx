import React from 'react';
import {
  Sankey,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { FlowData } from '../../types';
import { ChartErrorBoundary } from './ChartWrapper';

type Props = {
  data: FlowData;
};

export function DecisionFlowDiagram({ data }: Props) {
  return (
    <ChartErrorBoundary>
      <ResponsiveContainer width="100%" height="100%">
        <Sankey
          data={data}
          node={{ fill: 'var(--color-primary)', opacity: 0.8, width: 10 }}
          nodePadding={50}
          link={{ stroke: 'var(--color-muted-foreground)', opacity: 0.2 }}
          margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
        >
          <Tooltip />
        </Sankey>
      </ResponsiveContainer>
    </ChartErrorBoundary>
  );
}