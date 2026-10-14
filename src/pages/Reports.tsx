import { useEffect, useState } from 'react';
import type { ChangeEvent } from 'react';
import { FileText, Upload, Eye, TrendingUp, AlertCircle, CheckCircle, ChevronDown, ChevronUp, History } from 'lucide-react';
import { DEMO_REPORTS } from '@/lib/demoData';
import { useApp } from '@/context/AppContext';
import { formatDate } from '@/lib/utils';
import type { MedicalReport, ReportObservation } from '@/types';

const STORED_REPORTS_KEY = 'healthsaathi:uploaded-reports';

interface ReportDraft {
  fileName: string;
  report: MedicalReport;
}

function getStoredReports(): MedicalReport[] {
  try {
    const stored = localStorage.getItem(STORED_REPORTS_KEY);
    return stored ? JSON.parse(stored) as MedicalReport[] : [];
  } catch {
    return [];
  }
}

type EvaluationStatus = 'normal' | 'elevated' | 'high' | 'low' | 'critical' | 'not_assessed' | 'not_in_report';

const STATUS_LABELS: Record<EvaluationStatus, string> = {
  normal: 'Normal',
  elevated: 'Elevated',
  high: 'High',
  low: 'Low',
  critical: 'Critical',
  not_assessed: 'Not assessed',
  not_in_report: 'Not in report',
};

const STATUS_STYLES: Record<EvaluationStatus, string> = {
  normal: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  elevated: 'bg-amber-50 text-amber-700 border-amber-200',
  high: 'bg-orange-50 text-orange-700 border-orange-200',
  low: 'bg-blue-50 text-blue-700 border-blue-200',
  critical: 'bg-red-50 text-red-700 border-red-200',
  not_assessed: 'bg-slate-50 text-slate-500 border-slate-200',
  not_in_report: 'bg-slate-50 text-slate-400 border-slate-200',
};

function getObservationStatus(obs: ReportObservation | undefined, reportType: string): EvaluationStatus {
  if (!obs) return 'not_in_report';
  if (obs.flag) return obs.flag;

  const value = Number.parseFloat(obs.value.replace(/,/g, ''));
  if (!Number.isFinite(value)) return 'not_assessed';

  if (reportType === 'Blood Pressure') {
    if (/systolic/i.test(obs.test_name)) {
      if (value >= 180) return 'critical';
      if (value >= 130) return 'high';
      if (value >= 120) return 'elevated';
      if (value < 90) return 'low';
      return 'normal';
    }
    if (/diastolic/i.test(obs.test_name)) {
      if (value >= 120) return 'critical';
      if (value >= 80) return 'high';
      if (value < 60) return 'low';
      return 'normal';
    }
  }

  const referenceRange = obs.ref_range?.replace(/,/g, '').trim();
  if (!referenceRange) return 'not_assessed';

  const bound = referenceRange.match(/^(<=|>=|≤|≥|<|>)\s*(-?\d+(?:\.\d+)?)/);
  if (bound) {
    const threshold = Number(bound[2]);
    if (bound[1] === '<') return value < threshold ? 'normal' : 'high';
    if (bound[1] === '<=' || bound[1] === '≤') return value <= threshold ? 'normal' : 'high';
    if (bound[1] === '>') return value > threshold ? 'normal' : 'low';
    return value >= threshold ? 'normal' : 'low';
  }

  const limits = referenceRange.match(/\d+(?:\.\d+)?/g)?.map(Number);
  if (limits?.length && /[-–—]/.test(referenceRange)) {
    if (value < limits[0]) return 'low';
    if (value > limits[1]) return 'high';
    return 'normal';
  }

  return 'not_assessed';
}

function StatusBadge({ status }: { status: EvaluationStatus }) {
  return <span className={`inline-flex rounded-full border px-2 py-0.5 text-[10px] font-semibold ${STATUS_STYLES[status]}`}>{STATUS_LABELS[status]}</span>;
}

