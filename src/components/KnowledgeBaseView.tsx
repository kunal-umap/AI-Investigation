import React, { useState, useEffect } from 'react';
import { searchKnowledge } from '../api';
import { Search, BookOpen, CheckCircle, Tag, ExternalLink, Filter, FileText } from 'lucide-react';

export const KnowledgeBaseView: React.FC = () => {
  const [query, setQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('');
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<any | null>(null);

  const loadDocs = async () => {
    setLoading(true);
    try {
      const res = await searchKnowledge(query, undefined, selectedType || undefined);
      setDocuments(res);
      if (res.length > 0 && !selectedDoc) {
        setSelectedDoc(res[0]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDocs();
  }, [query, selectedType]);

  return (
    <div className="space-y-4">
      {/* Search Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-lg">
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-500" />
          <input
            type="text"
            placeholder="Search runbooks, post-mortems, SOPs, and past root causes..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-md pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-hidden focus:border-slate-700"
          />
        </div>

        {/* Category filters */}
        <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 rounded-md p-0.5 text-xs">
          <button
            onClick={() => setSelectedType('')}
            className={`px-3 py-1 rounded transition-colors ${
              selectedType === '' ? 'bg-slate-800 text-slate-100 font-medium' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            All Sources
          </button>
          <button
            onClick={() => setSelectedType('POSTMORTEM')}
            className={`px-3 py-1 rounded transition-colors ${
              selectedType === 'POSTMORTEM' ? 'bg-slate-800 text-slate-100 font-medium' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Post-Mortems
          </button>
          <button
            onClick={() => setSelectedType('RUNBOOK')}
            className={`px-3 py-1 rounded transition-colors ${
              selectedType === 'RUNBOOK' ? 'bg-slate-800 text-slate-100 font-medium' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Runbooks & SOPs
          </button>
          <button
            onClick={() => setSelectedType('ARCHITECTURE')}
            className={`px-3 py-1 rounded transition-colors ${
              selectedType === 'ARCHITECTURE' ? 'bg-slate-800 text-slate-100 font-medium' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Architecture
          </button>
        </div>
      </div>

      {/* Split Pane: Documents list on left, reader on right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Document list */}
        <div className="lg:col-span-5 space-y-2">
          {loading && documents.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500 border border-slate-800 rounded-lg">
              Loading knowledge documents...
            </div>
          ) : documents.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500 border border-slate-800 rounded-lg">
              No documentation found matching query.
            </div>
          ) : (
            documents.map((doc) => {
              const isSelected = selectedDoc?.id === doc.id;
              return (
                <div
                  key={doc.id}
                  onClick={() => setSelectedDoc(doc)}
                  className={`p-3.5 rounded-lg border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-slate-900 border-emerald-500/50 shadow-xs'
                      : 'bg-slate-900/40 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                    <span className="font-semibold text-emerald-400">{doc.id}</span>
                    <span>{doc.type}</span>
                  </div>
                  <h4 className="mt-1 text-xs font-semibold text-slate-200 line-clamp-1">{doc.title}</h4>
                  <p className="mt-1 text-[11px] text-slate-400 line-clamp-2 leading-relaxed">{doc.summary}</p>

                  <div className="mt-2 flex items-center gap-2 text-[10px] text-slate-500">
                    <span>{doc.service}</span>
                    {doc.verifiedByHuman && (
                      <>
                        <span aria-hidden="true">·</span>
                        <span className="text-emerald-400 flex items-center gap-1">
                          <CheckCircle className="h-3 w-3" /> Human Verified
                        </span>
                      </>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Document Reader */}
        <div className="lg:col-span-7">
          {selectedDoc ? (
            <div className="border border-slate-800 bg-slate-900/50 rounded-lg p-5 space-y-4">
              <div className="border-b border-slate-800 pb-3">
                <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                  <span className="text-emerald-400">{selectedDoc.id}</span>
                  <span className="bg-slate-800 px-2 py-0.5 rounded text-[10px]">{selectedDoc.type}</span>
                </div>
                <h3 className="text-base font-semibold text-slate-100 mt-1">{selectedDoc.title}</h3>
                <div className="text-xs text-slate-400 mt-1 flex items-center gap-2">
                  <span>Service: {selectedDoc.service}</span>
                  {selectedDoc.verifiedAuthor && (
                    <>
                      <span aria-hidden="true">·</span>
                      <span>Verified by: {selectedDoc.verifiedAuthor}</span>
                    </>
                  )}
                </div>
              </div>

              {/* Summary */}
              <div className="space-y-1">
                <div className="text-xs font-semibold text-slate-300">Executive Overview</div>
                <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-3 rounded border border-slate-800/80">
                  {selectedDoc.summary}
                </p>
              </div>

              {/* Root Cause if Postmortem */}
              {selectedDoc.rootCause && (
                <div className="space-y-1">
                  <div className="text-xs font-semibold text-slate-300">Confirmed Root Cause</div>
                  <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-3 rounded border border-slate-800/80">
                    {selectedDoc.rootCause}
                  </p>
                </div>
              )}

              {/* Verified Resolution */}
              {selectedDoc.resolution && (
                <div className="space-y-1">
                  <div className="text-xs font-semibold text-emerald-400">Verified Resolution & Remediation Script</div>
                  <div className="text-xs font-mono text-emerald-300 bg-slate-950 p-3 rounded border border-emerald-500/20 leading-relaxed overflow-x-auto">
                    {selectedDoc.resolution}
                  </div>
                </div>
              )}

              {/* Tags */}
              {selectedDoc.tags && selectedDoc.tags.length > 0 && (
                <div className="pt-2 border-t border-slate-800 flex items-center gap-2 text-xs text-slate-400">
                  <span>Tags:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedDoc.tags.map((t: string) => (
                      <span key={t} className="font-mono text-[10px] px-1.5 py-0.5 bg-slate-800 text-slate-300 rounded">
                        #{t}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="border border-slate-800 bg-slate-900/20 rounded-lg p-12 text-center text-slate-500 text-xs">
              Select a documentation source on the left to inspect verified resolution steps.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
