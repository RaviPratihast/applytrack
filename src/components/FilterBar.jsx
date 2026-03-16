import { Search, Download } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { APPLICATION_STATUS } from "@/types/application";

const STATUS_FILTERS = [
  { value: "all",                         label: "All" },
  { value: APPLICATION_STATUS.APPLIED,   label: "Applied" },
  { value: APPLICATION_STATUS.INTERVIEW, label: "Interview" },
  { value: APPLICATION_STATUS.OFFER,     label: "Offer" },
  { value: APPLICATION_STATUS.REJECTED,  label: "Rejected" },
];

const SORT_OPTIONS = [
  { value: "date-desc",    label: "Newest first" },
  { value: "date-asc",     label: "Oldest first" },
  { value: "company-asc",  label: "Company A–Z" },
  { value: "company-desc", label: "Company Z–A" },
];

function FilterBar({ search, onSearchChange, statusFilter, onStatusFilterChange, sortBy, onSortByChange, onExportCsv }) {
  return (
    <div className="flex flex-col gap-3 flex-shrink-0">
      <div className="flex items-center gap-3 flex-wrap h-10">
        <div className="relative flex-1 min-w-48 h-10">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            className="pl-9 h-10 rounded-[10px] border-[1.5px] border-app-border bg-white"
            placeholder="Search company or role…"
            value={search}
            onChange={e => onSearchChange(e.target.value)}
          />
        </div>
        <Select value={sortBy} onValueChange={onSortByChange}>
          <SelectTrigger className="w-44 h-10 rounded-[10px] border-[1.5px] border-app-border bg-white">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            {SORT_OPTIONS.map(o => (
              <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          variant="outline"
          size="sm"
          className="rounded-[10px] gap-1.5 h-10 border-app-border"
          onClick={onExportCsv}
        >
          <Download className="h-3.5 w-3.5" />
          Export CSV
        </Button>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        {STATUS_FILTERS.map(f => (
          <button
            key={f.value}
            onClick={() => onStatusFilterChange(f.value)}
            className={`px-3 py-1 rounded-[10px] text-xs font-medium transition-colors border ${
              statusFilter === f.value
                ? "bg-app-accent text-black border-app-accent"
                : "bg-transparent text-muted-foreground border-app-border hover:border-foreground hover:text-foreground"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export default FilterBar;
