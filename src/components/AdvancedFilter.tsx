import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ChevronUp, Filter, X } from "lucide-react";
import { DataStatus, ContentType } from "@/shared/types";
import { useState } from "react";

export interface FilterState {
  search: string;
  status: DataStatus | "all";
  contentType: ContentType | "all";
  minScore: string;
  maxScore: string;
  submittedBy: string;
}

interface AdvancedFilterProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  onClearFilters: () => void;
}

export function AdvancedFilter({
  filters,
  onFiltersChange,
  onClearFilters,
}: AdvancedFilterProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const activeFilterCount = Object.entries(filters).filter(([key, value]) => {
    if (key === "search" || key === "submittedBy" || key === "minScore" || key === "maxScore") {
      return value !== "";
    }
    return value !== "all";
  }).length;

  const handleClear = () => {
    console.log("Filters cleared");
    onClearFilters();
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          onClick={() => setIsExpanded(!isExpanded)}
          className="gap-2"
          data-testid="button-toggle-filters"
        >
          <Filter className="h-4 w-4" />
          Filters
          {activeFilterCount > 0 && (
            <Badge variant="secondary" className="ml-1 h-5 min-w-5 px-1">
              {activeFilterCount}
            </Badge>
          )}
          {isExpanded ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </Button>

        <Input
          placeholder="Search by ID or description..."
          value={filters.search}
          onChange={(e) =>
            onFiltersChange({ ...filters, search: e.target.value })
          }
          className="max-w-md"
          data-testid="input-search"
        />

        {activeFilterCount > 0 && (
          <Button
            variant="ghost"
            onClick={handleClear}
            className="gap-2"
            data-testid="button-clear-filters"
          >
            <X className="h-4 w-4" />
            Clear Filters
          </Button>
        )}
      </div>

      {isExpanded && (
        <Card className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-2 block">
                Status
              </label>
              <Select
                value={filters.status}
                onValueChange={(value) =>
                  onFiltersChange({
                    ...filters,
                    status: value as DataStatus | "all",
                  })
                }
              >
                <SelectTrigger data-testid="select-status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-2 block">
                Content Type
              </label>
              <Select
                value={filters.contentType}
                onValueChange={(value) =>
                  onFiltersChange({
                    ...filters,
                    contentType: value as ContentType | "all",
                  })
                }
              >
                <SelectTrigger data-testid="select-content-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="image">Image</SelectItem>
                  <SelectItem value="text">Text</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-2 block">
                Submitted By
              </label>
              <Input
                placeholder="Filter by submitter..."
                value={filters.submittedBy}
                onChange={(e) =>
                  onFiltersChange({ ...filters, submittedBy: e.target.value })
                }
                data-testid="input-submitted-by"
              />
            </div>

            <div className="md:col-span-2">
              <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-2 block">
                Score Range
              </label>
              <div className="flex gap-2 items-center">
                <Input
                  type="number"
                  placeholder="Min (0)"
                  min="0"
                  max="100"
                  value={filters.minScore}
                  onChange={(e) =>
                    onFiltersChange({ ...filters, minScore: e.target.value })
                  }
                  data-testid="input-min-score"
                />
                <span className="text-muted-foreground">-</span>
                <Input
                  type="number"
                  placeholder="Max (100)"
                  min="0"
                  max="100"
                  value={filters.maxScore}
                  onChange={(e) =>
                    onFiltersChange({ ...filters, maxScore: e.target.value })
                  }
                  data-testid="input-max-score"
                />
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
