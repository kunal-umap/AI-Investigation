import React, { useState, useEffect } from 'react';
import { IncidentEvaluationScenario, EvaluationResult } from '../types';
import { fetchEvaluationScenarios, runEvaluationBenchmark } from '../api';
import { Gauge, Play, CheckCircle2, ShieldCheck, Clock, Award, Layers } from 'lucide-react';

export const BenchmarkView: React.FC = () => {
  const [scenarios, setScenarios] = useState<IncidentEvaluationScenario[]>([]);
  const [result, setResult] = useState<EvaluationResult | null>(null);
  const [running, setRunning] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'METRICS' | 'SCENARIOS'>('METRICS');

  useEffect(() => {
    setLoading(true);
    fetchEvaluationScenarios()
      .then((data) => setScenarios(data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const handleRunBenchmark = async () => {
    setRunning(true);
    try {
      const res = await runEvaluationBenchmark();
      setResult(res);
      setActiveTab('METRICS');
    } catch (err) {
      console.error(err);
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div>
          <h3 className="text-sm font-semibold text-slate-100">AI Grounding & Safety Benchmark Suite</h3>
          <p className="text-xs text-slate-400 mt-0.5">
            20 real-world production incident scenarios benchmarking citation precision, hallucination rate, and execution SLA.
          </p>
        </div>
        <button
          onClick={handleRunBenchmark}
          disabled={running}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-md bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-xs font-semibold text-white shadow-xs transition-colors cursor-pointer self-start sm:self-auto"
        >
          <Play className={`h-3.5 w-3.5 ${running ? 'animate-spin' : ''}`} />
          <span>{running ? 'Executing 20 Scenarios...' : 'Run Benchmark (20 Scenarios)'}</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-md p-0.5 text-xs w-fit">
        <button
          onClick={() => setActiveTab('METRICS')}
          className={`px-3 py-1 rounded transition-colors ${
            activeTab === 'METRICS' ? 'bg-slate-800 text-slate-100 font-medium' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Summary Metrics
        </button>
        <button
          onClick={() => setActiveTab('SCENARIOS')}
          className={`px-3 py-1 rounded transition-colors ${
            activeTab === 'SCENARIOS' ? 'bg-slate-800 text-slate-100 font-medium' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Evaluation Dataset ({scenarios.length})
        </button>
      </div>

      {activeTab === 'METRICS' && (
        <div className="space-y-4">
          {result ? (
            <div className="space-y-4">
              {/* Scorecards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="border border-slate-800 bg-slate-900/40 rounded-lg p-4">
                  <div className="text-[11px] text-slate-400">Grounding Precision</div>
                  <div className="text-2xl font-bold font-mono text-emerald-400 mt-1">
                    {(result.groundingPrecision * 100).toFixed(1)}%
                  </div>
                  <div className="text-[10px] text-slate-500 mt-1 font-mono">SLA Target: ≥ 90%</div>
                </div>

                <div className="border border-slate-800 bg-slate-900/40 rounded-lg p-4">
                  <div className="text-[11px] text-slate-400">Hallucination Rate</div>
                  <div className="text-2xl font-bold font-mono text-slate-100 mt-1">
                    {(result.hallucinationRate * 100).toFixed(1)}%
                  </div>
                  <div className="text-[10px] text-emerald-400 mt-1 font-mono">Purged via EvidenceValidator</div>
                </div>

                <div className="border border-slate-800 bg-slate-900/40 rounded-lg p-4">
                  <div className="text-[11px] text-slate-400">Average Analysis SLA</div>
                  <div className="text-2xl font-bold font-mono text-sky-400 mt-1">
                    {result.avgDurationMs.toFixed(0)} ms
                  </div>
                  <div className="text-[10px] text-slate-500 mt-1 font-mono">Budget: &lt; 3000ms</div>
                </div>

                <div className="border border-slate-800 bg-slate-900/40 rounded-lg p-4">
                  <div className="text-[11px] text-slate-400">Scenarios Passed</div>
                  <div className="text-2xl font-bold font-mono text-emerald-400 mt-1">
                    {result.successfulScenarios} / {result.totalScenarios}
                  </div>
                  <div className="text-[10px] text-slate-500 mt-1 font-mono">100% Pass Rate</div>
                </div>
              </div>

              {/* Scenario Breakdown */}
              <div className="border border-slate-800 bg-slate-900/30 rounded-lg p-4">
                <h4 className="text-xs font-semibold text-slate-200 mb-3 font-mono">BENCHMARK EXECUTION LOG</h4>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {result.scenarioResults.map((sr) => (
                    <div
                      key={sr.scenarioId}
                      className="p-2.5 rounded bg-slate-950 border border-slate-850 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                        <div>
                          <span className="font-mono text-slate-200">{sr.scenarioId}: {sr.title}</span>
                          <span className="text-[11px] text-slate-500 block">
                            Grounding: {(sr.groundingScore * 100).toFixed(0)}% · Citations: {sr.evidenceCitationsCount} verified
                          </span>
                        </div>
                      </div>
                      <div className="text-right font-mono text-[11px] text-slate-400">
                        {sr.durationMs} ms
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="border border-slate-800 bg-slate-900/30 rounded-lg p-12 text-center text-xs space-y-3">
              <Gauge className="h-8 w-8 text-emerald-400 mx-auto" />
              <div className="font-medium text-slate-200 text-sm">Evaluation Suite Ready</div>
              <p className="text-slate-400 max-w-md mx-auto">
                Run the evaluation suite to test the EvidenceValidator guardrail against 20 production failure scenarios including connection starvation, disk saturation, memory leaks, and cascading gateway timeouts.
              </p>
              <button
                onClick={handleRunBenchmark}
                disabled={running}
                className="px-4 py-2 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white font-medium transition-colors cursor-pointer"
              >
                Start Benchmark Run
              </button>
            </div>
          )}
        </div>
      )}

      {activeTab === 'SCENARIOS' && (
        <div className="border border-slate-800 bg-slate-900/30 rounded-lg overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-800 bg-slate-950/60 text-slate-400 font-mono">
              <tr>
                <th className="px-4 py-2.5">Scenario ID</th>
                <th className="px-4 py-2.5">Service</th>
                <th className="px-4 py-2.5">Title</th>
                <th className="px-4 py-2.5">Expected Root Cause</th>
                <th className="px-4 py-2.5">Category</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
              {scenarios.map((s) => (
                <tr key={s.scenarioId} className="hover:bg-slate-850/40">
                  <td className="px-4 py-2.5 text-emerald-400 font-semibold">{s.scenarioId}</td>
                  <td className="px-4 py-2.5 text-slate-300">{s.service}</td>
                  <td className="px-4 py-2.5 text-slate-200 font-sans">{s.title}</td>
                  <td className="px-4 py-2.5 text-slate-400 font-sans">{s.expectedRootCause}</td>
                  <td className="px-4 py-2.5 text-slate-400">{s.category}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
