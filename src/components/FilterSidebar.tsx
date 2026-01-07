import { useState } from 'react';
import { Filter, X, ChevronDown, Calendar as CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { locations, difficultyLabels, type Difficulty } from '@/data/mockTrips';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { cn } from '@/lib/utils';

export interface Filters {
  locations: string[];
  difficulties: Difficulty[];
  dateFrom: string;
  dateTo: string;
}

interface FilterSidebarProps {
  filters: Filters;
  onFiltersChange: (filters: Filters) => void;
  onClear: () => void;
}

export const FilterSidebar = ({ filters, onFiltersChange, onClear }: FilterSidebarProps) => {
  const [openSections, setOpenSections] = useState({
    location: true,
    difficulty: true,
    dateRange: true,
  });

  const toggleLocation = (location: string) => {
    const newLocations = filters.locations.includes(location)
      ? filters.locations.filter((l) => l !== location)
      : [...filters.locations, location];
    onFiltersChange({ ...filters, locations: newLocations });
  };

  const toggleDifficulty = (difficulty: Difficulty) => {
    const newDifficulties = filters.difficulties.includes(difficulty)
      ? filters.difficulties.filter((d) => d !== difficulty)
      : [...filters.difficulties, difficulty];
    onFiltersChange({ ...filters, difficulties: newDifficulties });
  };

  const hasActiveFilters =
    filters.locations.length > 0 ||
    filters.difficulties.length > 0 ||
    filters.dateFrom !== '' ||
    filters.dateTo !== '';

  return (
    <aside className="w-full lg:w-72 shrink-0">
      <div className="bg-card rounded-2xl border border-border/60 shadow-card p-5 sticky top-6">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-primary" />
            <h2 className="font-semibold text-lg">Bộ lọc</h2>
          </div>
          {hasActiveFilters && (
            <button
              onClick={onClear}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
            >
              <X className="h-3.5 w-3.5" />
              Xóa
            </button>
          )}
        </div>

        <div className="space-y-4">
          {/* Location Filter */}
          <Collapsible
            open={openSections.location}
            onOpenChange={(open) =>
              setOpenSections((prev) => ({ ...prev, location: open }))
            }
          >
            <CollapsibleTrigger className="flex items-center justify-between w-full py-2 text-sm font-medium hover:text-primary transition-colors">
              <span>Địa điểm</span>
              <ChevronDown
                className={`h-4 w-4 transition-transform ${
                  openSections.location ? 'rotate-180' : ''
                }`}
              />
            </CollapsibleTrigger>
            <CollapsibleContent className="pt-2 space-y-2">
              {locations.map((location) => (
                <div key={location} className="flex items-center space-x-3">
                  <Checkbox
                    id={`loc-${location}`}
                    checked={filters.locations.includes(location)}
                    onCheckedChange={() => toggleLocation(location)}
                    className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                  />
                  <Label
                    htmlFor={`loc-${location}`}
                    className="text-sm font-normal cursor-pointer"
                  >
                    {location}
                  </Label>
                </div>
              ))}
            </CollapsibleContent>
          </Collapsible>

          <div className="h-px bg-border" />

          {/* Difficulty Filter */}
          <Collapsible
            open={openSections.difficulty}
            onOpenChange={(open) =>
              setOpenSections((prev) => ({ ...prev, difficulty: open }))
            }
          >
            <CollapsibleTrigger className="flex items-center justify-between w-full py-2 text-sm font-medium hover:text-primary transition-colors">
              <span>Độ khó</span>
              <ChevronDown
                className={`h-4 w-4 transition-transform ${
                  openSections.difficulty ? 'rotate-180' : ''
                }`}
              />
            </CollapsibleTrigger>
            <CollapsibleContent className="pt-2 space-y-2">
              {(Object.entries(difficultyLabels) as [Difficulty, string][]).map(
                ([key, label]) => (
                  <div key={key} className="flex items-center space-x-3">
                    <Checkbox
                      id={`diff-${key}`}
                      checked={filters.difficulties.includes(key)}
                      onCheckedChange={() => toggleDifficulty(key)}
                      className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                    />
                    <Label
                      htmlFor={`diff-${key}`}
                      className="text-sm font-normal cursor-pointer flex items-center gap-2"
                    >
                      <span
                        className={`w-2 h-2 rounded-full ${
                          key === 'easy'
                            ? 'bg-difficulty-easy'
                            : key === 'medium'
                            ? 'bg-difficulty-medium'
                            : key === 'hard'
                            ? 'bg-difficulty-hard'
                            : 'bg-difficulty-extreme'
                        }`}
                      />
                      {label}
                    </Label>
                  </div>
                )
              )}
            </CollapsibleContent>
          </Collapsible>

          <div className="h-px bg-border" />

          {/* Date Range Filter */}
          <Collapsible
            open={openSections.dateRange}
            onOpenChange={(open) =>
              setOpenSections((prev) => ({ ...prev, dateRange: open }))
            }
          >
            <CollapsibleTrigger className="flex items-center justify-between w-full py-2 text-sm font-medium hover:text-primary transition-colors">
              <span>Thời gian khởi hành</span>
              <ChevronDown
                className={`h-4 w-4 transition-transform ${
                  openSections.dateRange ? 'rotate-180' : ''
                }`}
              />
            </CollapsibleTrigger>
            <CollapsibleContent className="pt-2 space-y-3">
              <div>
                <Label className="text-xs text-muted-foreground mb-1 block">Từ ngày</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !filters.dateFrom && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {filters.dateFrom ? format(new Date(filters.dateFrom), "dd/MM/yyyy", { locale: vi }) : "Chọn ngày"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={filters.dateFrom ? new Date(filters.dateFrom) : undefined}
                      onSelect={(date) =>
                        onFiltersChange({ ...filters, dateFrom: date ? format(date, "yyyy-MM-dd") : '' })
                      }
                      initialFocus
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground mb-1 block">Đến ngày</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !filters.dateTo && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {filters.dateTo ? format(new Date(filters.dateTo), "dd/MM/yyyy", { locale: vi }) : "Chọn ngày"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={filters.dateTo ? new Date(filters.dateTo) : undefined}
                      onSelect={(date) =>
                        onFiltersChange({ ...filters, dateTo: date ? format(date, "yyyy-MM-dd") : '' })
                      }
                      initialFocus
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </CollapsibleContent>
          </Collapsible>
        </div>

        <div className="mt-6 pt-4 border-t border-border">
          <Button
            variant="default"
            className="w-full gradient-mountain text-primary-foreground shadow-button hover:opacity-90 transition-opacity"
          >
            Áp dụng bộ lọc
          </Button>
        </div>
      </div>
    </aside>
  );
};