function ObservationRow({ obs, reportType }: { obs: ReportObservation; reportType: string }) {
  const [expanded, setExpanded] = useState(false);
  const status = getObservationStatus(obs, reportType);
  return (
    <div className="border-b border-slate-100 last:border-0">
      <div
        className="flex items-center justify-between px-4 py-3 hover:bg-slate-50 cursor-pointer transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-slate-700">{obs.test_name}</p>
          <p className="text-xs text-slate-400">{obs.value} {obs.unit} · Ref: {obs.ref_range || 'N/A'}</p>
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge status={status} />
          {obs.explanation && (expanded ? <ChevronUp size={14} className="text-slate-400" /> : <ChevronDown size={14} className="text-slate-400" />)}
        </div>
      </div>
      {expanded && obs.explanation && (
        <div className="px-4 pb-3">
          <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 text-xs text-blue-800 leading-relaxed">
            <span className="font-semibold">Plain English: </span>{obs.explanation}
          </div>
        </div>
      )}
    </div>
  );
}

function ReportCard({ report, isActive, onClick }: { report: MedicalReport; isActive: boolean; onClick: () => void }) {
  const flagged = report.observations.filter(o => ['elevated', 'high', 'low', 'critical'].includes(getObservationStatus(o, report.report_type)));
  return (
    <div
      className={`card-hover p-4 cursor-pointer transition-all ${ isActive ? 'border-teal-400 shadow-md ring-1 ring-teal-400/20' : '' }`}
      onClick={onClick}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
          <FileText size={16} className="text-blue-500" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-slate-800 truncate">{report.title}</p>
          <p className="text-xs text-slate-400">{report.lab_name || report.source_file_name || 'Uploaded report'}</p>
          <p className="text-xs text-slate-400">{formatDate(report.report_date)}</p>
        </div>
      </div>
      {flagged.length > 0 && (
        <div className="mt-2 flex items-center gap-1">
          <AlertCircle size={12} className="text-amber-500" />
          <span className="text-xs text-amber-600 font-medium">{flagged.length} value{flagged.length > 1 ? 's' : ''} flagged</span>
        </div>
      )}
    </div>
  );
}

