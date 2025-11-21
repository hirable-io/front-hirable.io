"use client"

import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

export interface Tag {
  id: number
  name: string
}

interface TagComboboxProps {
  tags: Tag[]
  value?: Tag[]
  onChange?: (value: Tag[]) => void
  placeholder?: string
  searchPlaceholder?: string
  emptyText?: string
  className?: string
}

export function TagCombobox({
  tags,
  value = [],
  onChange,
  placeholder = "Selecione as tags...",
  searchPlaceholder = "Buscar tags...",
  emptyText = "Nenhuma tag encontrada.",
  className,
}: TagComboboxProps) {
  const [open, setOpen] = React.useState(false)

  const handleSelect = (tag: Tag) => {
    if (!onChange) return

    const isSelected = value.some((t) => t.id === tag.id)

    if (isSelected) {
      onChange(value.filter((t) => t.id !== tag.id))
    } else {
      onChange([...value, tag])
    }
  }

  const selectedCount = value.length
  const displayText =
    selectedCount === 0
      ? placeholder
      : `${selectedCount} tag${selectedCount > 1 ? "s" : ""} selecionada${selectedCount > 1 ? "s" : ""}`

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full justify-between", className)}
        >
          {displayText}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command>
          <CommandInput placeholder={searchPlaceholder} />
          <CommandList className="max-h-[200px] overflow-y-auto">
            <CommandEmpty>{emptyText}</CommandEmpty>
            <CommandGroup>
              {tags.map((tag) => {
                const isSelected = value.some((t) => t.id === tag.id)
                return (
                  <CommandItem key={tag.id} value={tag.name} onSelect={() => handleSelect(tag)}>
                    <Check className={cn("mr-2 h-4 w-4", isSelected ? "opacity-100" : "opacity-0")} />
                    {tag.name}
                  </CommandItem>
                )
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
