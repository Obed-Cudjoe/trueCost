// R5 — "last verified" pill. Makes the brand promise visible on every dataset.
export default function VerifiedStamp({ date }: { date: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-leaf">
      <span aria-hidden="true">✓</span> Verified {date}
    </span>
  );
}
