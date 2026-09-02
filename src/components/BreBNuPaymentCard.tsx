import React, { useState } from 'react';
import {
  Copy,
  Check,
  Download,
  MessageCircle,
  ExternalLink,
  ShieldCheck,
  Upload,
  Image as ImageIcon,
  X,
  Smartphone,
} from 'lucide-react';
import { BRE_B_NU_CONFIG } from '../services/store';

interface BreBNuPaymentCardProps {
  amount: string;
  concept: string;
  clientName: string;
  clientEmail: string;
  proofImage: string | null;
  onProofImageChange: (base64: string | null) => void;
  whatsappSent: boolean;
  onWhatsappSentToggle: (sent: boolean) => void;
}

export const BreBNuPaymentCard: React.FC<BreBNuPaymentCardProps> = ({
  amount,
  concept,
  clientName,
  clientEmail,
  proofImage,
  onProofImageChange,
  whatsappSent,
  onWhatsappSentToggle,
}) => {
  const [copiedKey, setCopiedKey] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const handleCopyKey = () => {
    navigator.clipboard.writeText(BRE_B_NU_CONFIG.llave);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2500);
  };

  const handleFileSelected = (file: File) => {
    if (!file || !file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      onProofImageChange(result);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelected(e.dataTransfer.files[0]);
    }
  };

  // Pre-filled WhatsApp message for payment proof
  const whatsappText = encodeURIComponent(
    `Hola John, cordial saludo. He realizado mi transferencia de ${amount} mediante Bre-B Nu (Llave: ${BRE_B_NU_CONFIG.llave}) para formalizar "${concept}" en Rengifo Basto Consultoría Ontológica.\n\nParticipante: ${clientName}\nEmail: ${clientEmail}\n\nAdjunto en este mensaje la captura del comprobante bancario para validación en el sistema.`
  );
  const whatsappUrl = `https://wa.me/${BRE_B_NU_CONFIG.whatsappRaw}?text=${whatsappText}`;

  return (
    <div className="space-y-5">
      {/* Visual Bre-B | Nu Presentation Card (Inspired by the Official Nu QR layout) */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-[#F7F4FA] to-white dark:from-[#1F1929] dark:to-[#16141D] border border-purple-200/70 dark:border-purple-900/40 p-5 sm:p-7 shadow-sm">
        {/* Subtle decorative purple glow */}
        <div className="absolute -top-12 -right-12 w-40 h-40 bg-purple-500/10 dark:bg-purple-500/20 rounded-full blur-2xl pointer-events-none" />

        {/* Top Header: Bre-B | nu */}
        <div className="flex items-center justify-between gap-4 pb-4 border-b border-purple-100 dark:border-purple-950/60">
          <div className="flex items-center gap-2.5">
            <span className="text-xl sm:text-2xl font-black tracking-tight text-[#820AD1] dark:text-[#A855F7] font-sans">
              Bre-B
            </span>
            <span className="text-gray-300 dark:text-neutral-700 text-xl font-light">|</span>
            <span className="text-xl sm:text-2xl font-black tracking-tighter text-[#820AD1] dark:text-[#C084FC] lowercase">
              nu
            </span>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-100/80 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800/60 text-[10px] sm:text-xs font-bold text-[#820AD1] dark:text-[#C084FC]">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Pago Seguro Inmediato</span>
          </div>
        </div>

        {/* Slogan & Amount */}
        <div className="pt-4 text-center space-y-1">
          <h4 className="text-sm sm:text-base font-bold text-gray-900 dark:text-white">
            Paga aquí. Seguro, sin costo y en segundos.
          </h4>
          <p className="text-xs text-gray-500 dark:text-neutral-400 font-light">
            Recibimos pagos a través de Llaves desde cualquier entidad financiera:
            <strong className="text-gray-800 dark:text-neutral-200 font-medium"> Bancolombia, Nequi, Daviplata, Dale, BBVA</strong> y más.
          </p>

          <div className="inline-block mt-2 px-4 py-1.5 rounded-2xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 text-xs font-semibold text-purple-900 dark:text-purple-200">
            Valor a Transferir: <strong className="text-sm font-bold text-[#820AD1] dark:text-[#C084FC]">{amount}</strong>
          </div>
        </div>

        {/* The Authentic Bre-B QR Display */}
        <div className="mt-5 flex flex-col items-center justify-center">
          <div className="w-56 sm:w-64 bg-white p-3 rounded-2xl border-2 border-purple-300 dark:border-purple-700 shadow-md flex flex-col items-center">
            {/* QR Pattern SVG */}
            <div className="p-2 bg-white rounded-xl">
              <svg
                viewBox="0 0 100 100"
                className="w-44 h-44 sm:w-48 sm:h-48"
                fill="currentColor"
              >
                {/* Outer Markers */}
                <rect x="5" y="5" width="26" height="26" rx="4" fill="#111" />
                <rect x="8" y="8" width="20" height="20" rx="3" fill="#fff" />
                <rect x="12" y="12" width="12" height="12" rx="2" fill="#820AD1" />

                <rect x="69" y="5" width="26" height="26" rx="4" fill="#111" />
                <rect x="72" y="8" width="20" height="20" rx="3" fill="#fff" />
                <rect x="76" y="12" width="12" height="12" rx="2" fill="#820AD1" />

                <rect x="5" y="69" width="26" height="26" rx="4" fill="#111" />
                <rect x="8" y="72" width="20" height="20" rx="3" fill="#fff" />
                <rect x="12" y="76" width="12" height="12" rx="2" fill="#820AD1" />

                {/* Inner Data Cells */}
                <rect x="36" y="8" width="6" height="6" fill="#111" />
                <rect x="46" y="8" width="6" height="6" fill="#820AD1" />
                <rect x="56" y="8" width="6" height="6" fill="#111" />

                <rect x="36" y="18" width="6" height="6" fill="#820AD1" />
                <rect x="46" y="18" width="6" height="14" fill="#111" />
                <rect x="56" y="22" width="6" height="6" fill="#820AD1" />

                <rect x="8" y="36" width="6" height="6" fill="#111" />
                <rect x="18" y="36" width="8" height="6" fill="#820AD1" />
                <rect x="30" y="36" width="6" height="6" fill="#111" />
                <rect x="40" y="36" width="6" height="6" fill="#820AD1" />
                <rect x="50" y="36" width="6" height="6" fill="#111" />
                <rect x="62" y="36" width="6" height="6" fill="#820AD1" />
                <rect x="72" y="36" width="8" height="6" fill="#111" />
                <rect x="86" y="36" width="6" height="6" fill="#820AD1" />

                <rect x="8" y="46" width="6" height="6" fill="#820AD1" />
                <rect x="18" y="46" width="6" height="6" fill="#111" />
                <rect x="28" y="46" width="12" height="6" fill="#820AD1" />
                <rect x="44" y="46" width="12" height="12" rx="2" fill="#820AD1" />
                <rect x="60" y="46" width="6" height="6" fill="#111" />
                <rect x="70" y="46" width="12" height="6" fill="#820AD1" />
                <rect x="86" y="46" width="6" height="6" fill="#111" />

                <rect x="8" y="56" width="6" height="6" fill="#111" />
                <rect x="18" y="56" width="6" height="6" fill="#820AD1" />
                <rect x="28" y="56" width="6" height="6" fill="#111" />
                <rect x="60" y="56" width="8" height="6" fill="#820AD1" />
                <rect x="72" y="56" width="6" height="6" fill="#111" />
                <rect x="84" y="56" width="8" height="6" fill="#820AD1" />

                <rect x="36" y="66" width="6" height="6" fill="#111" />
                <rect x="46" y="66" width="8" height="6" fill="#820AD1" />
                <rect x="58" y="66" width="6" height="6" fill="#111" />
                <rect x="70" y="66" width="8" height="6" fill="#820AD1" />
                <rect x="82" y="66" width="6" height="6" fill="#111" />

                <rect x="36" y="76" width="8" height="6" fill="#820AD1" />
                <rect x="48" y="76" width="6" height="6" fill="#111" />
                <rect x="58" y="76" width="8" height="6" fill="#820AD1" />
                <rect x="70" y="76" width="6" height="6" fill="#111" />
                <rect x="80" y="76" width="12" height="12" fill="#820AD1" />

                <rect x="36" y="86" width="6" height="6" fill="#111" />
                <rect x="46" y="86" width="8" height="6" fill="#820AD1" />
                <rect x="58" y="86" width="6" height="6" fill="#111" />
              </svg>
            </div>

            {/* Bottom Purple Ribbon of QR Code */}
            <div className="w-full mt-2 py-2 px-2 bg-[#820AD1] rounded-xl text-center">
              <span className="text-[10px] sm:text-[11px] font-bold text-white tracking-tight block">
                Este código QR está asociado a Llave Nu @ASL775
              </span>
            </div>
          </div>
        </div>

        {/* Copyable Llave Input Field */}
        <div className="mt-5 space-y-2">
          <label className="text-[11px] font-semibold text-gray-500 dark:text-neutral-400 uppercase tracking-wider block text-center">
            Llave Registrada para Transferencias
          </label>
          <div className="flex items-center gap-2 max-w-sm mx-auto p-1.5 pl-4 rounded-2xl bg-white dark:bg-[#201D28] border-2 border-purple-300 dark:border-purple-700/80 shadow-xs">
            <div className="flex-1 min-w-0">
              <span className="text-xs text-gray-400 dark:text-neutral-500 font-medium mr-1.5">
                Llave Nu:
              </span>
              <strong className="text-sm sm:text-base font-extrabold text-[#820AD1] dark:text-[#C084FC]">
                {BRE_B_NU_CONFIG.llave}
              </strong>
            </div>
            <button
              type="button"
              onClick={handleCopyKey}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
                copiedKey
                  ? 'bg-emerald-500 text-white shadow-xs'
                  : 'bg-[#820AD1] hover:bg-[#6D08B0] text-white'
              }`}
            >
              {copiedKey ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>¡Copiada!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copiar Llave</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Dual Submission Methods Section */}
      <div className="space-y-4 pt-1">
        <div className="text-center space-y-1">
          <h4 className="text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-neutral-300">
            ¿Cómo enviar tu comprobante para validación?
          </h4>
          <p className="text-[11px] text-gray-500 dark:text-neutral-400 font-light">
            Elige la opción que prefieras: envíalo directo por WhatsApp o sube la imagen aquí.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* Option A: WhatsApp Direct to +573234642257 */}
          <div className="p-4 rounded-2xl bg-white dark:bg-[#1C1C20] border border-gray-200/80 dark:border-neutral-800 flex flex-col justify-between space-y-3 shadow-2xs">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                  Opción 1 • WhatsApp Oficial
                </span>
                <span className="text-[10px] text-gray-400">Recomendado</span>
              </div>
              <h5 className="text-xs font-bold text-black dark:text-white flex items-center gap-1.5">
                <MessageCircle className="w-3.5 h-3.5 text-emerald-500" />
                Enviar al WhatsApp +57 323 464 2257
              </h5>
              <p className="text-[11px] text-gray-500 dark:text-neutral-400 font-light leading-relaxed">
                Abre el chat con el consultor con los datos prellenados y adjunta tu comprobante.
              </p>
            </div>

            <div className="space-y-2">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => onWhatsappSentToggle(true)}
                className="w-full py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center justify-center gap-2 transition-transform active:scale-98 shadow-xs"
              >
                <MessageCircle className="w-4 h-4 fill-white text-emerald-600" />
                <span>Abrir WhatsApp (+57 323 464 2257)</span>
                <ExternalLink className="w-3 h-3 text-emerald-200" />
              </a>

              <label className="flex items-center gap-2 text-[11px] text-gray-600 dark:text-neutral-400 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={whatsappSent}
                  onChange={(e) => onWhatsappSentToggle(e.target.checked)}
                  className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                />
                <span>Ya envié o enviaré el comprobante por WhatsApp</span>
              </label>
            </div>
          </div>

          {/* Option B: Upload screenshot directly */}
          <div className="p-4 rounded-2xl bg-white dark:bg-[#1C1C20] border border-gray-200/80 dark:border-neutral-800 flex flex-col justify-between space-y-3 shadow-2xs">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-purple-700 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/60 px-2 py-0.5 rounded-full border border-purple-200 dark:border-purple-800">
                  Opción 2 • Subir Aquí
                </span>
                <span className="text-[10px] text-gray-400">Directo en Plataforma</span>
              </div>
              <h5 className="text-xs font-bold text-black dark:text-white flex items-center gap-1.5">
                <Upload className="w-3.5 h-3.5 text-purple-500" />
                Subir Imagen del Comprobante
              </h5>
              <p className="text-[11px] text-gray-500 dark:text-neutral-400 font-light leading-relaxed">
                Carga la captura de tu transferencia para validación directa del administrador.
              </p>
            </div>

            <div>
              {proofImage ? (
                <div className="relative p-2 rounded-xl bg-gray-50 dark:bg-[#25252A] border border-purple-200 dark:border-purple-800 flex items-center gap-3">
                  <img
                    src={proofImage}
                    alt="Comprobante cargado"
                    className="w-14 h-14 object-cover rounded-lg border border-gray-200 dark:border-neutral-700 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      <Check className="w-3 h-3" /> Imagen Cargada
                    </span>
                    <p className="text-[10px] text-gray-500 dark:text-neutral-400 truncate">
                      Lista para ser enviada a validación
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => onProofImageChange(null)}
                    className="p-1 rounded-full text-gray-400 hover:text-red-500 transition-colors cursor-pointer"
                    title="Eliminar imagen"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragOver(true);
                  }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-xl p-3 text-center transition-colors cursor-pointer ${
                    dragOver
                      ? 'border-purple-500 bg-purple-50/50 dark:bg-purple-950/30'
                      : 'border-gray-200 dark:border-neutral-700 hover:border-purple-400 dark:hover:border-purple-600 bg-gray-50/60 dark:bg-[#1E1E22]'
                  }`}
                >
                  <label className="cursor-pointer block space-y-1">
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          handleFileSelected(e.target.files[0]);
                        }
                      }}
                    />
                    <ImageIcon className="w-5 h-5 mx-auto text-purple-500" />
                    <span className="text-[11px] font-semibold text-purple-700 dark:text-purple-300 block">
                      Seleccionar o arrastrar imagen
                    </span>
                    <span className="text-[9px] text-gray-400 block">
                      Formatos: PNG, JPG, JPEG
                    </span>
                  </label>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
