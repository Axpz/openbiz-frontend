import * as React from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, X } from "lucide-react"
import { cn } from "@/lib/utils"

interface TableFilterProps {
  placeholder?: string
  value: string
  onValueChange: (value: string) => void
  onClear?: () => void
  className?: string
}

const TableFilter = React.forwardRef<HTMLInputElement, TableFilterProps>(
  ({ placeholder = "搜索...", value, onValueChange, onClear, className, ...props }, ref) => {
    return (
      <div className={cn("relative", className)}>
        <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          ref={ref}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onValueChange(e.target.value)}
          className="pl-8 pr-8 h-8 text-sm"
          {...props}
        />
        {value && (
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-0 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 hover:bg-transparent"
            onClick={onClear}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    )
  }
)
TableFilter.displayName = "TableFilter"

export { TableFilter } 