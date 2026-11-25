import { createFileRoute } from '@tanstack/react-router';
import { RefundScreen } from '@/components/prototype/citizen-screens';
import { pageHead } from '@/components/prototype/shared';
export const Route = createFileRoute('/citizen_/refunds/$id')({ component: RefundPage, head: () => pageHead('Your refund', 'Review a fictional refund on hold and enter sample payment details with separate consent.') });
function RefundPage() { const { id } = Route.useParams(); return <RefundScreen id={id}/>; }
