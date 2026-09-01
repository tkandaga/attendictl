import { useState } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem
} from '@/components/ui/command';
import { Button } from '@/components/ui/button';
import { Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function ParticipantCombobox({ participants, value, onSelect }) {
  const [open, setOpen] = useState(false);
  const selected = participants.find((p) => p.id === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          className="w-full justify-between font-normal"
        >
          {selected ? (
            <span className="flex flex-col items-start leading-tight">
              <span className="font-medium text-gray-900">{selected.nama}</span>
              <span className="text-xs text-gray-500">
                {selected.instansi ? `${selected.instansi} · ` : ''}{selected.role}
              </span>
            </span>
          ) : (
            <span className="text-gray-400">Cari nama Anda...</span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0 w-[--radix-popover-trigger-width]" align="start">
        <Command>
          <CommandInput placeholder="Ketik nama atau instansi..." />
          <CommandList>
            <CommandEmpty>Tidak ditemukan</CommandEmpty>
            <CommandGroup>
              {participants.map((p) => (
                <CommandItem
                  key={p.id}
                  value={`${p.nama} ${p.instansi || ''} ${p.role}`}
                  onSelect={() => {
                    onSelect(p);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      'mr-2 h-4 w-4',
                      value === p.id ? 'opacity-100' : 'opacity-0'
                    )}
                  />
                  <div className="flex flex-col leading-tight">
                    <span className="font-medium">{p.nama}</span>
                    <span className="text-xs text-gray-500">
                      {p.instansi ? `${p.instansi} · ` : ''}{p.role}
                    </span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}