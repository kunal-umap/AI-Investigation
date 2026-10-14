import React, { useState, useEffect } from 'react';
import { ChangeGraph } from '../types';
import { fetchChangeGraph } from '../api';
import { Network, Server, Database, GitCommit, FileCode, AlertOctagon, Layers, ArrowRight } from 'lucide-react';

export const TopologyView: React.FC = () => {
  const [service, setService] = useState('order-service');
  const [graph, setGraph] = useState<ChangeGraph | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetchChangeGraph(service)
      .then((data) => {
        setGraph(data);
        setSelectedNodeId(`svc-${service}`);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [service]);

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
        return <Layers className="h-4 w-4 text-slate-400" />;
    }
  };

  return (
    <div className="space-y-4">
      {/* Service selector */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div>
          <h3 className="text-sm font-semibold text-slate-100">Service Topology & Change Impact</h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Topological correlation mapping service runtime dependencies to recent deployments, configuration diffs, and database pools.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-mono">Service:</span>
          <select
            value={service}
            onChange={(e) => setService(e.target.value)}
            className="bg-slate-900 border border-slate-800 text-xs font-mono text-emerald-400 rounded px-2.5 py-1 focus:outline-hidden cursor-pointer"
          >
            <option value="order-service">order-service</option>
            <option value="payment-service">payment-service</option>
            <option value="inventory-service">inventory-service</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center text-xs text-slate-500 border border-slate-800 rounded-lg">
          Rendering dependency topology...
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Visual Node Graph */}
          <div className="lg:col-span-8 border border-slate-800 bg-slate-900/30 rounded-lg p-5">
            <div className="text-xs font-mono text-slate-400 mb-3 flex items-center justify-between">
              <span>TOPOLOGY NODES ({graph?.nodes.length || 0})</span>
              <span className="text-[11px] text-slate-500">Click a node to inspect relationships</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {graph?.nodes.map((node) => {
                const isSelected = selectedNodeId === node.id;
                return (
                  <div
                    key={node.id}
                    onClick={() => setSelectedNodeId(node.id)}
                    className={`p-3 rounded-lg border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-slate-900 border-emerald-500 shadow-xs'
                        : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 font-mono text-xs font-medium text-slate-200">
                        {getNodeIcon(node.type)}
                        <span>{node.name}</span>
                      </div>
                      <span className="font-mono text-[10px] text-slate-500 uppercase">{node.type}</span>
                    </div>

                    {/* Metadata preview */}
                    <div className="mt-2 text-[11px] font-mono text-slate-400 bg-slate-900/80 p-2 rounded border border-slate-850">
                      {Object.entries(node.metadata || {})
                        .slice(0, 2)
                        .map(([k, v]) => (
                          <div key={k} className="truncate">
                            <span className="text-slate-500">{k}:</span> {String(v)}
                          </div>
                        ))}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Edge list */}
            <div className="mt-6 pt-4 border-t border-slate-800">
              <div className="text-xs font-mono text-slate-400 mb-2">GRAPH EDGES / RELATIONSHIPS</div>
              <div className="space-y-1.5 max-h-48 overflow-y-auto">
                {graph?.edges.map((edge, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between text-[11px] font-mono py-1 px-2.5 rounded bg-slate-950 border border-slate-850 text-slate-300"
                  >
                    <span className="text-slate-400">{edge.sourceId}</span>
                    <span className="text-emerald-400 font-semibold px-2">--[{edge.relationship}]--&gt;</span>
                    <span className="text-slate-400">{edge.targetId}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Node Inspector */}
          <div className="lg:col-span-4 border border-slate-800 bg-slate-900/50 rounded-lg p-5">
            {selectedNode ? (
              <div className="space-y-4">
                <div className="border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2 text-xs font-mono text-emerald-400">
                    {getNodeIcon(selectedNode.type)}
                    <span>{selectedNode.type}</span>
                  </div>
                  <h4 className="text-sm font-semibold text-slate-100 mt-1 font-mono">{selectedNode.name}</h4>
                  <p className="text-[11px] font-mono text-slate-500 mt-0.5">ID: {selectedNode.id}</p>
                </div>

                <div>
                  <div className="text-xs font-medium text-slate-300 mb-1.5">Runtime Node Attributes</div>
                  <div className="space-y-1.5 text-xs font-mono bg-slate-950 p-3 rounded border border-slate-800">
                    {Object.entries(selectedNode.metadata || {}).map(([k, v]) => (
                      <div key={k} className="flex flex-col py-0.5 border-b border-slate-850 last:border-b-0">
                        <span className="text-slate-500 text-[10px] uppercase">{k}</span>
                        <span className="text-slate-200 break-all">{String(v)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="text-xs font-medium text-slate-300 mb-1.5">Connected Relationships</div>
                  <div className="space-y-1 text-[11px] font-mono text-slate-400">
                    {graph?.edges
                      .filter((e) => e.sourceId === selectedNode.id || e.targetId === selectedNode.id)
                      .map((e, idx) => (
                        <div key={idx} className="p-1.5 rounded bg-slate-950/60 border border-slate-850">
                          {e.sourceId === selectedNode.id ? (
                            <span>
                              Points to <strong className="text-slate-200">{e.targetId}</strong> via {e.relationship}
                            </span>
                          ) : (
                            <span>
                              Referenced by <strong className="text-slate-200">{e.sourceId}</strong> via {e.relationship}
                            </span>
                          )}
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-xs text-slate-500 text-center py-12">
                Click any node in the topology canvas to inspect runtime attributes.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
