import Link from "next/link";

type SiteHeaderProps = {
  eventCount: number;
  current?: "archive" | "about";
};

export default function SiteHeader({ eventCount, current = "archive" }: SiteHeaderProps) {
  return (
    <nav className="topbar" aria-label="Primary navigation">
      <Link className="wordmark" href={current === "archive" ? "#top" : "/"} aria-label="Epoch home">
        <span className="wordmark-mark" aria-hidden="true">E</span>
        <span>Epoch</span>
      </Link>

      <div className="live-status-wrap">
        <span className="live-status" tabIndex={0} aria-describedby="live-status-note">
          <span className="live-dot" aria-hidden="true" />
          Live archive
        </span>
        <span className="live-tooltip" id="live-status-note" role="tooltip">
          This archive keeps updating as new information arrives.
        </span>
      </div>

      <div className="topbar-links">
        <span className="archive-total">{eventCount} moments</span>
        <Link className={`topbar-link ${current === "about" ? "active" : ""}`} href="/about">
          About
        </Link>
      </div>
    </nav>
  );
}
