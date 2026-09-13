import Link from "next/link";
import { Github } from "lucide-react";
import LogoMark from "@/components/logo-mark";

type SiteHeaderProps = {
  eventCount: number;
  current?: "archive" | "about";
};

export default function SiteHeader({ eventCount, current = "archive" }: SiteHeaderProps) {
  return (
    <nav className="topbar" aria-label="Primary navigation">
      <Link className="wordmark" href={current === "archive" ? "#top" : "/"} aria-label="AI History home">
        <LogoMark className="wordmark-mark" />
        <span>AI History</span>
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
        <a
          className="topbar-link github-link"
          href="https://github.com/aniketsaurav18/aihistory"
          target="_blank"
          rel="noreferrer"
          aria-label="AI History on GitHub (opens in a new tab)"
        >
          <Github size={14} aria-hidden="true" />
          <span>GitHub</span>
        </a>
        <Link className={`topbar-link ${current === "about" ? "active" : ""}`} href="/about">
          About
        </Link>
      </div>
    </nav>
  );
}
