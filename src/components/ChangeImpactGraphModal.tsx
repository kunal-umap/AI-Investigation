import React, { useEffect, useState } from 'react';
import { ChangeGraph } from '../types';
import { fetchChangeGraph } from '../api';
import { X, Network, Server, Database, Layers, ArrowRight, GitCommit, FileCode, AlertOctagon } from 'lucide-react';

interface ChangeImpactGraphModalProps {
  service: string;
  isOpen: boolean;
  onClose: () => void;
}

export const ChangeImpactGraphModal: React.FC<ChangeImpactGraphModalProps> = ({
  service,
  isOpen,
  onClose,
}) => {
  const [graph, setGraph] = useState<ChangeGraph | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      fetchChangeGraph(service)
        .then((data) => {
          setGraph(data);
          setSelectedNodeId(`svc-${service}`);
        })
        .catch((err) => console.error(err))
        .finally(() => setLoading(false));
    }
  }, [isOpen, service]);

  if (!isOpen) return null;

  const selectedNode = graph?.nodes.find((n) => n.id === selectedNodeId);

  const getNodeIcon = (type: string) => {
    switch (type) {
      case 'SERVICE':
        return <Server className="h-4 w-4 text-emerald-400" />;
      case 'DATABASE':
        return <Database className="h-4 w-4 text-amber-400" />;
      case 'API':
        return <Network className="h-4 w-4 text-sky-400" />;
      case 'DEPLOYMENT':
        return <GitCommit className="h-4 w-4 text-purple-400" />;
      case 'CONFIGURATION':
        return <FileCode className="h-4 w-4 text-teal-400" />;
      case 'INCIDENT':
        return <AlertOctagon className="h-4 w-4 text-rose-400" />;
      default:
        return <Layers className="h-4 w-4 text-zinc-400" />;
    }
  };

  const getRelationshipColor = (rel: string) => {
    switch (rel) {
      case 'AFFECTED_BY':
        return 'border-rose-500/50 text-rose-400 bg-rose-500/10';
      case 'CORRELATED_WITH':
      case 'DEPLOYED_WITH':
        return 'border-purple-500/50 text-purple-400 bg-purple-500/10';
      case 'WRITES_TO':
      case 'READS_FROM':
        return 'border-amber-500/50 text-amber-400 bg-amber-500/10';
      default:
        return 'border-zinc-700 text-zinc-300 bg-zinc-800/40';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-zinc-950 border border-zinc-800 rounded-2xl flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-900/50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
              <Network className="h-5 w-5 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-zinc-100">
                Dependency & Change Impact Graph
              </h3>
              <p className="text-xs text-zinc-400">
                Topological correlation of recent deployments, configs, and dependent data sources for{' '}
                <span className="font-mono text-emerald-400">{service}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-zinc-200 rounded-lg hover:bg-zinc-800 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {loading ? (
            <div className="py-16 text-center text-zinc-400 text-sm">
              Constructing dependency and change correlation graph...
            </div>
          ) : graph ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Nodes List / Map */}
              <div className="lg:col-span-2 space-y-3">
                <div className="text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">
                  Correlated Graph Entities ({graph.nodes.length})
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {graph.nodes.map((node) => {
                    const isSelected = node.id === selectedNodeId;
                    return (
                      <button
                        key={node.id}
                        onClick={() => setSelectedNodeId(node.id)}
                        className={`text-left p-3 rounded-xl border transition-all ${
                          isSelected
                            ? 'bg-zinc-900 border-emerald-500 ring-1 ring-emerald-500'
                            : 'bg-zinc-900/50 border-zinc-800 hover:border-zinc-700'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {getNodeIcon(node.type)}
                            <span className="text-xs font-medium text-zinc-200 truncate">
                              {node.label}
                            </span>
                          </div>
                          <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-400">
                            {node.type}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Graph Edges / Direct Relationships */}
                <div className="mt-6 pt-4 border-t border-zinc-800">
                  <div className="text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-3">
                    Relationship Edges ({graph.edges.length})
                  </div>
                  <div className="space-y-2">
                    {graph.edges.map((edge, idx) => {
                      const srcNode = graph.nodes.find((n) => n.id === edge.sourceId);
                      const tgtNode = graph.nodes.find((n) => n.id === edge.targetId);
                      return (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-2.5 rounded-lg border border-zinc-800/80 bg-zinc-900/30 text-xs"
                        >
                          <div className="flex items-center gap-2 truncate">
                            <span className="font-mono text-zinc-300">
                              {srcNode?.label || edge.sourceId}
                            </span>
                            <ArrowRight className="h-3 w-3 text-zinc-500 shrink-0" />
                            <span className="font-mono text-zinc-300">
                              {tgtNode?.label || edge.targetId}
                            </span>
                          </div>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-mono border uppercase tracking-wider ${getRelationshipColor(
                              edge.relationship
                            )}`}
                          >
                            {edge.relationship}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Selected Entity Inspector */}
              <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/40 h-fit space-y-4">
                <div className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                  Node Inspector
                </div>
                {selectedNode ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      {getNodeIcon(selectedNode.type)}
                      <div>
                        <div className="text-sm font-semibold text-zinc-100">
                          {selectedNode.label}
                        </div>
                        <div className="text-[11px] font-mono text-zinc-500">
                          ID: {selectedNode.id}
                        </div>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-zinc-800 space-y-2">
                      <div className="text-xs text-zinc-400">Node Attributes:</div>
                      {selectedNode.attributes && Object.keys(selectedNode.attributes).length > 0 ? (
                        Object.entries(selectedNode.attributes).map(([k, v]) => (
                          <div
                            key={k}
                            className="flex items-center justify-between text-xs py-1 px-2 rounded bg-zinc-900/80 border border-zinc-800"
                          >
                            <span className="text-zinc-400 font-mono">{k}</span>
                            <span className="text-zinc-200 font-mono">{v}</span>
                          </div>
                        ))
                      ) : (
                        <div className="text-xs text-zinc-500 italic">No custom attributes</div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="text-xs text-zinc-500">Select a node to inspect properties</div>
                )}
              </div>
            </div>
          ) : (
            <div className="py-12 text-center text-zinc-500">No graph data available</div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-zinc-800 bg-zinc-900/50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium rounded-lg bg-zinc-800 text-zinc-200 hover:bg-zinc-700 transition-colors"
          >
            Close Graph
          </button>
        </div>
      </div>
    </div>
  );
};
