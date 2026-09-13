import TimelineExplorer from "@/components/timeline-explorer";
import type { TimelineEvent, YearMeta } from "@/lib/types";
import y2017 from "@/data/years/2017.json";
import y2018 from "@/data/years/2018.json";
import y2019 from "@/data/years/2019.json";
import y2020 from "@/data/years/2020.json";
import y2021 from "@/data/years/2021.json";
import y2022 from "@/data/years/2022.json";
import y2023 from "@/data/years/2023.json";
import y2024 from "@/data/years/2024.json";
import y2025 from "@/data/years/2025.json";
import y2026 from "@/data/years/2026.json";
import importantEvents from "@/data/important_events.json";

const yearFiles = [y2017, y2018, y2019, y2020, y2021, y2022, y2023, y2024, y2025, y2026];

export default function Home() {
  const events = yearFiles
    .flatMap((file) => file.events as TimelineEvent[])
    .sort((a, b) => a.date.localeCompare(b.date));

  const years: YearMeta[] = yearFiles.map((file) => ({
    year: file.year,
    description: file.description,
    count: events.filter((event) => event.date.startsWith(String(file.year))).length,
  }));

  const highlightIds = (importantEvents.events as TimelineEvent[]).map((event) => event.id);

  return <TimelineExplorer events={events} years={years} highlightIds={highlightIds} />;
}
