export default function ResumeWindowContent() {
  return (
    <div className="space-y-4">
      <p className="rounded-lg border border-black/10 bg-white/60 p-2 text-[11px] font-semibold uppercase tracking-[0.1em] text-black/50">
        Resume / PDF
      </p>
      <div className="h-[calc(100vh-260px)] min-h-[360px] overflow-hidden rounded-lg border border-black/10 bg-white/90">
        <iframe
          src="/ResumeMay2026.pdf"
          title="Resume PDF"
          className="h-full w-full"
        />
      </div>
      <a
        href="/ResumeMay2026.pdf"
        target="_blank"
        rel="noopener noreferrer"
        className="desktop-soft-btn inline-flex rounded-md px-3 py-1 text-xs uppercase tracking-wide"
      >
        Open in New Tab
      </a>
    </div>
  );
}
