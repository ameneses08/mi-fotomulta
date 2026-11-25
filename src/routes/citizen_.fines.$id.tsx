import { createFileRoute } from '@tanstack/react-router';
import { FineDetailScreen } from '@/components/prototype/citizen-screens';
import { pageHead } from '@/components/prototype/shared';
export const Route = createFileRoute('/citizen_/fines/$id')({ component: FinePage, head: () => pageHead('Fine details', 'Review fictional fine details, source records, camera authorisation and a simulated AI explanation.') });
function FinePage() { const { id } = Route.useParams(); return <FineDetailScreen id={id}/>; }
