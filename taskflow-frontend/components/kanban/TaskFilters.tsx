'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, Filter, X } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';

interface TaskFiltersProps {
  onFilterChange: (filters: any) => void;
  projectMembers?: any[];
}

export function TaskFilters({ onFilterChange, projectMembers = [] }: TaskFiltersProps) {
  const [search, setSearch] = useState('');
  const [priority, setPriority] = useState('all');
  const [assignee, setAssignee] = useState('all');
  const [overdue, setOverdue] = useState(false);
  const [activeFilters, setActiveFilters] = useState(0);

  const applyFilters = () => {
    const filters: any = {};

    if (search) filters.search = search;
    // Only add filter if not 'all'
    if (priority !== 'all') filters.priority = priority;
    if (assignee !== 'all') filters.assignee = assignee;
    if (overdue) filters.overdue = true;

    const count = Object.keys(filters).length;
    setActiveFilters(count);
    onFilterChange(filters);
  };

  const clearFilters = () => {
    setSearch('');
    setPriority('all');
    setAssignee('all');
    setOverdue(false);
    setActiveFilters(0);
    onFilterChange({});
  };

  return (
    <div className="flex items-center space-x-2">
      {/* Search Input */}
      <div className="relative flex-1 max-w-sm">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search tasks..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
          className="pl-10"
        />
      </div>

      {/* Filter Popover */}
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="relative">
            <Filter className="h-4 w-4 mr-2" />
            Filters
            {activeFilters > 0 && (
              <Badge
                variant="destructive"
                className="ml-2 h-5 w-5 p-0 flex items-center justify-center text-xs"
              >
                {activeFilters}
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80" align="end">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-sm">Filters</h4>
              {activeFilters > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="h-auto p-0 text-blue-600 text-sm"
                >
                  Clear all
                </Button>
              )}
            </div>

            <div className="space-y-3">
              {/* Priority Filter */}
              <div className="space-y-1">
                <Label className="text-xs text-gray-500">Priority</Label>
                <Select value={priority} onValueChange={setPriority}>
                  <SelectTrigger className="h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {/* Use 'all' instead of empty string */}
                    <SelectItem value="all">All priorities</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Assignee Filter */}
              <div className="space-y-1">
                <Label className="text-xs text-gray-500">Assignee</Label>
                <Select value={assignee} onValueChange={setAssignee}>
                  <SelectTrigger className="h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {/* Use 'all' instead of empty string */}
                    <SelectItem value="all">All assignees</SelectItem>
                    {Array.isArray(projectMembers) && projectMembers.map((member) => (
                      <SelectItem
                        key={member.id}
                        value={member.id}
                      >
                        {member.full_name || member.email}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Overdue Filter */}
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="overdue"
                  checked={overdue}
                  onChange={(e) => setOverdue(e.target.checked)}
                  className="rounded border-gray-300"
                />
                <Label htmlFor="overdue" className="text-sm cursor-pointer">
                  Show only overdue tasks
                </Label>
              </div>
            </div>

            {/* Apply Button */}
            <Button onClick={applyFilters} className="w-full" size="sm">
              Apply Filters
            </Button>
          </div>
        </PopoverContent>
      </Popover>

      {/* Clear button when filters active */}
      {activeFilters > 0 && (
        <Button
          variant="ghost"
          size="sm"
          onClick={clearFilters}
          className="text-gray-500"
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}