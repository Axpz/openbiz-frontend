'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search as SearchIcon, RefreshCcw } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Calendar as CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface SearchFilterBarProps {
  searchText: string;
  onSearchTextChange: (text: string) => void;
  onSearch: () => void;
  onReset: () => void;
  startDate?: Date;
  endDate?: Date;
  onStartDateChange: (date: Date | undefined) => void;
  onEndDateChange: (date: Date | undefined) => void;
  searchPlaceholder?: string;
  className?: string;
}

export function SearchFilterBar({
  searchText,
  onSearchTextChange,
  onSearch,
  onReset,
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  searchPlaceholder = "请输入名称",
  className = ""
}: SearchFilterBarProps) {
  return (
    <div className={cn("flex flex-wrap justify-between items-center mb-4 gap-2", className)}>
      <div className="flex flex-wrap items-center gap-2 w-auto">
        <Input
          id="search-input"
          type="text"
          placeholder={searchPlaceholder}
          value={searchText}
          onChange={e => onSearchTextChange(e.target.value)}
          className="h-9 w-60"
          onKeyDown={e => {
            if (e.key === 'Enter') onSearch();
          }}
        />
        <div className="flex items-center bg-white rounded-md border border-input px-2 h-9 ml-2">
          <DatePickerWrapper
            value={startDate}
            onChange={onStartDateChange}
            placeholder="开始日期"
            id="start-date-picker"
          />
          <span className="mx-2 text-gray-500">至</span>
          <DatePickerWrapper
            value={endDate}
            onChange={onEndDateChange}
            placeholder="结束日期"
            id="end-date-picker"
          />
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-9 w-9"
          onClick={onSearch}
        >
          <SearchIcon className="w-4 h-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-9 w-9"
          onClick={onReset}
        >
          <RefreshCcw className="w-4 h-4" />
        </Button>
      </div>
      <div></div>
    </div>
  );
}

interface DatePickerWrapperProps {
  value: Date | undefined;
  onChange: (date: Date | undefined) => void;
  placeholder: string;
  id?: string;
}

function DatePickerWrapper({ value, onChange, placeholder, id }: DatePickerWrapperProps) {
  const [open, setOpen] = React.useState(false);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          variant={"outline"}
          className={cn(
            "w-[120px] justify-start text-left font-normal px-2 h-7 text-sm",
            !value && "text-muted-foreground"
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {value ? format(value, "yyyy-MM-dd") : <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={value}
          onSelect={onChange}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
} 