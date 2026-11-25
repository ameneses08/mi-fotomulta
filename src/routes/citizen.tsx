import { createFileRoute } from '@tanstack/react-router';
import { MyFinesScreen } from '@/components/prototype/citizen-screens';
import { pageHead } from '@/components/prototype/shared';
export const Route = createFileRoute('/citizen')({ component: MyFinesScreen, head: () => pageHead('My fines', 'View Marta’s six fictional photo-fines and potential refund in the Bogotá mobility prototype.') });
