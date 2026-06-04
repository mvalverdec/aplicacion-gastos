import { FormEvent, useState } from 'react';
import { importFile, importText } from '../services/api';

type Props = {
  onImported: () => Promise<void>;
};

export default function ImportPage({ onImported }: Props) {
  const [text, setText] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setStatus(null);

    try {
      const result = file ? await importFile(file) : await importText(text);
      setStatus(`${result.expenses.length} gasto(s) guardado(s).`);
      setText('');
      setFile(null);
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
          Archivo
          <input
            type="file"
            accept=".pdf,.png,.jpg,.jpeg,.txt"
            onChange={(event) => setFile(event.target.files?.[0] ?? null)}
          />
        </label>

        <label>
          Texto
          <textarea
            value={text}
            rows={8}
            placeholder="Pega aquí un recibo, factura o listado de gastos."
            onChange={(event) => setText(event.target.value)}
            disabled={Boolean(file)}
          />
        </label>

        <div className="form-actions">
          <button type="submit" disabled={busy || (!file && text.trim().length === 0)}>
            {busy ? 'Procesando...' : 'Procesar y guardar'}
          </button>
          {status && <span>{status}</span>}
        </div>
      </form>
    </section>
  );
}
