import { useMemo, useState } from 'react';
import { Plus, Trash2, FileDown, GraduationCap } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Card, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useCgpaStore, semesterGPA, overallCGPA } from '../store/cgpaStore';
import { useToastStore } from '../store/toastStore';
import { GRADE_POINTS, type Grade } from '../types';
import { exportCgpaPdf } from '../utils/pdf';

const GRADES: Grade[] = ['O', 'A+', 'A', 'B+', 'B', 'C', 'U'];
const CHART_COLORS = ['#F2C94C', '#FFB800', '#FFE066', '#17B26A', '#F5A623', '#F04438', '#06B6D4'];

export default function CGPA() {
  const { semesters, addSemester, removeSemester, addSubject, updateSubject, removeSubject } = useCgpaStore();
  const push = useToastStore((s) => s.push);
  const [newSemName, setNewSemName] = useState('');

  const cgpa = overallCGPA(semesters);
  const totalCredits = semesters.flatMap((s) => s.subjects).reduce((a, s) => a + s.credits, 0);
  const creditsEarned = semesters.flatMap((s) => s.subjects).filter((s) => s.grade !== 'U').reduce((a, s) => a + s.credits, 0);

  const semesterChartData = useMemo(() => semesters.map((s) => ({ name: s.name.replace('Semester ', 'S'), gpa: Number(semesterGPA(s.subjects).toFixed(2)) })), [semesters]);

  const gradeDistribution = useMemo(() => {
    const counts: Record<string, number> = {};
    semesters.flatMap((s) => s.subjects).forEach((s) => { counts[s.grade] = (counts[s.grade] || 0) + 1; });
    return GRADES.filter((g) => counts[g]).map((g) => ({ name: g, value: counts[g] }));
  }, [semesters]);

  return (
    <div className="space-y-5">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold" style={{ color: 'var(--ink)' }}>CGPA Calculator</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--ink-soft)' }}>Track semester GPA and overall CGPA across unlimited semesters.</p>
        </div>
        <Button variant="outline" size="sm" icon={<FileDown size={14} />} onClick={() => exportCgpaPdf(semesters)}>Export PDF Report</Button>
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader title="Semester GPA Comparison" />
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={semesterChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--line)" />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: 'var(--ink-soft)' }} />
              <YAxis domain={[0, 10]} tick={{ fontSize: 12, fill: 'var(--ink-soft)' }} />
              <Tooltip contentStyle={{ background: 'var(--bg-elev)', border: '1px solid var(--line)', borderRadius: 12, fontSize: 12 }} />
              <Bar dataKey="gpa" radius={[8, 8, 0, 0]} fill="#FFB800" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
        <Card delay={0.05}>
          <CardHeader title="CGPA Trend" />
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={semesterChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--line)" />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: 'var(--ink-soft)' }} />
              <YAxis domain={[0, 10]} tick={{ fontSize: 12, fill: 'var(--ink-soft)' }} />
              <Tooltip contentStyle={{ background: 'var(--bg-elev)', border: '1px solid var(--line)', borderRadius: 12, fontSize: 12 }} />
              <Line type="monotone" dataKey="gpa" stroke="#F2C94C" strokeWidth={3} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {gradeDistribution.length > 0 && (
        <Card>
          <CardHeader title="Grade Distribution" />
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <ResponsiveContainer width={200} height={200}>
              <PieChart>
                <Pie data={gradeDistribution} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80} paddingAngle={3}>
                  {gradeDistribution.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ background: 'var(--bg-elev)', border: '1px solid var(--line)', borderRadius: 12, fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap gap-3">
              {gradeDistribution.map((g, i) => (
                <div key={g.name} className="flex items-center gap-2 text-sm">
                  <span className="w-3 h-3 rounded-full" style={{ background: CHART_COLORS[i % CHART_COLORS.length] }} />
                  <span style={{ color: 'var(--ink)' }}>{g.name}: {g.value}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}

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
                      <td className="py-2">
                        <input
                          value={sub.name}
                          onChange={(e) => updateSubject(sem.id, sub.id, { name: e.target.value })}
                          className="bg-transparent outline-none w-full" style={{ color: 'var(--ink)' }}
                        />
                      </td>
                      <td className="py-2 w-24">
                        <input
                          type="number" min={0} value={sub.credits}
                          onChange={(e) => updateSubject(sem.id, sub.id, { credits: Number(e.target.value) })}
                          className="bg-transparent outline-none w-16" style={{ color: 'var(--ink)' }}
                        />
                      </td>
                      <td className="py-2 w-28">
                        <select
                          value={sub.grade}
                          onChange={(e) => updateSubject(sem.id, sub.id, { grade: e.target.value as Grade })}
                          className="bg-transparent outline-none rounded-md" style={{ color: 'var(--ink)' }}
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

      <div className="flex gap-2">
        <input
          value={newSemName} onChange={(e) => setNewSemName(e.target.value)}
          placeholder={`Semester ${semesters.length + 1}`}
          className="flex-1 max-w-xs px-3 py-2 rounded-xl text-sm outline-none glass"
          style={{ color: 'var(--ink)' }}
        />
        <Button
          icon={<Plus size={14} />}
          onClick={() => { addSemester(newSemName.trim() || `Semester ${semesters.length + 1}`); setNewSemName(''); push('Semester added', 'success'); }}
        >
          Add Semester
        </Button>
      </div>
    </div>
  );
}
