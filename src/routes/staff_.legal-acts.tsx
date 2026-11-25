import { createFileRoute } from '@tanstack/react-router';
import { LegalActsScreen } from '@/components/prototype/staff-screens';
import { pageHead } from '@/components/prototype/shared';
export const Route = createFileRoute('/staff_/legal-acts')({ component: LegalActsScreen, head: () => pageHead('Staff legal acts', 'View an illustrative legal-act draft in the Mi Fotomulta Clara inspector shell.') });
