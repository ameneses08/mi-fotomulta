import { beforeEach, describe, expect, it } from 'vitest';
import { useAppStore } from '@/store/appStore';
import { fines, initialCases } from '@/data/mockData';

beforeEach(() => {
  useAppStore.setState({ fines: [...fines], cases: [...initialCases], refundForm: { bank: '', type: 'Savings', account: '', consent: false }, refundSaved: false, refundError: '', refundStage: 0 });
  useAppStore.getState().startChallenge('F-2041');
});
describe('Prototype rules', () => {
  it('contains six fictional fines', () => { expect(useAppStore.getState().fines).toHaveLength(6); });
  it('shows the external fine as issued by Soacha', () => {
    expect(useAppStore.getState().fines.find(f => f.external)?.authority).toBe('Secretaría de Movilidad de Soacha');
  });
  it('limits each guided facts answer to 500 characters', () => {
    useAppStore.getState().setFact(0, 'a'.repeat(501));
    expect(useAppStore.getState().facts[0]).toHaveLength(500);
  });
  it('requires a reason before progressing', () => {
    useAppStore.getState().nextStep();
    expect(useAppStore.getState().step).toBe(0);
    useAppStore.getState().setReason("I wasn't driving");
    useAppStore.getState().nextStep();
    expect(useAppStore.getState().step).toBe(1);
  });
  it('submits the hero challenge as C-1042 at Being checked with Automatic checks', () => {
    const s = useAppStore.getState(); s.setReason("I wasn't driving"); s.setDraft('Please review who was driving.');
    expect(s.submitChallenge()).toBe('C-1042');
    expect(useAppStore.getState().cases.find(c => c.id === 'C-1042')).toMatchObject({ stage: 1, holder: 'Automatic checks' });
  });
  it('requires separate bank-account consent', () => {
    const s = useAppStore.getState(); s.setRefundField('bank', 'Bancolombia'); s.setRefundField('account', '12345678'); s.saveRefund();
    expect(useAppStore.getState().refundSaved).toBe(false);
    s.setRefundField('consent', true); s.saveRefund();
    expect(useAppStore.getState().refundSaved).toBe(true);
  });
  it('keeps the refund on hold after details are saved', () => {
    const s = useAppStore.getState(); s.setRefundField('bank', 'Bancolombia'); s.setRefundField('account', '12345678'); s.setRefundField('consent', true); s.saveRefund();
    expect(useAppStore.getState().refundStage).toBe(0);
  });
  it('calculates recoverable money from the paid unauthorised-camera fine', () => {
    expect(useAppStore.getState().recoverableAmount).toBe(650000);
  });
  it('advances the same shared case when the inspector updates it', () => {
    useAppStore.getState().advanceCase('C-1042');
    expect(useAppStore.getState().cases.find(c => c.id === 'C-1042')).toMatchObject({ stage: 2, holder: 'Inspector Laura Gómez' });
  });
});