const CODE_VIEW_URL = "https://github1s.com/AidenBrown21/portfolio-website";

export default function VsCodeWindowContent() {
  return (
    <div className="group relative h-full w-full overflow-hidden bg-[#1f1f1f]">
      <iframe
        src={CODE_VIEW_URL}
        title="VS Code Read-only Portfolio Source"
        className="absolute inset-0 h-full w-full"
        style={{ border: "none" }}
      />
      <div className="pointer-events-none absolute right-3 top-3 z-10 opacity-0 transition-opacity duration-150 group-hover:opacity-100 group-focus-within:opacity-100">
        <a
          href={CODE_VIEW_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="desktop-soft-btn pointer-events-auto rounded-md px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.08em]"
        >
          Open in new tab
        </a>
      </div>
    </div>
  );
}
