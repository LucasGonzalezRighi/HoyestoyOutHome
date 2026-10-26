'use client';

import { Trash2 } from 'lucide-react';

import { cn } from '@/utils/cn';

import ui from '../ui/ui.module.css';

/**
 * Botón de borrar que pide confirmación antes de mandar su formulario. Si se
 * cancela, el formulario no se envía.
 */
export function ConfirmSubmit({ message, label }: { message: string; label: string }) {
  return (
    <button
      type="submit"
      className={cn(ui.iconButton, ui.danger)}
      aria-label={label}
      title={label}
      onClick={(event) => {
        if (!window.confirm(message)) event.preventDefault();
      }}
    >
      <Trash2 size={18} strokeWidth={2.75} aria-hidden="true" />
    </button>
  );
}
