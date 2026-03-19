import { Search, Download } from "lucide-react";
import { Input } from "@/components/ui/input";
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
    <div className="flex items-center gap-2 flex-shrink-0 min-h-[48px]">
      <div className="relative flex-1 min-w-48 h-10">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        <Input
          className="pl-9 h-10 rounded-[10px] border-[1.5px] border-app-border bg-white"
          placeholder="Search by company or role..."
          value={search}
          onChange={e => onSearchChange(e.target.value)}
        />
      </div>
      <Select value={statusFilter} onValueChange={onStatusFilterChange}>
        <SelectTrigger className="w-[130px] h-10 rounded-[10px] border-[1.5px] border-app-border bg-white">
          <span className="text-muted-foreground">Status: </span>
          <SelectValue placeholder="All" />
        </SelectTrigger>
        <SelectContent>
          {STATUS_FILTERS.map(f => (
            <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select value={sortBy} onValueChange={onSortByChange}>
        <SelectTrigger className="w-[150px] h-10 rounded-[10px] border-[1.5px] border-app-border bg-white">
          <span className="text-muted-foreground">Sort: </span>
          <SelectValue placeholder="Newest first" />
        </SelectTrigger>
        <SelectContent>
          {SORT_OPTIONS.map(o => (
            <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      <button
        type="button"
        onClick={onExportCsv}
        className="rounded-[10px] h-10 px-4 bg-app-dark text-white text-sm font-medium hover:opacity-90 transition-opacity inline-flex items-center gap-2 shrink-0"
      >
        <Download className="h-4 w-4" />
        Export CSV
      </button>
    </div>
  );
}

export default FilterBar;
