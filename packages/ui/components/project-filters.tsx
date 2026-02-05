import { Input } from './input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './select';

export interface ProjectFiltersProps {
  search: string;
  onSearchChange: (search: string) => void;
  sortBy: 'recent' | 'name' | 'progress';
  onSortChange: (sort: 'recent' | 'name' | 'progress') => void;
  statusFilter: 'all' | 'building' | 'ready' | 'error' | 'idle';
  onStatusFilterChange: (
    status: 'all' | 'building' | 'ready' | 'error' | 'idle',
  ) => void;
}

export function ProjectFilters({
  search,
  onSearchChange,
  sortBy,
  onSortChange,
  statusFilter,
  onStatusFilterChange,
}: ProjectFiltersProps) {
  return (
    <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
      {/* Search */}
      <div className="w-full flex-1 sm:w-auto">
        <Input
          type="search"
          placeholder="Search projects..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full"
        />
      </div>

      {/* Sort */}
      <div className="flex w-full items-center gap-2 sm:w-auto">
        <span className="whitespace-nowrap text-sm text-muted-foreground">
          Sort by:
        </span>
        <Select value={sortBy} onValueChange={onSortChange}>
          <SelectTrigger className="w-[140px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="recent">Recent</SelectItem>
            <SelectItem value="name">Name</SelectItem>
            <SelectItem value="progress">Progress</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Status Filter */}
      <div className="flex w-full items-center gap-2 sm:w-auto">
        <span className="whitespace-nowrap text-sm text-muted-foreground">
          Status:
        </span>
        <Select value={statusFilter} onValueChange={onStatusFilterChange}>
          <SelectTrigger className="w-[130px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="building">Building</SelectItem>
            <SelectItem value="ready">Ready</SelectItem>
            <SelectItem value="error">Error</SelectItem>
            <SelectItem value="idle">Idle</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
