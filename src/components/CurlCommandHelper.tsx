import React, { useState } from 'react';
import { Terminal, Copy, Check, ExternalLink } from 'lucide-react';

export const CurlCommandHelper: React.FC = () => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const commands = [
    {
      label: '1. Create an incident (POST /api/v1/incidents)',
      cmd: `curl -s -X POST http://localhost:8088/api/v1/incidents \\
  -H "Content-Type: application/json" \\
  -d '{
    "title": "Payment Service 504 Timeout Spike",
    "description": "Connection pool reached 100% saturation",
    "severity": "CRITICAL",
    "environment": "production",
    "serviceName": "payment-service",
    "startedAt": "'$(date -u +"%Y-%m-%dT%H:%M:%SZ")'"
  }'`,
    },
    {
      label: '2. List incidents with pagination (GET /api/v1/incidents)',
      cmd: `curl -s "http://localhost:8088/api/v1/incidents?page=0&size=10"`,
    },
    {
      label: '3. Query OpenAPI schema definition',
      cmd: `curl -s http://localhost:8088/v3/api-docs`,
    },
    {
      label: '4. Actuator Liveness & Readiness Probes',
      cmd: `curl -s http://localhost:8088/actuator/health`,
    },
  ];

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4">
      <div className="flex items-center justify-between mb-3 border-b border-zinc-850 pb-2">
        <div className="flex items-center gap-2">
          <Terminal className="h-4 w-4 text-emerald-400" />
          <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-300">
            Local REST API & Terminal Verification Commands
          </h3>
        </div>
        <div className="flex items-center gap-3 text-xs text-zinc-400">
          <a
            href="/swagger-ui.html"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1 text-emerald-400 hover:text-emerald-300 transition-colors"
          >
            <span>Swagger UI</span>
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </div>

      <div className="space-y-3">
        {commands.map((c, i) => (
          <div key={i} className="rounded-lg bg-zinc-900 border border-zinc-800 p-2.5">
            <div className="flex items-center justify-between text-[11px] font-medium text-zinc-400 mb-1.5">
              <span>{c.label}</span>
              <button
                onClick={() => handleCopy(c.cmd, i)}
                className="flex items-center gap-1 text-[11px] text-zinc-400 hover:text-emerald-400 transition-colors"
              >
                {copiedIndex === i ? (
                  <>
                    <Check className="h-3 w-3 text-emerald-400" />
                    <span className="text-emerald-400">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3 w-3" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
            <pre className="overflow-x-auto text-[11px] font-mono text-zinc-300 bg-black/40 p-2 rounded border border-zinc-850 whitespace-pre">
              {c.cmd}
            </pre>
          </div>
        ))}
      </div>
    </div>
  );
};
