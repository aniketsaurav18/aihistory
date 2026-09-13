import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "@/components/site-header";
import archive from "@/data/index.json";

export const metadata: Metadata = {
  title: "About AI History — A living history of modern AI",
  description: "How AI History selects, organizes, and updates the events in its modern AI timeline.",
};

export default function AboutPage() {
  return (
    <>
      <SiteHeader eventCount={archive.total_events} current="about" />
      <main className="about-page">
        <header className="about-intro">
          <p className="eyebrow">About the archive</p>
          <h1>A living record of the machine age.</h1>
          <p className="about-lede">
            AI History traces the papers, models, products, companies, infrastructure, and policy decisions
            that have shaped modern artificial intelligence since 2017.
          </p>
        </header>

        <section className="about-grid" aria-label="How the archive works">
          <p className="about-section-label">The approach</p>
          <div className="about-copy">
            <h2>Built for context, not just chronology.</h2>
            <p>
              Every entry pairs a concise account of what happened with why it mattered. Events are
              organized by date and category, then connected to the people, laboratories, products,
              and ideas involved.
            </p>
            <p>
              Dates use the best available publication or announcement record. When launches unfold
              across several releases, the archive favors the clearest public milestone.
            </p>
          </div>
        </section>

        <section className="about-grid" aria-label="Contribute an event">
          <p className="about-section-label">Contribute</p>
          <div className="about-copy">
            <h2>Help strengthen the record.</h2>
            <p>
              If an important event is missing, submit it through the project&apos;s GitHub issue tracker.
              Include the date, a clear summary, why it matters, and links to reliable primary sources
              so it can be reviewed for the archive.
            </p>
            <a
              className="about-contribute-link"
              href="https://github.com/aniketsaurav18/aihistory/issues/new"
              target="_blank"
              rel="noreferrer"
            >
              Submit an event on GitHub <span aria-hidden="true">↗</span>
            </a>
          </div>
        </section>

        <section className="about-grid" aria-label="Sources and updates">
          <p className="about-section-label">A living archive</p>
          <div className="about-copy">
            <h2>The record changes as the field does.</h2>
            <p>
              New events and source material are added as information arrives. Each timeline entry
              keeps its supporting links visible so the record can be followed beyond the summary.
            </p>
            <p>
              The Highlights view offers a focused path through the defining moments; All events keeps
              the broader historical record available for deeper exploration.
            </p>
          </div>
        </section>

        <div className="about-return">
          <Link href="/">Explore the timeline <span aria-hidden="true">↗</span></Link>
          <span>{archive.total_events} documented moments · 2017—2026</span>
        </div>
      </main>
    </>
  );
}
