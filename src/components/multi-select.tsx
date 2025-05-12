"use client"

import * as React from "react"
import { X, Check, ChevronsUpDown, Plus } from "lucide-react"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

export type Option = {
    value: string
    label: string
}

interface MultiSelectProps {
    options: Option[]
    selected: string[]
    setSelected: (selected: string[]) => void
    placeholder?: string
    className?: string
    createOption?: (inputValue: string) => Promise<string | null>
}

export function MultiSelect({
                                options,
                                selected,
                                setSelected,
                                placeholder = "Select options",
                                className,
                                createOption,
                            }: MultiSelectProps) {
    const [open, setOpen] = React.useState(false)
    const [inputValue, setInputValue] = React.useState("")
    const [isCreating, setIsCreating] = React.useState(false)

    const handleUnselect = (item: string) => {
        setSelected(selected.filter((i) => i !== item))
    }

    const handleSelect = (value: string) => {
        setSelected([...selected, value])
        setInputValue("")
    }

    const handleCreateOption = async () => {
        if (!inputValue || !createOption) return

        setIsCreating(true)
        try {
            const newValue = await createOption(inputValue)
            if (newValue) {
                handleSelect(newValue)
            }
        } catch (error) {
            console.error("Error creating option:", error)
        } finally {
            setIsCreating(false)
            setInputValue("")
        }
    }

    const availableOptions = options.filter((option) => !selected.includes(option.value))
    const showCreateOption =
        createOption &&
        inputValue &&
        !options.some(
            (option) =>
                option.value.toLowerCase() === inputValue.toLowerCase() ||
                option.label.toLowerCase() === inputValue.toLowerCase(),
        )

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className={cn("min-h-10 h-auto w-full justify-between", className)}
                >
                    <div className="flex flex-wrap gap-1">
                        {selected.length === 0 ? (
                            <span className="text-muted-foreground">{placeholder}</span>
                        ) : (
                            selected.map((item) => {
                                const option = options.find((option) => option.value === item)
                                return (
                                    <Badge
                                        key={item}
                                        variant="secondary"
                                        className="mr-1 mb-1"
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            handleUnselect(item)
                                        }}
                                    >
                                        {option?.label || item}
                                        <X className="ml-1 h-3 w-3" />
                                    </Badge>
                                )
                            })
                        )}
                    </div>
                    <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0">
                <Command>
                    <CommandInput placeholder="Search..." value={inputValue} onValueChange={setInputValue} />
                    <CommandList>
                        <CommandEmpty>
                            {showCreateOption ? (
                                <Button
                                    variant="ghost"
                                    className="w-full justify-start text-sm"
                                    onClick={handleCreateOption}
                                    disabled={isCreating}
                                >
                                    <Plus className="mr-2 h-4 w-4" />
                                    Create &#34;{inputValue}&#34;
                                </Button>
                            ) : (
                                "No options found."
                            )}
                        </CommandEmpty>
                        <CommandGroup>
                            {availableOptions.map((option) => (
                                <CommandItem
                                    key={option.value}
                                    value={option.value}
                                    onSelect={() => {
                                        handleSelect(option.value)
                                        setOpen(true)
                                    }}
                                >
                                    <Check
                                        className={cn("mr-2 h-4 w-4", selected.includes(option.value) ? "opacity-100" : "opacity-0")}
                                    />
                                    {option.label}
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    )
}

