'use client';

import { ImageUp, Trash2 } from 'lucide-react';
import Image from 'next/image';
import { useId, useState } from 'react';

import { adminContent } from '@/content/admin';
import type { PhotoRecord } from '@/content/records/schema';
import { cn } from '@/utils/cn';

import { uploadPhoto } from '../../actions/photos';
import { resizePhoto } from '../../resizePhoto';

import { TextInput } from './fields';
import { framingPosition, verticalFraming } from './inputValues';
import styles from './PhotoField.module.css';
import ui from './ui.module.css';

const { photo: copy } = adminContent;

/**
 * Elegir, subir y describir una foto: vista previa con el encuadre aplicado,
 * botón para subir (la achica el navegador antes), texto alternativo y
 * encuadre vertical. La foto queda subida al elegirla, pero el sitio la usa
 * recién cuando se guarda el formulario.
 */
export function PhotoField({
  label,
  hint,
  path,
  value,
  onChange,
  optional = false,
  framing = true,
}: {
  label: string;
  hint?: string;
  /** Ruta de la foto (los errores son `${path}.alt`, `${path}.src`…). */
  path: string;
  value: PhotoRecord | undefined;
  onChange: (photo: PhotoRecord | undefined) => void;
  /** Se puede quitar (la foto de un día del cronograma). */
  optional?: boolean;
  /** Muestra el control de encuadre. */
  framing?: boolean;
}) {
  const inputId = useId();
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string>();
  const percent = verticalFraming(value?.position);

  async function handleFile(file: File | undefined) {
    if (!file) return;
    setError(undefined);
    setUploading(true);
    try {
      const resized = await resizePhoto(file).catch(() => undefined);
      if (!resized) {
        setError(copy.unsupported);
        return;
      }
      const form = new FormData();
      form.set('file', resized.blob, 'foto');
      form.set('width', String(resized.width));
      form.set('height', String(resized.height));
      const result = await uploadPhoto(form);
      if (!result.ok) {
        setError(result.message);
        return;
      }
      // Foto nueva: el encuadre vuelve al centro; el alt anterior se conserva
      // como punto de partida (suele describir lo mismo).
      onChange({
        src: result.src,
        width: result.width,
        height: result.height,
        alt: value?.alt ?? '',
      });
    } finally {
      setUploading(false);
    }
  }

  return (
    <fieldset className={cn(ui.fieldset, styles.photo)}>
      <legend className={ui.label}>{label}</legend>
      {hint && <p className={ui.hint}>{hint}</p>}

      <div className={styles.layout}>
        <div className={styles.preview}>
          {value ? (
            <Image
              src={value.src}
              alt={copy.preview}
              fill
              sizes="(max-width: 700px) 100vw, 360px"
              className={styles.image}
              style={{ objectPosition: value.position ?? 'center' }}
            />
          ) : (
            <ImageUp size={32} strokeWidth={2} aria-hidden="true" className={styles.placeholder} />
          )}
        </div>

        <div className={styles.controls}>
          <div className={styles.buttons}>
            <label htmlFor={inputId} className={cn(ui.textButton, uploading && styles.busy)}>
              <ImageUp size={16} strokeWidth={2.75} aria-hidden="true" />
              {uploading ? copy.uploading : value ? copy.replace : copy.upload}
            </label>
            <input
              id={inputId}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/*"
              className={ui.visuallyHidden}
              disabled={uploading}
              onChange={(event) => {
                void handleFile(event.target.files?.[0]);
                event.target.value = '';
              }}
            />
            {optional && value && (
              <button
                type="button"
                className={cn(ui.textButton, styles.remove)}
                onClick={() => onChange(undefined)}
              >
                <Trash2 size={16} strokeWidth={2.75} aria-hidden="true" />
                {copy.remove}
              </button>
            )}
          </div>
          <p className={ui.hint}>{copy.hint}</p>
          {error && (
            <p className={ui.error} role="alert">
              {error}
            </p>
          )}

          {value && (
            <>
              <TextInput
                label={copy.alt}
                hint={copy.altHint}
                path={`${path}.alt`}
                value={value.alt}
                onChange={(alt) => onChange({ ...value, alt })}
              />
              {framing && (
                <div className={ui.field}>
                  <label htmlFor={`${inputId}-framing`} className={ui.label}>
                    {copy.framing}
                  </label>
                  <p className={ui.hint}>{copy.framingHint}</p>
                  <input
                    id={`${inputId}-framing`}
                    type="range"
                    min={0}
                    max={100}
                    step={5}
                    value={percent}
                    className={styles.range}
                    onChange={(event) => {
                      const next = {
                        ...value,
                        position: framingPosition(Number(event.target.value)),
                      };
                      if (!next.position) delete next.position;
                      onChange(next);
                    }}
                  />
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </fieldset>
  );
}