export default function Reports() {
  const { activeProfileId } = useApp();
  const [uploadedReports, setUploadedReports] = useState<MedicalReport[]>(getStoredReports);
  const [activeId, setActiveId] = useState<string>(DEMO_REPORTS[0].id);
  const [compareId, setCompareId] = useState<string | null>(null);
  const [showCompare, setShowCompare] = useState(false);
  const [uploadMsg, setUploadMsg] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [draft, setDraft] = useState<ReportDraft | null>(null);
  const [storageWarning, setStorageWarning] = useState(false);

  const reports = [...uploadedReports, ...DEMO_REPORTS]
    .sort((a, b) => b.report_date.localeCompare(a.report_date));
  const activeReport = reports.find(r => r.id === activeId) ?? reports[0];
  const compareReport = compareId ? reports.find(r => r.id === compareId) : null;
  const lastReport = activeReport ? reports
    .filter(r => r.id !== activeReport.id
      && r.profile_id === activeReport.profile_id
      && r.report_type === activeReport.report_type
      && r.report_date < activeReport.report_date)
    .sort((a, b) => b.report_date.localeCompare(a.report_date))[0] : undefined;

  useEffect(() => {
    try {
      localStorage.setItem(STORED_REPORTS_KEY, JSON.stringify(uploadedReports));
      setStorageWarning(false);
    } catch {
      setStorageWarning(true);
    }
  }, [uploadedReports]);

  const handleUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    const maxMB = 10;
    if (file.size > maxMB * 1024 * 1024) {
      setUploadError('File too large. Maximum 10 MB.');
      return;
    }
    const extension = file.name.split('.').pop()?.toLowerCase();
    if (!extension || !['pdf', 'jpg', 'jpeg', 'png'].includes(extension)) {
      setUploadError('Unsupported file type. Please upload PDF, JPEG, or PNG.');
      return;
    }
    setUploadError(null);
    setUploadMsg(null);
    setIsProcessing(true);
    try {
      const { extractReportText, inferReportDate, inferReportType, parseReportObservations } = await import('@/lib/reportOcr');
      const extractedText = await extractReportText(file);
      const reportType = inferReportType(extractedText);
      const title = reportType === 'CBC' ? 'Complete Blood Count (CBC)' : `${reportType} Report`;
      setDraft({
        fileName: file.name,
        report: {
          id: crypto.randomUUID(),
          profile_id: activeProfileId,
          title,
          report_type: reportType,
          report_date: inferReportDate(extractedText),
          source_file_name: file.name,
          extracted_text: extractedText,
          observations: parseReportObservations(extractedText),
          uploaded_at: new Date().toISOString(),
        },
      });
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : 'Could not read this report. Please try another file.');
    } finally {
      setIsProcessing(false);
    }
  };

  const updateDraftReport = (updates: Partial<MedicalReport>) => {
    setDraft(current => current ? { ...current, report: { ...current.report, ...updates } } : current);
  };

  const updateDraftObservation = (index: number, updates: Partial<ReportObservation>) => {
    if (!draft) return;
    updateDraftReport({
      observations: draft.report.observations.map((observation, itemIndex) =>
        itemIndex === index ? { ...observation, ...updates } : observation
      ),
    });
  };

  const saveDraft = () => {
    if (!draft) return;
    setUploadedReports(previous => [draft.report, ...previous]);
    setActiveId(draft.report.id);
    setCompareId(null);
    setShowCompare(false);
    setUploadMsg(`Saved ${draft.fileName}. Review the extracted values before relying on them.`);
    setDraft(null);
  };

  // Build comparison table
  const buildComparison = () => {
    if (!compareReport || !activeReport) return [];
    const observations = [...compareReport.observations, ...activeReport.observations]
      .filter((obs, index, all) => all.findIndex(item =>
        item.test_name === obs.test_name && item.unit === obs.unit
      ) === index);

    return observations.map(obs => {
      const previous = compareReport.observations.find(item => item.test_name === obs.test_name && item.unit === obs.unit);
      const current = activeReport.observations.find(item => item.test_name === obs.test_name && item.unit === obs.unit);
      const previousValue = previous ? Number.parseFloat(previous.value) : Number.NaN;
      const currentValue = current ? Number.parseFloat(current.value) : Number.NaN;
      const diff = Number.isFinite(previousValue) && Number.isFinite(currentValue)
        ? currentValue - previousValue
        : null;
      return {
        test_name: obs.test_name,
        unit: obs.unit,
        prev_value: previous?.value,
        value: current?.value,
        diff,
        previous_status: getObservationStatus(previous, compareReport.report_type),
        current_status: getObservationStatus(current, activeReport.report_type),
      };
    });
  };

  const cmpData = buildComparison();
  const evaluationCounts = activeReport.observations.reduce<Record<EvaluationStatus, number>>((counts, observation) => {
    counts[getObservationStatus(observation, activeReport.report_type)] += 1;
    return counts;
  }, { normal: 0, elevated: 0, high: 0, low: 0, critical: 0, not_assessed: 0, not_in_report: 0 });
  const overallStatus: EvaluationStatus = evaluationCounts.critical > 0 ? 'critical'
    : evaluationCounts.high > 0 ? 'high'
    : evaluationCounts.low > 0 ? 'low'
    : evaluationCounts.elevated > 0 ? 'elevated'
    : evaluationCounts.not_assessed > 0 ? 'not_assessed'
    : 'normal';

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="section-title text-xl">Medical Reports</h1>
          <p className="section-sub">{reports.length} reports · Uploaded reports are saved in this browser</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <label className="btn-secondary cursor-pointer text-sm">
            <Upload size={14} /> {isProcessing ? 'Reading report...' : 'Upload Report'}
            <input type="file" accept=".pdf,.jpg,.jpeg,.png" className="hidden" disabled={isProcessing} onChange={handleUpload} />
          </label>
          <button
            className="inline-flex items-center gap-2 rounded-lg border border-teal-300 bg-teal-50 px-3 py-2 text-sm font-semibold text-teal-800 shadow-sm transition-colors hover:bg-teal-100 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={!lastReport}
            onClick={() => {
              if (!lastReport) return;
              setCompareId(lastReport.id);
              setShowCompare(true);
            }}
          >
            <History size={15} /> Compare with last report
          </button>
        </div>
      </div>

      {uploadMsg && (
        <div className="flex items-start gap-2 p-3 rounded-xl bg-teal-50 border border-teal-200 text-sm text-teal-800">
          <CheckCircle size={15} className="flex-shrink-0 mt-0.5" />
          {uploadMsg}
        </div>
      )}

      {uploadError && (
        <div role="alert" className="p-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700">
          {uploadError}
        </div>
      )}

      {storageWarning && (
        <div role="alert" className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-sm text-amber-800">
          Browser storage is full or unavailable. This report may not persist after closing the browser.
        </div>
      )}

      {draft && (
        <section className="card p-5 space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="font-bold text-slate-800">Review extracted report</h2>
              <p className="text-xs text-slate-500 mt-1">{draft.fileName} · OCR may misread values; check before saving.</p>
            </div>
            <button className="btn-ghost text-sm" onClick={() => setDraft(null)}>Cancel</button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <label className="text-xs font-semibold text-slate-600">
              Report title
              <input className="input mt-1" value={draft.report.title} onChange={e => updateDraftReport({ title: e.target.value })} />
            </label>
            <label className="text-xs font-semibold text-slate-600">
              Report type
              <select className="input mt-1" value={draft.report.report_type} onChange={e => updateDraftReport({ report_type: e.target.value })}>
                {['Blood Pressure', 'CBC', 'Lipid Panel', 'Thyroid', 'Other'].map(type => <option key={type}>{type}</option>)}
              </select>
            </label>
            <label className="text-xs font-semibold text-slate-600">
              Report date
              <input className="input mt-1" type="date" value={draft.report.report_date} onChange={e => updateDraftReport({ report_date: e.target.value })} />
            </label>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs font-semibold text-slate-600">Extracted test values</p>
              <button
                className="btn-secondary text-xs"
                onClick={() => updateDraftReport({ observations: [...draft.report.observations, { test_name: '', value: '', unit: '' }] })}
              >
                Add result
              </button>
            </div>
            {draft.report.observations.length === 0 && (
              <p className="text-xs text-amber-700 bg-amber-50 rounded-lg p-3">
                No values were detected. Add them manually below, or check the extracted text.
              </p>
            )}
            {draft.report.observations.map((observation, index) => (
              <div key={`${observation.test_name}-${index}`} className="grid grid-cols-1 sm:grid-cols-[minmax(0,1fr)_90px_80px_130px_auto] gap-2 items-center">
                <input aria-label="Test name" className="input" placeholder="Test name" value={observation.test_name} onChange={e => updateDraftObservation(index, { test_name: e.target.value })} />
                <input aria-label="Test value" className="input" placeholder="Value" value={observation.value} onChange={e => updateDraftObservation(index, { value: e.target.value })} />
                <input aria-label="Test unit" className="input" placeholder="Unit" value={observation.unit} onChange={e => updateDraftObservation(index, { unit: e.target.value })} />
                <input aria-label="Reference range" className="input" placeholder="Reference range" value={observation.ref_range || ''} onChange={e => updateDraftObservation(index, { ref_range: e.target.value })} />
                <button
                  aria-label={`Remove ${observation.test_name || 'test result'}`}
                  className="btn-ghost text-xs text-red-600"
                  onClick={() => updateDraftReport({ observations: draft.report.observations.filter((_, itemIndex) => itemIndex !== index) })}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>

          {draft.report.extracted_text && (
            <details className="rounded-lg border border-slate-200 p-3">
              <summary className="cursor-pointer text-xs font-semibold text-slate-600">View all extracted text</summary>
              <pre className="mt-3 max-h-56 overflow-auto whitespace-pre-wrap break-words text-xs text-slate-600">{draft.report.extracted_text}</pre>
            </details>
          )}

          <div className="flex justify-end">
            <button className="btn-primary" disabled={!draft.report.title.trim() || !draft.report.report_date} onClick={saveDraft}>
              Save report
            </button>
          </div>
        </section>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Report list */}
        <div className="space-y-3">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">All Reports</p>
          {reports.map(r => (
            <ReportCard key={r.id} report={r} isActive={r.id === activeId} onClick={() => { setActiveId(r.id); setCompareId(null); }} />
          ))}
        </div>

        {/* Report detail */}
        <div className="lg:col-span-2 space-y-4">
          <div className="card">
            <div className="px-5 py-4 border-b border-slate-100">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h2 className="text-lg font-bold text-slate-800">{activeReport.title}</h2>
                  <p className="text-xs text-slate-400">{activeReport.lab_name || activeReport.source_file_name || 'Uploaded report'} · {formatDate(activeReport.report_date)}</p>
                </div>
                {showCompare && (
                  <select
                    className="input w-auto text-xs"
                    value={compareId || ''}
                    onChange={e => setCompareId(e.target.value || null)}
                  >
                    <option value="">Compare with...</option>
                    {reports.filter(r => r.id !== activeId
                      && r.profile_id === activeReport.profile_id
                      && r.report_type === activeReport.report_type
                      && r.report_date < activeReport.report_date).map(r => (
                      <option key={r.id} value={r.id}>{r.title} ({formatDate(r.report_date)})</option>
                    ))}
                  </select>
                )}
              </div>
            </div>

            {/* AI Summary */}
            {activeReport.ai_summary && (
              <div className="mx-5 mt-4 mb-2 p-3 rounded-xl bg-gradient-to-r from-teal-50 to-emerald-50 border border-teal-100 text-sm text-slate-700 leading-relaxed">
                <p className="text-[10px] font-semibold text-teal-600 uppercase tracking-wide mb-1.5">AI Summary (Demo)</p>
                {activeReport.ai_summary}
              </div>
            )}

            {/* Observations table */}
            <div className="mt-2">
              <p className="px-5 py-2 text-[10px] font-semibold text-slate-400 uppercase tracking-wider bg-slate-50 border-y border-slate-100">
                Test Results
              </p>
              {activeReport.observations.map(obs => (
                <ObservationRow key={obs.test_name} obs={obs} reportType={activeReport.report_type} />
              ))}
            </div>

            {activeReport.extracted_text && (
              <details className="mx-5 my-3 rounded-lg border border-slate-200 p-3">
                <summary className="cursor-pointer text-xs font-semibold text-slate-600">View all text from uploaded report</summary>
                <pre className="mt-3 max-h-56 overflow-auto whitespace-pre-wrap break-words text-xs text-slate-600">{activeReport.extracted_text}</pre>
              </details>
            )}

            {/* Comparison table */}
            {showCompare && compareReport && (
              <div className="mt-2">
                <div className="px-5 py-3 bg-teal-50 border-y border-teal-100">
                  <p className="text-[10px] font-semibold text-teal-700 uppercase tracking-wider">Previous saved report</p>
                  <p className="mt-1 text-sm font-semibold text-slate-800">
                    {compareReport.title} <span className="font-normal text-slate-500">· {formatDate(compareReport.report_date)}</span>
                  </p>
                  <p className="mt-0.5 text-xs text-slate-500">Compared with {activeReport.title} · {formatDate(activeReport.report_date)}</p>
                </div>
                <div className="mx-4 my-3 rounded-lg border border-slate-200 bg-white p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-sm font-bold text-slate-800">Current report evaluation</p>
                    <StatusBadge status={overallStatus} />
                  </div>
                  <p className="mt-2 text-xs leading-relaxed text-slate-600">
                    {evaluationCounts.normal} normal · {evaluationCounts.elevated} elevated · {evaluationCounts.high} high · {evaluationCounts.low} low · {evaluationCounts.critical} critical · {evaluationCounts.not_assessed} not assessed
                  </p>
                  <p className="mt-2 text-[10px] leading-relaxed text-slate-500">
                    Status uses report flags and reference ranges. Blood pressure labels use general adult screening thresholds, not a diagnosis. Confirm results with a healthcare professional.
                  </p>
                </div>
                <div className="overflow-x-auto">
                  <div className="min-w-[680px]">
                    <div className="grid grid-cols-[minmax(180px,1fr)_120px_120px_110px_120px] gap-3 px-4 py-2 border-b border-slate-100 bg-slate-50 text-[10px] font-semibold uppercase text-slate-400">
                      <span>Test</span><span>Previous</span><span>Current</span><span>Change</span><span>Assessment</span>
                    </div>
                    {cmpData.map(row => (
                      <div key={`${row.test_name}-${row.unit}`} className="grid grid-cols-[minmax(180px,1fr)_120px_120px_110px_120px] items-center gap-3 px-4 py-3 border-b border-slate-100 text-xs">
                        <span className="font-semibold text-slate-700">{row.test_name}</span>
                        <div>
                          <p className="text-slate-600">{row.prev_value ? `${row.prev_value} ${row.unit}` : 'Not in report'}</p>
                          <StatusBadge status={row.previous_status} />
                        </div>
                        <div>
                          <p className="font-semibold text-slate-700">{row.value ? `${row.value} ${row.unit}` : 'Not in report'}</p>
                          <StatusBadge status={row.current_status} />
                        </div>
                        <span className="text-slate-600">
                          {row.diff === null ? '—' : `${row.diff > 0 ? '+' : ''}${row.diff.toFixed(2)} ${row.unit}`}
                        </span>
                        <StatusBadge status={row.current_status} />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <p className="px-5 py-2.5 text-[10px] text-slate-400 border-t border-slate-100">
              ⚠️ AI explanations are general information only. Always consult your doctor for medical decisions.
              Extracted values shown as-is from demo data — not from a real OCR process.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
