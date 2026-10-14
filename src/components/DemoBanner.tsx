import { AlertTriangle } from 'lucide-react';

export default function DemoBanner() {
  return (
    <div className="demo-banner sticky top-0 z-30">
      <AlertTriangle size={13} className="flex-shrink-0" />
      <span>
        <strong>DEMO MODE</strong> — Showing fictional sample data for demonstration purposes only.
        No real patient records. No AI API connected.
      </span>
    </div>
  );
}
