import { FormEvent, useState } from 'react';
import { importFiles, importText } from '../services/api';

type Props = {
  onImported: () => Promise<void>;
};

export default function ImportPage({ onImported }: Props) {
  const [text, setText] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [status, setStatus] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setStatus(null);

    try {
      const result = files.length > 0 ? await importFiles(files) : await importText(text);
      setStatus(`${result.expenses.length} gasto(s) guardado(s).`);
      setText('');
      setFiles([]);
      await onImported();
    } catch (err) {
      setStatus(err instanceof Error ? err.message : 'No se pudo importar.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="panel">
      <div className="section-title">
        <h2>Importar gastos</h2>
        <p>Sube PDF, imagen o pega texto. Gemini corre desde el backend y guarda en PostgreSQL.</p>
      </div>

      <form className="import-form" onSubmit={submit}>
        <label>
          Archivos
          <input
            type="file"
            multiple
            accept=".pdf,.png,.jpg,.jpeg,.txt"
            onChange={(event) => setFiles(Array.from(event.target.files ?? []))}
          />
        </label>

        {files.length > 0 && (
          <div className="file-list">
            {files.map((selectedFile) => (
              <span key={`${selectedFile.name}-${selectedFile.size}`}>{selectedFile.name}</span>
            ))}
          </div>
        )}

        <label>
          Texto
          <textarea
            value={text}
            rows={8}
            placeholder="Pega aquí un recibo, factura o listado de gastos."
            onChange={(event) => setText(event.target.value)}
            disabled={files.length > 0}
          />
        </label>

        <div className="form-actions">
          <button type="submit" disabled={busy || (files.length === 0 && text.trim().length === 0)}>
            {busy ? 'Procesando...' : 'Procesar y guardar'}
          </button>
          {status && <span>{status}</span>}
        </div>
      </form>
    </section>
  );
}
