import { createFileRoute } from '@tanstack/react-router';
import { StaffQueueScreen } from '@/components/prototype/staff-screens';
import { pageHead } from '@/components/prototype/shared';
export const Route = createFileRoute('/staff')({ component: StaffQueueScreen, head: () => pageHead('Staff case queue', 'An academic inspector workspace for reviewing fictional photo-fine challenges and simulated AI suggestions.') });
