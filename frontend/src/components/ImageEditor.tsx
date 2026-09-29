import { useEffect, useId, useState } from 'react';
import { createPortal } from 'react-dom';
import { FaPen, FaTimes, FaCloudUploadAlt, FaTrashAlt, FaSpinner, FaRegImage } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';

const ACCEPT = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_MB = 8;

interface Props {
  /** Nazwa miejsca pokazywana w oknie, np. „Tło strony”. */
  label: string;
  /** Aktualna grafika (null = używana jest grafika domyślna). */
  currentUrl: string | null;
  /** Grafika domyślna – pokazywana w oknie, gdy nic nie wgrano. */
  defaultUrl?: string | null;
  /** Zapis nowej grafiki na serwerze. */
  onUpload: (file: File, token: string) => Promise<void>;
  /** Usunięcie grafiki (powrót do domyślnej). Brak = przycisk „Usuń” się nie pokazuje. */
  onRemove?: (token: string) => Promise<void>;
  /** Podpowiedź o formacie, np. „poziomo, min. 1600 × 600 px”. */
  hint?: string;
  /** Pozycjonowanie przycisku „Edytuj” (klasy Tailwind). */
  className?: string;
  /** Tekst na przycisku (domyślnie „Edytuj”). */
  buttonLabel?: string;
}

/**
 * Przycisk „Edytuj” widoczny tylko po zalogowaniu + okno wyboru i wgrania grafiki.
 * Użycie: <ImageEditor label="Tło strony" currentUrl={…} onUpload={…} onRemove={…} className="absolute top-3 right-3" />
 */
export default function ImageEditor({ label, currentUrl, defaultUrl = null, onUpload, onRemove, hint, className = '', buttonLabel = 'Edytuj' }: Props) {
  const { isAuthenticated, token } = useAuth();
  const [open, setOpen] = useState(false);

  if (!isAuthenticated || !token) return null;

  return (
    <>
      <button
        type="button"
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); setOpen(true); }}
        className={`z-30 inline-flex items-center gap-1.5 h-8 px-3 rounded-full text-xs font-bold uppercase tracking-wide bg-ink/85 backdrop-blur border border-gold/60 text-gold shadow-lg shadow-black/40 hover:bg-gold hover:text-ink transition print:hidden ${className}`}
        title={`Edytuj grafikę: ${label}`}
      >
        <FaPen className="text-[10px]" /> {buttonLabel}
      </button>
      {open && (
        <ImageDialog
          label={label}
          currentUrl={currentUrl}
          defaultUrl={defaultUrl}
          hint={hint}
          onClose={() => setOpen(false)}
          onUpload={(f) => onUpload(f, token)}
          onRemove={onRemove ? () => onRemove(token) : undefined}
        />
      )}
    </>
  );
}

