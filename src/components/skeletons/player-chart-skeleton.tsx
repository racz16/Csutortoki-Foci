import { JSX } from 'react';
import { Card } from '../card';
import { LoadingIndicator } from '../loading-indicator';

export function PlayerChartSkeleton(): JSX.Element {
    return (
        <Card className="flex h-75 items-center justify-center">
            <LoadingIndicator size={64} />
        </Card>
    );
}
