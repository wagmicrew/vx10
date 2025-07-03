"use client"

import * as React from "react"
import { Clock } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export interface TimePickerProps {
  time?: string
  setTime?: (time: string | undefined) => void
  className?: string
  placeholder?: string
}

export function TimePicker({
  time,
  setTime,
  className,
  placeholder = "Pick a time",
}: TimePickerProps) {
  const hours = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'))
  const minutes = ['00', '15', '30', '45']

  const [hour, setHour] = React.useState<string>(time?.split(':')?.[0] || '')
  const [minute, setMinute] = React.useState<string>(time?.split(':')?.[1] || '')

  React.useEffect(() => {
    if (hour && minute && setTime) {
      setTime(`${hour}:${minute}`)
    }
  }, [hour, minute, setTime])

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant={"outline"}
            className={cn(
              "w-full justify-start text-left font-normal",
              !time && "text-muted-foreground"
            )}
          >
            <Clock className="mr-2 h-4 w-4" />
            {time ? `${time}` : <span>{placeholder}</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-4" align="start">
          <div className="flex space-x-2">
            <div className="grid gap-1">
              <p className="text-sm font-medium">Hour</p>
              <Select
                value={hour}
                onValueChange={setHour}
              >
                <SelectTrigger className="w-[70px]">
                  <SelectValue placeholder="Hour" />
                </SelectTrigger>
                <SelectContent>
                  {hours.map((h) => (
                    <SelectItem key={h} value={h}>{h}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-1">
              <p className="text-sm font-medium">Minute</p>
              <Select
                value={minute}
                onValueChange={setMinute}
              >
                <SelectTrigger className="w-[70px]">
                  <SelectValue placeholder="Min" />
                </SelectTrigger>
                <SelectContent>
                  {minutes.map((m) => (
                    <SelectItem key={m} value={m}>{m}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}

export default TimePicker
