import React, { useState } from 'react';
import {
  X,
  Copy,
  Check,
  ExternalLink,
  Download,
  Brain,
  FileSpreadsheet,
  FileText,
  Presentation,
  Code,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { GeminiGeneratedWorkspaceDoc, WorkspaceDocumentCategory } from '../types';
import { GoogleWorkspaceService } from '../services/googleWorkspace';
import { downloadDocumentInFormat } from '../utils/workspaceDownloader';
import { safeCopyToClipboard } from '../utils/clipboard';

interface GeminiWorkspaceDocModalProps {
  doc: GeminiGeneratedWorkspaceDoc | null;
  onClose: () => void;
  onSaveToBrain: (doc: GeminiGeneratedWorkspaceDoc) => void;
  isSaved?: boolean;
}

export const GeminiWorkspaceDocModal: React.FC<GeminiWorkspaceDocModalProps> = ({
  doc,
  onClose,
  onSaveToBrain,
  isSaved = false,
}) => {
  const [copied, setCopied] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  if (!doc) return null;

  const handleCopyContent = async () => {
    const textToCopy = doc.fullContent || doc.contentSnippet || doc.description;
    await safeCopyToClipboard(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleCopyCode = async () => {
    if (!doc.appsScriptCode) return;
    await safeCopyToClipboard(doc.appsScriptCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2500);
  };

  const handleDownload = () => {
    const ext = doc.category === 'sheet' ? 'csv' : doc.appsScriptCode ? 'gs' : 'md';
    const content = doc.appsScriptCode || doc.fullContent || doc.contentSnippet || doc.description;
    GoogleWorkspaceService.downloadDocumentAsFile(doc.title, content, ext);
  };

  const getCategoryBadge = (cat: WorkspaceDocumentCategory) => {
    switch (cat) {
      case 'sheet':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Google Sheets</span>
          </span>
        );
      case 'form':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-fuchsia-100 dark:bg-fuchsia-950/60 text-fuchsia-700 dark:text-fuchsia-300 border border-fuchsia-200 dark:border-fuchsia-800">
            <FileText className="w-3.5 h-3.5" />
            <span>Google Forms</span>
          </span>
        );
      case 'slide':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
            <Presentation className="w-3.5 h-3.5" />
            <span>Google Slides</span>
          </span>
        );
      case 'knowledge_base':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
            <Brain className="w-3.5 h-3.5" />
            <span>Cerebro RBC / Apps Script</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
            <FileText className="w-3.5 h-3.5" />
            <span>Google Docs</span>
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-fade-in text-left">
      <div className="bg-white dark:bg-[#151518] rounded-3xl max-w-3xl w-full p-6 sm:p-8 border border-gray-200 dark:border-neutral-800 shadow-2xl space-y-6 relative my-8 max-h-[90vh] flex flex-col">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-gray-400 hover:text-black dark:hover:text-white rounded-full hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors"
          title="Cerrar modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="space-y-2 pr-10">
          <div className="flex flex-wrap items-center gap-2">
            {getCategoryBadge(doc.category)}
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800/40">
              <Sparkles className="w-3 h-3 text-purple-500" />
              <span>Generado por Gemini 3.8 Flash</span>
            </span>
          </div>
          <h3 className="text-xl sm:text-2xl font-bold text-black dark:text-white tracking-tight">
            {doc.title}
          </h3>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-neutral-400 font-light leading-relaxed">
            {doc.description}
          </p>
        </div>

        {/* Scrollable Content Body */}
        <div className="overflow-y-auto flex-1 space-y-5 pr-1">
          {/* Tags */}
          {doc.tags && doc.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {doc.tags.map((t, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-gray-100 dark:bg-neutral-800 text-gray-700 dark:text-neutral-300"
                >
                  #{t}
                </span>
              ))}
            </div>
          )}

          {/* Integration Instructions */}
          {doc.integrationInstructions && (
            <div className="p-4 rounded-2xl bg-amber-50/80 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-800/40">
              <h4 className="text-xs font-bold text-amber-900 dark:text-amber-200 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <span>💡 Instrucciones de Integración Workspace</span>
              </h4>
              <p className="text-xs text-amber-800 dark:text-amber-300/90 leading-relaxed font-light">
                {doc.integrationInstructions}
              </p>
            </div>
          )}

          {/* Table Schema for Sheets */}
          {doc.tableSchema && doc.tableSchema.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-neutral-400 flex items-center gap-1.5">
                <FileSpreadsheet className="w-4 h-4 text-emerald-500" />
                <span>Estructura de Columnas (Google Sheets)</span>
              </h4>
              <div className="overflow-x-auto rounded-2xl border border-gray-200 dark:border-neutral-800">
                <table className="w-full text-left text-xs">
                  <thead className="bg-gray-50 dark:bg-neutral-900 border-b border-gray-200 dark:border-neutral-800 font-bold text-gray-600 dark:text-neutral-400">
                    <tr>
                      <th className="p-3">Nombre Columna</th>
                      <th className="p-3">Descripción Ontológica</th>
                      <th className="p-3">Valor de Muestra</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-neutral-800 font-medium">
                    {doc.tableSchema.map((col, idx) => (
                      <tr key={idx} className="hover:bg-gray-50/50 dark:hover:bg-neutral-800/30">
                        <td className="p-3 font-semibold text-emerald-700 dark:text-emerald-400">
                          {col.column}
                        </td>
                        <td className="p-3 text-gray-600 dark:text-neutral-400">{col.description}</td>
                        <td className="p-3 font-mono text-[11px] text-gray-500 dark:text-neutral-500">
                          {col.sampleValue || '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Form Questions for Google Forms */}
          {doc.formQuestions && doc.formQuestions.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-neutral-400 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-fuchsia-500" />
                <span>Preguntas Diseñadas para Google Forms</span>
              </h4>
              <div className="space-y-2">
                {doc.formQuestions.map((q, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-2xl bg-gray-50 dark:bg-neutral-900/80 border border-gray-200 dark:border-neutral-800 text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold text-black dark:text-white">
                        {idx + 1}. {q.title}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-fuchsia-100 dark:bg-fuchsia-950/60 text-fuchsia-700 dark:text-fuchsia-300">
                          {q.type}
                        </span>
                        {q.required && (
                          <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300">
                            Obligatoria
                          </span>
                        )}
                      </div>
                    </div>
                    {q.options && q.options.length > 0 && (
                      <div className="pl-4 pt-1 space-y-1 text-gray-600 dark:text-neutral-400">
                        {q.options.map((opt, oIdx) => (
                          <div key={oIdx} className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                            <span>{opt}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Apps Script Code */}
          {doc.appsScriptCode && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-neutral-400 flex items-center gap-1.5">
                  <Code className="w-4 h-4 text-purple-500" />
                  <span>Código Google Apps Script</span>
                </h4>
                <button
                  type="button"
                  onClick={handleCopyCode}
                  className="px-2.5 py-1 rounded-xl text-[10px] font-bold bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 hover:bg-purple-100 flex items-center gap-1 transition-colors"
                >
                  {copiedCode ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedCode ? '¡Código Copiado!' : 'Copiar Script'}</span>
                </button>
              </div>
              <pre className="p-4 rounded-2xl bg-neutral-900 text-emerald-400 font-mono text-[11px] overflow-x-auto leading-relaxed border border-neutral-800">
                {doc.appsScriptCode}
              </pre>
            </div>
          )}

          {/* Full Content Text / Markdown */}
          {doc.fullContent && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-neutral-400 flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-blue-500" />
                  <span>Contenido Completo del Documento</span>
                </h4>
                <button
                  type="button"
                  onClick={handleCopyContent}
                  className="px-2.5 py-1 rounded-xl text-[10px] font-bold bg-gray-100 dark:bg-neutral-800 text-gray-700 dark:text-neutral-300 hover:bg-gray-200 flex items-center gap-1 transition-colors"
                >
                  {copied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                  <span>{copied ? '¡Copiado!' : 'Copiar Texto'}</span>
                </button>
              </div>
              <div className="p-4 rounded-2xl bg-gray-50 dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 text-xs text-gray-700 dark:text-neutral-300 font-mono whitespace-pre-wrap leading-relaxed max-h-64 overflow-y-auto">
                {doc.fullContent}
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons Footer */}
        <div className="pt-4 border-t border-gray-200 dark:border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] font-bold text-gray-500 dark:text-neutral-400 mr-1">
              Descargar en:
            </span>

            <button
              type="button"
              onClick={() => downloadDocumentInFormat(doc, 'md')}
              className="px-2.5 py-1.5 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 text-xs font-semibold flex items-center gap-1 hover:bg-purple-100 transition-colors cursor-pointer"
              title="Descargar en formato Markdown (.md)"
            >
              <Download className="w-3 h-3" />
              <span>.MD</span>
            </button>

            {doc.category === 'sheet' && (
              <button
                type="button"
                onClick={() => downloadDocumentInFormat(doc, 'csv')}
                className="px-2.5 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs font-semibold flex items-center gap-1 hover:bg-emerald-100 transition-colors cursor-pointer"
                title="Descargar Hoja de Cálculo en CSV (.csv)"
              >
                <Download className="w-3 h-3" />
                <span>.CSV</span>
              </button>
            )}

            {(doc.appsScriptCode || doc.category === 'knowledge_base') && (
              <button
                type="button"
                onClick={() => downloadDocumentInFormat(doc, 'gs')}
                className="px-2.5 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 text-xs font-semibold flex items-center gap-1 hover:bg-amber-100 transition-colors cursor-pointer"
                title="Descargar Código Apps Script (.gs)"
              >
                <Download className="w-3 h-3" />
                <span>.GS</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => downloadDocumentInFormat(doc, 'txt')}
              className="px-2.5 py-1.5 rounded-xl bg-gray-100 dark:bg-neutral-800 text-gray-700 dark:text-neutral-300 border border-gray-200 dark:border-neutral-700 text-xs font-semibold flex items-center gap-1 hover:bg-gray-200 transition-colors cursor-pointer"
              title="Descargar en Texto Plano (.txt)"
            >
              <Download className="w-3 h-3" />
              <span>.TXT</span>
            </button>

            <button
              type="button"
              onClick={() => downloadDocumentInFormat(doc, 'json')}
              className="px-2.5 py-1.5 rounded-xl bg-gray-100 dark:bg-neutral-800 text-gray-700 dark:text-neutral-300 border border-gray-200 dark:border-neutral-700 text-xs font-semibold flex items-center gap-1 hover:bg-gray-200 transition-colors cursor-pointer"
              title="Descargar Estructura JSON (.json)"
            >
              <span>.JSON</span>
            </button>

            <button
              type="button"
              onClick={handleCopyContent}
              className="px-3 py-1.5 rounded-xl border border-gray-200 dark:border-neutral-800 hover:bg-gray-50 dark:hover:bg-neutral-800 text-gray-700 dark:text-neutral-300 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ml-1"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? '¡Copiado!' : 'Copiar'}</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            {doc.openUrl && (
              <a
                href={doc.openUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 rounded-2xl border border-blue-200 dark:border-blue-900/60 bg-blue-50/80 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 hover:bg-blue-100 text-xs font-bold flex items-center gap-1.5 transition-colors"
              >
                <span>Abrir en Google Workspace</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}

            <button
              type="button"
              onClick={() => onSaveToBrain(doc)}
              disabled={isSaved}
              className={`px-4.5 py-2 rounded-2xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-sm ${
                isSaved
                  ? 'bg-emerald-600 text-white cursor-default'
                  : 'bg-black text-white dark:bg-white dark:text-black hover:bg-neutral-800 dark:hover:bg-neutral-200'
              }`}
            >
              {isSaved ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Registrado en Cerebro RBC</span>
                </>
              ) : (
                <>
                  <Brain className="w-4 h-4 text-purple-400 dark:text-purple-600" />
                  <span>Guardar en Cerebro & Drive</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
