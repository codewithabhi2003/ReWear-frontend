// OrderTimeline.jsx
import { CheckCircle, Circle, Package, Truck, Home, CreditCard, XCircle } from 'lucide-react';

const STEPS = ['Payment Pending', 'Confirmed', 'Packed', 'Shipped', 'Delivered'];
const ICONS = [CreditCard, CheckCircle, Package, Truck, Home];

export function OrderTimeline({ status }) {
  const currentIdx = STEPS.indexOf(status);
  const isCancelled = status === 'Cancelled' || status === 'Refunded';

  if (isCancelled) return (
    <div className="flex items-center gap-2 py-2">
      <XCircle size={18} style={{ color: 'var(--accent-red)' }} />
      <span className="text-sm font-medium" style={{ color: 'var(--accent-red)' }}>{status}</span>
    </div>
  );

  return (
    <div className="flex items-center gap-1 overflow-x-auto py-2">
      {STEPS.map((step, i) => {
        const Icon      = ICONS[i];
        const completed = i < currentIdx;
        const active    = i === currentIdx;
        return (
          <div key={step} className="flex items-center flex-shrink-0">
            <div className="flex flex-col items-center">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center transition-all"
                style={{
                  background: completed || active ? 'var(--accent-green)' : 'var(--bg-elevated)',
                  border: `2px solid ${completed || active ? 'var(--accent-green)' : 'var(--border)'}`,
                }}
              >
                <Icon size={14} color={completed || active ? '#fff' : 'var(--text-muted)'} />
              </div>
              <span
                className="text-[9px] mt-1 whitespace-nowrap font-medium"
                style={{ color: active ? 'var(--accent-green)' : completed ? 'var(--text-secondary)' : 'var(--text-muted)' }}
              >
                {step.replace('Payment Pending', 'Pending')}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div
                className="h-0.5 w-6 sm:w-10 mx-1 mb-4 flex-shrink-0 transition-all"
                style={{ background: i < currentIdx ? 'var(--accent-green)' : 'var(--border)' }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
