import { useRef, useState } from 'react';
import { Plus, Trash2, FileDown, GraduationCap, ImagePlus, Loader2, Check } from 'lucide-react';
import { Card, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { useCgpaStore, semesterGPA, overallCGPA } from '../store/cgpaStore';
import { useToastStore } from '../store/toastStore';
import { GRADE_POINTS, type Grade } from '../types';
import { exportCgpaPdf } from '../utils/pdf';
import { extractSubjectsFromImage, type ParsedSubject } from '../utils/gradeCardOcr';

const GRADES: Grade[] = ['S', 'A+', 'A', 'B+', 'B', 'C+', 'C', 'U', 'SA', 'WC'];

export default function CGPA() {
  const { semesters, addSemester, removeSemester, addSubject, updateSubject, removeSubject, importSubjects } = useCgpaStore();
  const push = useToastStore((s) => s.push);
  const [newSemName, setNewSemName] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);
  const [ocrLoading, setOcrLoading] = useState(false);
  const [ocrProgress, setOcrProgress] = useState(0);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [parsedRows, setParsedRows] = useState<ParsedSubject[]>([]);
  const [importTarget, setImportTarget] = useState<string>('__new__');
  const [importSemName, setImportSemName] = useState('Imported Semester');

  const cgpa = overallCGPA(semesters);
  const totalCredits = semesters.flatMap((s) => s.subjects).reduce((a, s) => a + s.credits, 0);
  const creditsEarned = semesters.flatMap((s) => s.subjects).filter((s) => !['U', 'SA', 'WC'].includes(s.grade)).reduce((a, s) => a + s.credits, 0);

  function handleAddSemester() {
    addSemester(newSemName.trim() || `Semester ${semesters.length + 1}`);
    setNewSemName('');
    push('Semester added', 'success');
  }

  async function handleImageSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setOcrLoading(true);
    setOcrProgress(0);
    try {
      const rows = await extractSubjectsFromImage(file, setOcrProgress);
      if (rows.length === 0) {
        push("Couldn't detect any subjects in that image — try a clearer photo", 'error');
        return;
      }
      setParsedRows(rows);
      setImportTarget('__new__');
      setImportSemName(`Imported Semester ${semesters.length + 1}`);
      setReviewOpen(true);
      push(`Detected ${rows.length} subject(s) — review before adding`, 'success');
    } catch {
      push('Could not read that image. Please try again.', 'error');
    } finally {
      setOcrLoading(false);
    }
  }

  function updateParsedRow(i: number, patch: Partial<ParsedSubject>) {
    setParsedRows((rows) => rows.map((r, idx) => (idx === i ? { ...r, ...patch } : r)));
  }

  function removeParsedRow(i: number) {
    setParsedRows((rows) => rows.filter((_, idx) => idx !== i));
  }

  function confirmImport() {
    if (parsedRows.length === 0) return;
    if (importTarget === '__new__') {
      importSubjects({ newSemesterName: importSemName }, parsedRows);
    } else {
      importSubjects({ semId: importTarget }, parsedRows);
    }
    push(`Added ${parsedRows.length} subject(s) — GPA recalculated`, 'success');
    setReviewOpen(false);
    setParsedRows([]);
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold" style={{ color: 'var(--ink)' }}>CGPA Calculator</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--ink-soft)' }}>Track semester GPA and overall CGPA across unlimited semesters.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" icon={<FileDown size={14} />} onClick={() => exportCgpaPdf(semesters)}>Export PDF Report</Button>
          <Button
            variant="outline" size="sm"
            icon={ocrLoading ? <Loader2 size={14} className="animate-spin" /> : <ImagePlus size={14} />}
            onClick={() => fileRef.current?.click()}
            disabled={ocrLoading}
          >
            {ocrLoading ? `Reading image... ${ocrProgress}%` : 'Add Image (Auto GPA)'}
          </Button>
          <input ref={fileRef} type="file" accept="image/*" onChange={handleImageSelected} className="hidden" />
          <div className="flex gap-2">
            <input
              value={newSemName} onChange={(e) => setNewSemName(e.target.value)}
              placeholder={`Semester ${semesters.length + 1}`}
              className="w-36 px-3 py-2 rounded-xl text-sm outline-none glass"
              style={{ color: 'var(--ink)' }}
            />
            <Button size="sm" icon={<Plus size={14} />} onClick={handleAddSemester}>Add Sem</Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <p className="text-xs font-medium mb-1" style={{ color: 'var(--ink-soft)' }}>Overall CGPA</p>
          <p className="font-display text-3xl font-bold grad-text">{cgpa.toFixed(2)}</p>
        </Card>
        <Card delay={0.03}>
          <p className="text-xs font-medium mb-1" style={{ color: 'var(--ink-soft)' }}>Total Credits</p>
          <p className="font-display text-3xl font-bold" style={{ color: 'var(--ink)' }}>{totalCredits}</p>
        </Card>
        <Card delay={0.06}>
          <p className="text-xs font-medium mb-1" style={{ color: 'var(--ink-soft)' }}>Credits Earned</p>
          <p className="font-display text-3xl font-bold" style={{ color: 'var(--success)' }}>{creditsEarned}</p>
        </Card>
        <Card delay={0.09}>
          <p className="text-xs font-medium mb-1" style={{ color: 'var(--ink-soft)' }}>Semesters</p>
          <p className="font-display text-3xl font-bold" style={{ color: 'var(--ink)' }}>{semesters.length}</p>
        </Card>
      </div>

      {/* Semesters management */}
      <div className="space-y-4">
        {semesters.map((sem) => (
          <Card key={sem.id}>
            <CardHeader
              title={sem.name}
              subtitle={`GPA: ${semesterGPA(sem.subjects).toFixed(2)} • ${sem.subjects.length} subjects`}
              icon={<GraduationCap size={16} />}
              action={
                <button onClick={() => { removeSemester(sem.id); push('Semester removed', 'info'); }}>
                  <Trash2 size={16} style={{ color: 'var(--danger)' }} />
                </button>
              }
            />
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left" style={{ color: 'var(--ink-soft)' }}>
                    <th className="pb-2 font-medium">Subject</th>
                    <th className="pb-2 font-medium">Credits</th>
                    <th className="pb-2 font-medium">Grade</th>
                    <th className="pb-2 font-medium"></th>
                  </tr>
                </thead>
                <tbody>
                  {sem.subjects.map((sub) => (
                    <tr key={sub.id} className="border-t" style={{ borderColor: 'var(--line)' }}>
                      <td className="py-2 pr-2">
                        <input
                          value={sub.name}
                          onChange={(e) => updateSubject(sem.id, sub.id, { name: e.target.value })}
                          className="subject-field w-full"
                        />
                      </td>
                      <td className="py-2 pr-2 w-20">
                        <input
                          type="number" min={0} value={sub.credits}
                          onChange={(e) => updateSubject(sem.id, sub.id, { credits: Number(e.target.value) })}
                          className="subject-field w-full text-center"
                        />
                      </td>
                      <td className="py-2 pr-2 w-32">
                        <select
                          value={sub.grade}
                          onChange={(e) => updateSubject(sem.id, sub.id, { grade: e.target.value as Grade })}
                          className="subject-field w-full"
                        >
                          {GRADES.map((g) => <option key={g} value={g}>{g} ({GRADE_POINTS[g]})</option>)}
                        </select>
                      </td>
                      <td className="py-2 w-8 text-right">
                        <button onClick={() => removeSubject(sem.id, sub.id)}>
                          <Trash2 size={14} style={{ color: 'var(--ink-soft)' }} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <button
              onClick={() => addSubject(sem.id, 'New Subject', 3, 'A')}
              className="mt-3 flex items-center gap-1.5 text-xs font-medium"
              style={{ color: 'var(--blue)' }}
            >
              <Plus size={13} /> Add subject
            </button>
          </Card>
        ))}
      </div>

      <Modal open={reviewOpen} onClose={() => setReviewOpen(false)} title="Review detected subjects" width="max-w-2xl">
        <p className="text-sm mb-4" style={{ color: 'var(--ink-soft)' }}>
          We read {parsedRows.length} subject(s) from your image. Check the name, credits, and grade for each —
          OCR isn't perfect, so fix anything that looks off before adding. GPA is calculated automatically.
        </p>

        <div className="mb-4">
          <label className="text-xs font-medium block mb-1.5" style={{ color: 'var(--ink-soft)' }}>Add to</label>
          <div className="flex flex-wrap gap-2 items-center">
            <select
              value={importTarget}
              onChange={(e) => setImportTarget(e.target.value)}
              className="px-3 py-2 rounded-xl text-sm outline-none glass"
              style={{ color: 'var(--ink)' }}
            >
              <option value="__new__">+ New semester</option>
              {semesters.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
            {importTarget === '__new__' && (
              <input
                value={importSemName}
                onChange={(e) => setImportSemName(e.target.value)}
                placeholder="New semester name"
                className="flex-1 min-w-[10rem] px-3 py-2 rounded-xl text-sm outline-none glass"
                style={{ color: 'var(--ink)' }}
              />
            )}
          </div>
        </div>

        <div className="overflow-x-auto rounded-xl" style={{ border: '1px solid var(--line)' }}>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left" style={{ color: 'var(--ink-soft)' }}>
                <th className="px-3 py-2 font-medium">Subject</th>
                <th className="px-3 py-2 font-medium w-24">Credits</th>
                <th className="px-3 py-2 font-medium w-28">Grade</th>
                <th className="px-3 py-2 font-medium w-8"></th>
              </tr>
            </thead>
            <tbody>
              {parsedRows.map((row, i) => (
                <tr key={i} className="border-t" style={{ borderColor: 'var(--line)' }}>
                  <td className="px-3 py-2">
                    <input
                      value={row.name}
                      onChange={(e) => updateParsedRow(i, { name: e.target.value })}
                      className="subject-field w-full"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <input
                      type="number" min={0} value={row.credits}
                      onChange={(e) => updateParsedRow(i, { credits: Number(e.target.value) })}
                      className="subject-field w-full text-center"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <select
                      value={row.grade}
                      onChange={(e) => updateParsedRow(i, { grade: e.target.value as Grade })}
                      className="subject-field w-full"
                    >
                      {GRADES.map((g) => <option key={g} value={g}>{g} ({GRADE_POINTS[g]})</option>)}
                    </select>
                  </td>
                  <td className="px-3 py-2 text-right">
                    <button onClick={() => removeParsedRow(i)}>
                      <Trash2 size={14} style={{ color: 'var(--ink-soft)' }} />
                    </button>
                  </td>
                </tr>
              ))}
              {parsedRows.length === 0 && (
                <tr><td colSpan={4} className="px-3 py-6 text-center text-sm" style={{ color: 'var(--ink-soft)' }}>No rows left — nothing to add.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex justify-end gap-2 mt-5">
          <Button variant="outline" size="sm" onClick={() => setReviewOpen(false)}>Cancel</Button>
          <Button size="sm" icon={<Check size={14} />} onClick={confirmImport} disabled={parsedRows.length === 0}>
            Add {parsedRows.length} subject(s)
          </Button>
        </div>
      </Modal>

      <style>{`
        .subject-field {
          padding: 0.4rem 0.6rem;
          border-radius: 0.6rem;
          border: 1px solid var(--line);
          background: var(--bg);
          color: var(--ink);
          font-size: 0.875rem;
          outline: none;
          transition: border-color 0.15s ease, box-shadow 0.15s ease;
        }
        .subject-field:hover {
          border-color: var(--purple);
        }
        .subject-field:focus {
          border-color: var(--purple);
          box-shadow: 0 0 0 3px rgba(59, 91, 255, 0.15);
        }
      `}</style>
    </div>
  );
}