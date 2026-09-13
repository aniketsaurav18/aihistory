"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpRight,
  Check,
  Search,
  Sparkles,
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

  const highlights = useMemo(() => new Set(highlightIds), [highlightIds]);
  const categoryCounts = useMemo(
    () =>
      Object.fromEntries(
        categories.map(({ value }) => [value, events.filter((event) => event.category === value).length]),
      ) as Record<Category, number>,
    [events],
  );

  const verifiedCount = useMemo(() => events.filter((event) => event.verified).length, [events]);
  const sourceCount = useMemo(
    () => events.reduce((total, event) => total + (event.sources?.length || 0), 0),
    [events],
  );

  const filteredEvents = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const result = events.filter((event) => {
      if (selectedYear !== "all" && Number(event.date.slice(0, 4)) !== selectedYear) return false;
      if (selectedCategories.length && !selectedCategories.includes(event.category)) return false;
      if (highlightsOnly && !highlights.has(event.id)) return false;
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
  }, [events, highlights, highlightsOnly, query, selectedCategories, selectedYear, sortDirection]);

  const visibleEvents = filteredEvents.slice(0, visibleCount);
  const groupedEvents = visibleEvents.reduce<Record<string, TimelineEvent[]>>((groups, event) => {
    const year = event.date.slice(0, 4);
    groups[year] ||= [];
    groups[year].push(event);
    return groups;
  }, {});

  const hasFilters =
    query.length > 0 ||
    selectedYear !== "all" ||
    selectedCategories.length > 0 ||
    !highlightsOnly;

  useEffect(() => {
    setVisibleCount(28);
  }, [query, selectedYear, selectedCategories, highlightsOnly, sortDirection]);

  function chooseYear(year: number | "all") {
    setSelectedYear(year);
    if (year !== "all") setHighlightsOnly(false);
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
        <div className="filter-shell">
          <div className="search-row">
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
            <button
              className={`essential-toggle ${highlightsOnly ? "active" : ""}`}
              onClick={() => setHighlightsOnly((value) => !value)}
              aria-pressed={highlightsOnly}
            >
              <Sparkles size={16} />
              {highlightsOnly ? "Essential moments" : "Full archive"}
            </button>
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
              <span>All years</span><span>{events.length}</span>
            </button>
            {years.map((year) => (
              <button
                key={year.year}
                className={`year-button ${selectedYear === year.year ? "active" : ""}`}
                onClick={() => chooseYear(year.year)}
              >
                <span>{year.year}</span><span>{year.count}</span>
              </button>
            ))}
            <p className="index-note">Dates reflect the best available publication or announcement record.</p>
          </aside>

          <div className="timeline-content">
            <div className="results-heading">
              <div>
                <p className="eyebrow">A sourced history of modern AI · 2017—2026</p>
                <h2>
                  {selectedYear === "all" ? "All eras" : selectedYear}
                  <span> / {filteredEvents.length} moments</span>
                </h2>
              </div>
              <div className="results-meta">
                <span>{verifiedCount} fully verified</span>
                {hasFilters && <button className="reset-button" onClick={resetFilters}>Reset view</button>}
              </div>
            </div>

            {filteredEvents.length === 0 ? (
              <div className="empty-state">
                <span>0 results</span>
                <h3>No moment matches that trail.</h3>
                <p>Try another name, broaden the categories, or return to the essential record.</p>
                <button onClick={resetFilters}>Clear filters</button>
              </div>
            ) : (
              <div className="year-groups">
                {Object.entries(groupedEvents).map(([year, yearEvents]) => {
                  const yearMeta = years.find((item) => String(item.year) === year);
                  return (
                    <section className="year-group" key={year} aria-labelledby={`year-${year}`}>
                      <div className="year-heading">
                        <h3 id={`year-${year}`}>{year}</h3>
                        <p>{yearMeta?.description}</p>
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
                              </div>

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
                            </article>
                          );
                        })}
                      </div>
                    </section>
                  );
                })}
              </div>
            )}

            {visibleCount < filteredEvents.length && (
              <button className="load-more" onClick={() => setVisibleCount((count) => count + 36)}>
                Load the next chapter
                <span>{filteredEvents.length - visibleCount} moments remain</span>
              </button>
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