function ImageDialog({ label, currentUrl, defaultUrl, hint, onClose, onUpload, onRemove }: {
  label: string;
  currentUrl: string | null;
  defaultUrl: string | null;
  hint?: string;
  onClose: () => void;
  onUpload: (file: File) => Promise<void>;
  onRemove?: () => Promise<void>;
}) {
  const titleId = useId();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [busy, setBusy] = useState<'upload' | 'remove' | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);

  // Esc zamyka okno, strona pod spodem się nie przewija
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape' && !busy) onClose(); };
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = prev; };
  }, [busy, onClose]);

  useEffect(() => () => { if (preview) URL.revokeObjectURL(preview); }, [preview]);

  const pick = (f: File | undefined | null) => {
    if (!f) return;
    if (!ACCEPT.includes(f.type)) { setError('Dozwolone formaty: JPG, PNG, WEBP.'); return; }
    if (f.size > MAX_MB * 1024 * 1024) { setError(`Plik jest za duży (maks. ${MAX_MB} MB).`); return; }
    setError(null);
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const run = async (kind: 'upload' | 'remove', action: () => Promise<void>) => {
    setBusy(kind);
    setError(null);
    try {
      await action();
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Coś poszło nie tak. Spróbuj ponownie.');
      setBusy(null);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-6" role="presentation">
      <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" onClick={() => !busy && onClose()} />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative w-full sm:max-w-2xl max-h-[92vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl frame-gold p-5 sm:p-7"
      >
        <div className="flex items-start justify-between gap-4 mb-5">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-muted">Edytuj grafikę</p>
            <h2 id={titleId} className="font-display font-bold uppercase tracking-wide text-xl sm:text-2xl text-gold-shine">{label}</h2>
          </div>
          <button type="button" onClick={onClose} disabled={!!busy} className="w-9 h-9 shrink-0 rounded-full border border-line text-muted hover:text-cream hover:border-gold/60 flex items-center justify-center transition" aria-label="Zamknij">
            <FaTimes />
          </button>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <figure>
            <figcaption className="text-xs font-semibold uppercase tracking-wider text-muted mb-2">{currentUrl || !defaultUrl ? 'Obecna' : 'Obecna (domyślna)'}</figcaption>
            <div className="aspect-video rounded-xl overflow-hidden border border-line bg-panel flex items-center justify-center">
              {currentUrl || defaultUrl
                ? <img src={(currentUrl ?? defaultUrl)!} alt="" className="w-full h-full object-cover" />
                : <span className="flex flex-col items-center gap-2 text-sm text-muted px-4 text-center"><FaRegImage className="text-2xl" />Brak – używana jest grafika domyślna</span>}
            </div>
          </figure>

          <figure>
            <figcaption className="text-xs font-semibold uppercase tracking-wider text-muted mb-2">Nowa</figcaption>
            <label
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => { e.preventDefault(); setDragOver(false); pick(e.dataTransfer.files?.[0]); }}
              className={`relative aspect-video rounded-xl overflow-hidden border-2 border-dashed flex items-center justify-center cursor-pointer transition ${
                dragOver ? 'border-gold bg-gold/10' : 'border-gold/40 bg-panel hover:border-gold/80'
              }`}
            >
              {preview ? (
                <img src={preview} alt="Podgląd nowej grafiki" className="w-full h-full object-cover" />
              ) : (
                <span className="flex flex-col items-center gap-2 text-sm text-cream px-4 text-center">
                  <FaCloudUploadAlt className="text-3xl text-gold" />
                  <span><strong className="text-gold">Wybierz plik</strong> lub przeciągnij go tutaj</span>
                </span>
              )}
              <input
                type="file"
                accept={ACCEPT.join(',')}
                className="sr-only"
                onChange={(e) => { pick(e.target.files?.[0]); e.target.value = ''; }}
              />
            </label>
          </figure>
        </div>

        <p className="mt-3 text-xs text-muted">
          JPG, PNG lub WEBP, maks. {MAX_MB} MB.{hint ? ` Najlepiej: ${hint}.` : ''}
          {file && <> Wybrano: <span className="text-cream">{file.name}</span></>}
        </p>

        {error && <p role="alert" className="mt-3 text-sm font-semibold text-cream bg-chili/85 rounded-lg px-3 py-2">{error}</p>}

        <div className="mt-6 flex flex-col-reverse sm:flex-row sm:items-center gap-3">
          {onRemove && currentUrl && (
            <button
              type="button"
              disabled={!!busy}
              onClick={() => { if (window.confirm('Usunąć wgraną grafikę? Wróci grafika domyślna.')) run('remove', onRemove); }}
              className="inline-flex items-center justify-center gap-2 h-11 px-4 rounded-full border border-line text-muted text-sm font-semibold hover:border-chili hover:text-cream transition disabled:opacity-50"
            >
              {busy === 'remove' ? <FaSpinner className="animate-spin" /> : <FaTrashAlt className="text-chili" />} Usuń obecną
            </button>
          )}
          <div className="sm:ml-auto flex gap-3">
            <button type="button" onClick={onClose} disabled={!!busy} className="flex-1 sm:flex-none h-11 px-5 rounded-full border border-gold/50 text-cream text-sm font-semibold hover:border-gold transition disabled:opacity-50">
              Anuluj
            </button>
            <button
              type="button"
              disabled={!file || !!busy}
              onClick={() => file && run('upload', () => onUpload(file))}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 h-11 px-6 rounded-full bg-chili text-white text-sm font-bold shadow-chili hover:brightness-110 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {busy === 'upload' ? <FaSpinner className="animate-spin" /> : <FaCloudUploadAlt />} Zapisz grafikę
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
