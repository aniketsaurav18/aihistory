"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpRight,
  Check,
  Search,
  X,
} from "lucide-react";
import type { Category, TimelineEvent, YearMeta } from "@/lib/types";

const categories: { value: Category; label: string }[] = [
  { value: "paper", label: "Research" },
  { value: "model-release", label: "Models" },
  { value: "product", label: "Products" },
  { value: "advance", label: "Breakthroughs" },
  { value: "company", label: "Companies" },
  { value: "policy", label: "Policy" },
  { value: "infrastructure", label: "Infrastructure" },
  { value: "drama", label: "Industry" },
];

const categoryLabels = Object.fromEntries(categories.map((category) => [category.value, category.label]));

function formatDate(date: string) {
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric" }).format(
    new Date(`${date}T00:00:00`),
  );
}

type Props = {
  events: TimelineEvent[];
  years: YearMeta[];
  highlightIds: string[];
};

export default function TimelineExplorer({ events, years, highlightIds }: Props) {
  const [query, setQuery] = useState("");
  const [selectedYear, setSelectedYear] = useState<number | "all">("all");
  const [selectedCategories, setSelectedCategories] = useState<Category[]>([]);
  const [highlightsOnly, setHighlightsOnly] = useState(true);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [visibleCount, setVisibleCount] = useState(28);
  const [isCompact, setIsCompact] = useState(false);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const compactStateRef = useRef(false);

  const highlights = useMemo(() => new Set(highlightIds), [highlightIds]);
  const modeEvents = useMemo(
    () => (highlightsOnly ? events.filter((event) => highlights.has(event.id)) : events),
    [events, highlights, highlightsOnly],
  );
  const categoryCounts = useMemo(
    () =>
      Object.fromEntries(
        categories.map(({ value }) => [
          value,
          modeEvents.filter((event) => event.category === value).length,
        ]),
      ) as Record<Category, number>,
    [modeEvents],
  );
  const yearCounts = useMemo(
    () =>
      Object.fromEntries(
        years.map(({ year }) => [
          year,
          modeEvents.filter((event) => event.date.startsWith(String(year))).length,
        ]),
      ) as Record<number, number>,
    [modeEvents, years],
  );

  const sourceCount = useMemo(
    () => events.reduce((total, event) => total + (event.sources?.length || 0), 0),
    [events],
  );

  const filteredEvents = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const result = modeEvents.filter((event) => {
      if (selectedYear !== "all" && Number(event.date.slice(0, 4)) !== selectedYear) return false;
      if (selectedCategories.length && !selectedCategories.includes(event.category)) return false;
      if (!needle) return true;

      const haystack = [
        event.title,
        event.summary,
        event.significance,
        event.organizations.join(" "),
        event.tags.join(" "),
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(needle);
    });

    return result.sort((a, b) =>
      sortDirection === "asc" ? a.date.localeCompare(b.date) : b.date.localeCompare(a.date),
    );
  }, [modeEvents, query, selectedCategories, selectedYear, sortDirection]);

  const visibleEvents = filteredEvents.slice(0, visibleCount);
  const groupedEvents = visibleEvents.reduce<Record<string, TimelineEvent[]>>((groups, event) => {
    const year = event.date.slice(0, 4);
    groups[year] ||= [];
    groups[year].push(event);
    return groups;
  }, {});
  const orderedYearGroups = Object.entries(groupedEvents).sort(([yearA], [yearB]) =>
    sortDirection === "asc" ? Number(yearA) - Number(yearB) : Number(yearB) - Number(yearA),
  );

  useEffect(() => {
    setVisibleCount(28);
  }, [query, selectedYear, selectedCategories, highlightsOnly, sortDirection]);

  useEffect(() => {
    let lastScrollY = window.scrollY;
    let transitionLockUntil = 0;

    const changeToolbar = (compact: boolean) => {
      compactStateRef.current = compact;
      transitionLockUntil = performance.now() + 360;
      setIsCompact(compact);
    };

    const updateToolbar = () => {
      const scrollY = window.scrollY;
      const scrollingUp = scrollY < lastScrollY;

      if (performance.now() >= transitionLockUntil) {
        if (!compactStateRef.current && scrollY > 72) {
          changeToolbar(true);
        } else if (compactStateRef.current && scrollingUp && scrollY <= 12) {
          changeToolbar(false);
        }
      }

      lastScrollY = scrollY;
    };

    compactStateRef.current = window.scrollY > 72;
    setIsCompact(compactStateRef.current);
    window.addEventListener("scroll", updateToolbar, { passive: true });
    return () => window.removeEventListener("scroll", updateToolbar);
  }, []);

  useEffect(() => {
    const marker = loadMoreRef.current;
    if (!marker || visibleCount >= filteredEvents.length) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisibleCount((count) => Math.min(count + 36, filteredEvents.length));
        }
      },
      { rootMargin: "500px 0px" },
    );

    observer.observe(marker);
    return () => observer.disconnect();
  }, [filteredEvents.length, visibleCount]);

  function chooseYear(year: number | "all") {
    setSelectedYear(year);
    document.getElementById("timeline")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function toggleCategory(category: Category) {
    setSelectedCategories((current) =>
      current.includes(category) ? current.filter((item) => item !== category) : [...current, category],
    );
  }

  function resetFilters() {
    setQuery("");
    setSelectedYear("all");
    setSelectedCategories([]);
    setHighlightsOnly(true);
    setSortDirection("desc");
  }

  return (
    <main id="top">
      <nav className="topbar" aria-label="Primary navigation">
        <a className="wordmark" href="#top" aria-label="Epoch home">
          <span className="wordmark-mark" aria-hidden="true">E</span>
          <span>Epoch</span>
        </a>
        <div className="topbar-meta">
          <span className="live-dot" aria-hidden="true" />
          Archive updated Sep 2026
        </div>
        <div className="archive-total">{events.length} moments · {sourceCount} sources</div>
      </nav>

      <section className="explorer" id="timeline">
        <div className={`filter-shell ${isCompact ? "compact" : ""}`}>
          <div className="toolbar-row">
            <label className="search-box">
              <Search size={18} aria-hidden="true" />
              <span className="sr-only">Search the archive</span>
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search people, labs, models, ideas…"
              />
              {query && (
                <button className="clear-search" onClick={() => setQuery("")} aria-label="Clear search">
                  <X size={16} />
                </button>
              )}
            </label>

            <div className="view-mode-row">
              <div className="view-tabs" role="tablist" aria-label="Choose timeline dataset">
                <button
                  className={`view-tab ${!highlightsOnly ? "active" : ""}`}
                  role="tab"
                  aria-selected={!highlightsOnly}
                  onClick={() => setHighlightsOnly(false)}
                >
                  All events <span>{events.length}</span>
                </button>
                <button
                  className={`view-tab ${highlightsOnly ? "active" : ""}`}
                  role="tab"
                  aria-selected={highlightsOnly}
                  onClick={() => setHighlightsOnly(true)}
                >
                  Highlights <span>{highlightIds.length}</span>
                </button>
              </div>
            </div>

            <button
              className="sort-button"
              onClick={() => setSortDirection((value) => (value === "asc" ? "desc" : "asc"))}
              aria-label={`Sort ${sortDirection === "asc" ? "newest first" : "oldest first"}`}
            >
              {sortDirection === "asc" ? <ArrowDown size={17} /> : <ArrowUp size={17} />}
              {sortDirection === "asc" ? "Oldest" : "Newest"}
            </button>
          </div>

          <div className="category-row" aria-label="Filter by category">
            {categories.map((category) => {
              const active = selectedCategories.includes(category.value);
              return (
                <button
                  key={category.value}
                  className={`category-filter cat-${category.value} ${active ? "active" : ""}`}
                  onClick={() => toggleCategory(category.value)}
                  aria-pressed={active}
                >
                  <span className="category-dot" />
                  {category.label}
                  <span className="category-count">{categoryCounts[category.value]}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="timeline-layout">
          <aside className="year-index" aria-label="Filter by year">
            <p className="index-label">Index</p>
            <button
              className={`year-button ${selectedYear === "all" ? "active" : ""}`}
              onClick={() => chooseYear("all")}
            >
              <span>All years</span><span>{modeEvents.length}</span>
            </button>
            {[...years].reverse().map((year) => (
              <button
                key={year.year}
                className={`year-button ${selectedYear === year.year ? "active" : ""}`}
                onClick={() => chooseYear(year.year)}
              >
                <span>{year.year}</span><span>{yearCounts[year.year]}</span>
              </button>
            ))}
            <p className="index-note">Dates reflect the best available publication or announcement record.</p>
          </aside>

          <div className="timeline-content">
            {filteredEvents.length === 0 ? (
              <div className="empty-state">
                <span>0 results</span>
                <h3>No moment matches that trail.</h3>
                <p>Try another name, broaden the categories, or return to the essential record.</p>
                <button onClick={resetFilters}>Clear filters</button>
              </div>
            ) : (
              <div className="year-groups">
                {orderedYearGroups.map(([year, yearEvents]) => (
                    <section className="year-group" key={year} aria-labelledby={`year-${year}`}>
                      <div className="year-heading">
                        <h3 id={`year-${year}`}>{year}</h3>
                      </div>

                      <div className="event-list">
                        {yearEvents.map((event) => {
                          return (
                            <article
                              className={`event cat-${event.category}`}
                              key={event.id}
                              aria-labelledby={`title-${event.id}`}
                            >
                              <div className="event-date">
                                <span>{formatDate(event.date)}</span>
                                <span className="timeline-node" aria-hidden="true" />
                              </div>
                              <div className="event-body">
                                <span className="event-topline">
                                  <span className="event-category">
                                    <span className="category-dot" />
                                    {categoryLabels[event.category]}
                                  </span>
                                  <span className="event-proof">
                                    {event.verified && <><Check size={12} /> Verified</>}
                                  </span>
                                </span>
                                <h4 id={`title-${event.id}`}>{event.title}</h4>
                                <p className="event-summary">{event.summary}</p>
                                <span className="event-orgs">
                                  {event.organizations.slice(0, 4).map((organization) => (
                                    <span key={organization}>{organization}</span>
                                  ))}
                                  {event.organizations.length > 4 && <span>+{event.organizations.length - 4}</span>}
                                </span>
                                <div className="event-detail">
                                  <div className="why-it-matters">
                                    <span>Why it matters</span>
                                    <p>{event.significance}</p>
                                  </div>
                                  <div className="event-tags" aria-label="Tags">
                                    {event.tags.map((tag) => <span key={tag}>#{tag}</span>)}
                                  </div>
                                  {!!event.sources?.length && (
                                    <div className="source-list">
                                      <span className="source-title">Sources · {event.sources.length}</span>
                                      {event.sources.map((source, index) => (
                                        <a href={source.url} target="_blank" rel="noreferrer" key={`${source.url}-${index}`}>
                                          <span>{source.label}</span>
                                          <ArrowUpRight size={15} />
                                        </a>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </article>
                          );
                        })}
                      </div>
                    </section>
                  ))}
              </div>
            )}

            {visibleCount < filteredEvents.length && (
              <div className="scroll-sentinel" ref={loadMoreRef} aria-hidden="true" />
            )}
          </div>
        </div>
      </section>

      <footer>
        <div className="footer-mark">Epoch</div>
        <p>A living, sourced chronology of modern artificial intelligence.</p>
        <a href="#top">Back to the beginning <ArrowUp size={14} /></a>
      </footer>
    </main>
  );
}
