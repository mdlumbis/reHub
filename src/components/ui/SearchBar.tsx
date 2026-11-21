import { Search } from "lucide-react";
import { LocationPicker } from "./LocationPicker";

/** Name/service + location search. Submits a GET to /search. Used on the homepage and search page. */
export function SearchBar({
  defaultQuery,
  defaultLocation,
  hidden,
}: {
  defaultQuery?: string;
  defaultLocation?: string;
  /** Extra params to keep (e.g. current filters). */
  hidden?: Record<string, string | string[]>;
}) {
  return (
    <form
      action="/search"
      className="flex flex-col gap-2 rounded-xl border border-line bg-white p-2 sm:flex-row sm:items-center"
    >
      {Object.entries(hidden ?? {}).flatMap(([k, v]) =>
        (Array.isArray(v) ? v : [v]).map((val) => <input key={`${k}-${val}`} type="hidden" name={k} value={val} />),
      )}
      <label className="flex flex-1 items-center gap-3 px-3">
        <Search className="h-5 w-5 shrink-0 text-brand" />
        <span className="sr-only">Search</span>
        <input
          name="q"
          defaultValue={defaultQuery}
          placeholder="Search a name, specialization or service"
          className="h-11 w-full bg-transparent text-ink outline-none placeholder:text-muted"
        />
      </label>
      <LocationPicker name="location" defaultValue={defaultLocation} />
      <button className="h-12 rounded-lg bg-brand px-5 font-semibold text-white hover:bg-brand-hover">Search</button>
    </form>
  );
}
