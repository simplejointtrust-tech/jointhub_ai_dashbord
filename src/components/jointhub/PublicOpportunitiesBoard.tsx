"use client";

import { ChevronRight, Search, Sparkles } from "lucide-react";
import { useMemo, useState } from "react";
import type { OpportunityListing } from "@/lib/jointhub/types";

function letterFor(title: string): string {
  const ch = title.trim().charAt(0).toUpperCase();
  return ch >= "A" && ch <= "Z" ? ch : "#";
}

function formatType(type: string): string {
  return type.replaceAll("_", " ");
}

export function PublicOpportunitiesBoard({ items }: { items: OpportunityListing[] }) {
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");

  const types = useMemo(() => {
    const set = new Set(items.map((item) => item.type).filter(Boolean));
    return Array.from(set).sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" }));
  }, [items]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items
      .filter((item) => (typeFilter === "all" ? true : item.type === typeFilter))
      .filter((item) => {
        if (!q) return true;
        const haystack = [
          item.title,
          item.org_name,
          item.type,
          item.status ?? "",
          item.description ?? "",
          ...(item.interest_tags ?? []),
        ]
          .join(" ")
          .toLowerCase();
        return haystack.includes(q);
      })
      .slice()
      .sort((a, b) => a.title.localeCompare(b.title, undefined, { sensitivity: "base" }));
  }, [items, query, typeFilter]);

  const groups = useMemo(() => {
    const map = new Map<string, OpportunityListing[]>();
    for (const item of filtered) {
      const letter = letterFor(item.title);
      const bucket = map.get(letter) ?? [];
      bucket.push(item);
      map.set(letter, bucket);
    }
    return Array.from(map.entries()).sort(([a], [b]) => {
      if (a === "#") return 1;
      if (b === "#") return -1;
      return a.localeCompare(b);
    });
  }, [filtered]);

  const letters = groups.map(([letter]) => letter);

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-[rgba(15,61,46,0.12)] bg-gradient-to-r from-[#0F3D2E]/[0.08] to-[#FBF7F0] p-5">
        <div className="flex items-start gap-3">
          <Sparkles className="mt-0.5 h-5 w-5 text-[#E07020]" aria-hidden />
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#E07020]">
              Trusted Opportunities
            </p>
            <h1 className="mt-1 text-lg font-semibold tracking-tight text-[#0F3D2E] sm:text-xl">
              Your Path to Growth Starts Here
            </h1>
            <p className="mt-1 text-sm font-medium leading-relaxed text-[rgba(26,21,16,0.80)]">
              Curated scholarships, fellowships, internships, and funding opportunities for African
              Leaders.
            </p>
            <p className="mt-2 text-sm leading-relaxed text-[rgba(26,21,16,0.68)]">
              These opportunities are curated from the JointHub Africa opportunity board. Open each
              official link to confirm deadlines and eligibility.
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3 rounded-2xl border border-[rgba(15,61,46,0.10)] bg-[#FBF7F0] p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative min-w-0 flex-1">
          <Search
            className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-[rgba(26,21,16,0.40)]"
            aria-hidden
          />
          <label htmlFor="opportunity-search" className="sr-only">
            Search opportunities
          </label>
          <input
            id="opportunity-search"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by name, organisation, or topic"
            className="h-11 w-full rounded-full border border-[rgba(15,61,46,0.14)] bg-white pr-4 pl-10 text-sm text-[#1A1510] outline-none placeholder:text-[rgba(26,21,16,0.45)] focus:border-[#0F3D2E] focus:ring-2 focus:ring-[rgba(15,61,46,0.18)]"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <label htmlFor="opportunity-type" className="sr-only">
            Filter by type
          </label>
          <select
            id="opportunity-type"
            value={typeFilter}
            onChange={(event) => setTypeFilter(event.target.value)}
            className="h-11 min-w-[10rem] rounded-full border border-[rgba(15,61,46,0.14)] bg-white px-4 text-sm font-medium text-[#0F3D2E] outline-none focus:border-[#0F3D2E] focus:ring-2 focus:ring-[rgba(15,61,46,0.18)]"
          >
            <option value="all">All types</option>
            {types.map((type) => (
              <option key={type} value={type}>
                {formatType(type)}
              </option>
            ))}
          </select>
          <p className="rounded-full bg-white px-3 py-2 text-xs font-semibold tabular-nums text-[rgba(26,21,16,0.70)]">
            {filtered.length} of {items.length}
          </p>
        </div>
      </div>

      {letters.length > 1 ? (
        <nav aria-label="Jump to letter" className="flex flex-wrap gap-1.5">
          {letters.map((letter) => (
            <a
              key={letter}
              href={`#letter-${letter === "#" ? "other" : letter}`}
              className="inline-flex h-9 min-w-9 items-center justify-center rounded-full border border-[rgba(15,61,46,0.12)] bg-white px-2 text-xs font-semibold text-[#0F3D2E] transition hover:border-[#0F3D2E]/40 hover:bg-[#FBF7F0]"
            >
              {letter}
            </a>
          ))}
        </nav>
      ) : null}

      <div className="space-y-8">
        {groups.map(([letter, groupItems]) => (
          <section
            key={letter}
            id={`letter-${letter === "#" ? "other" : letter}`}
            className="scroll-mt-24 space-y-3"
          >
            <div className="flex items-center gap-3">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#0F3D2E] text-sm font-semibold text-white">
                {letter}
              </span>
              <div>
                <h2 className="text-sm font-semibold tracking-tight text-[#0F3D2E]">
                  {letter === "#" ? "Other" : `Starting with ${letter}`}
                </h2>
                <p className="text-xs tabular-nums text-[rgba(26,21,16,0.55)]">
                  {groupItems.length} opportunit{groupItems.length === 1 ? "y" : "ies"}
                </p>
              </div>
            </div>

            <div className="grid gap-3">
              {groupItems.map((item) => {
                const applyHref = item.url?.trim() || null;
                return (
                  <article
                    key={item.opp_id}
                    className="rounded-2xl border border-[rgba(15,61,46,0.10)] bg-white p-4 shadow-sm"
                  >
                    <div className="grid gap-3 md:grid-cols-[1fr_auto] md:items-start">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-base font-semibold text-[#0F3D2E]">{item.title}</h3>
                          {item.is_verified ? (
                            <span className="rounded-full bg-[#0F3D2E]/10 px-2 py-0.5 text-[11px] font-semibold text-[#0F3D2E]">
                              Curated
                            </span>
                          ) : null}
                          {item.status ? (
                            <span className="rounded-full bg-[#E07020]/10 px-2 py-0.5 text-[11px] font-semibold text-[#c9611a]">
                              {item.status}
                            </span>
                          ) : null}
                          {item.is_scam_flag ? (
                            <span className="rounded-full bg-[#E0312E]/10 px-2 py-0.5 text-[11px] font-semibold text-[#E0312E]">
                              Review carefully
                            </span>
                          ) : null}
                        </div>
                        <p className="mt-1 text-sm text-[rgba(26,21,16,0.65)]">
                          {item.org_name} · {formatType(item.type)} · {item.deadline}
                        </p>
                        {item.location ? (
                          <p className="mt-1 text-xs text-[rgba(26,21,16,0.55)]">{item.location}</p>
                        ) : null}
                        {item.description ? (
                          <p className="mt-2 text-sm leading-relaxed text-[rgba(26,21,16,0.72)]">
                            {item.description}
                          </p>
                        ) : null}
                        {item.interest_tags && item.interest_tags.length > 0 ? (
                          <div className="mt-2 flex flex-wrap gap-1">
                            {item.interest_tags.slice(0, 6).map((tag) => (
                              <span
                                key={`${item.opp_id}-${tag}`}
                                className="rounded-full bg-[#FBF7F0] px-2 py-0.5 text-[11px] text-[rgba(26,21,16,0.70)]"
                              >
                                {tag.replaceAll("_", " ")}
                              </span>
                            ))}
                          </div>
                        ) : null}
                      </div>
                      <div className="flex flex-col items-start gap-2 md:items-end">
                        {applyHref ? (
                          <a
                            href={applyHref}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 rounded-full bg-[#0F3D2E] px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-[#0A2A20]"
                          >
                            Open listing
                            <ChevronRight className="h-3.5 w-3.5" aria-hidden />
                          </a>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full border border-[rgba(15,61,46,0.15)] px-3 py-1.5 text-xs font-semibold text-[rgba(26,21,16,0.55)]">
                            Link pending
                          </span>
                        )}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        ))}

        {filtered.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-[rgba(15,61,46,0.18)] bg-[#FBF7F0] p-6 text-sm text-[rgba(26,21,16,0.60)]">
            No opportunities match that search. Try another keyword or clear the type filter.
          </p>
        ) : null}
      </div>
    </div>
  );
}
