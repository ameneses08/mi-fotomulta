import { createFileRoute } from '@tanstack/react-router';
import { SplitDemoScreen } from '@/components/prototype/staff-screens';
import { pageHead } from '@/components/prototype/shared';
export const Route = createFileRoute('/demo')({ component: SplitDemoScreen, head: () => pageHead('Split-screen demo', 'Explore the citizen and inspector perspectives together as a fictional case moves through the review stages.') });
