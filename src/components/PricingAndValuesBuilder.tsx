import React, { useState } from 'react';
import {
  Banknote,
  DollarSign,
  Plus,
  Edit2,
  Check,
  X,
  Trash2,
  Sparkles,
  Calculator,
  Copy,
  ExternalLink,
  ShieldCheck,
  Percent,
  CheckCircle2,
  Clock,
  Send,
} from 'lucide-react';
import { OntologicalStore } from '../services/store';
import { PricingPackage } from '../types';
import { PaymentValidationManager } from './PaymentValidationManager';

export const PricingAndValuesBuilder: React.FC = () => {
  const [packages, setPackages] = useState<PricingPackage[]>(() =>
    OntologicalStore.getPricingPackages()
  );
  const [activeTab, setActiveTab] = useState<'packages' | 'calculator' | 'validation'>('packages');

  // Editing package state
  const [editingPackageId, setEditingPackageId] = useState<string | null>(null);
  const [editPrice, setEditPrice] = useState<number>(0);
  const [editDiscount, setEditDiscount] = useState<number>(0);
  const [editDuration, setEditDuration] = useState<string>('');
  const [editSessionsCount, setEditSessionsCount] = useState<number>(1);

  // New package modal
  const [showNewModal, setShowNewModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newPrice, setNewPrice] = useState(500000);
  const [newSessions, setNewSessions] = useState(2);
  const [newDuration, setNewDuration] = useState('4 semanas');
  const [newAudience, setNewAudience] = useState('Líderes y Directores');
  const [newIncludes, setNewIncludes] = useState('2 Sesiones 1 a 1 de 60 min\nAcompañamiento por WhatsApp');

  // Calculator state
  const [calcSelectedPackageId, setCalcSelectedPackageId] = useState<string>(packages[0]?.id || '');
  const [calcClientName, setCalcClientName] = useState('Coachee Directivo');
  const [calcPaymentMethod, setCalcPaymentMethod] = useState<'bre_b_nu' | 'efectivo' | 'wompi'>('bre_b_nu');
  const [copiedQuote, setCopiedQuote] = useState(false);

  const handleStartEdit = (pkg: PricingPackage) => {
    setEditingPackageId(pkg.id);
    setEditPrice(pkg.basePriceCOP);
    setEditDiscount(pkg.brebNuDiscountPercent);
    setEditDuration(pkg.duration);
    setEditSessionsCount(pkg.sessionsCount);
  };

  const handleSaveEdit = (id: string) => {
    OntologicalStore.updatePricingPackage(id, {
      basePriceCOP: editPrice,
      brebNuDiscountPercent: editDiscount,
      duration: editDuration,
      sessionsCount: editSessionsCount,
    });
    setPackages(OntologicalStore.getPricingPackages());
    setEditingPackageId(null);
  };

  const handleCreatePackage = () => {
    if (!newName.trim()) return;
    OntologicalStore.addPricingPackage({
      name: newName.trim(),
      duration: newDuration,
      targetAudience: newAudience,
      sessionsCount: newSessions,
      basePriceCOP: newPrice,
      brebNuDiscountPercent: 5,
      includes: newIncludes.split('\n').filter((s) => s.trim().length > 0),
      active: true,
    });
    setPackages(OntologicalStore.getPricingPackages());
    setShowNewModal(false);
    setNewName('');
  };

  const handleDeletePackage = (id: string) => {
    if (confirm('¿Deseas eliminar esta tarifa comercial?')) {
      OntologicalStore.deletePricingPackage(id);
      setPackages(OntologicalStore.getPricingPackages());
    }
  };

  // Calculations for current selected package
  const calcPackage = packages.find((p) => p.id === calcSelectedPackageId) || packages[0];
  const discountAmount =
    calcPaymentMethod === 'bre_b_nu'
      ? Math.round((calcPackage.basePriceCOP * calcPackage.brebNuDiscountPercent) / 100)
      : 0;
  const finalPrice = calcPackage.basePriceCOP - discountAmount;

  const handleCopyQuote = () => {
    const text = `
*PROPUESTA DE ACOMPAÑAMIENTO ONTOLÓGICO*
Rengifo Basto Consultoría Ontológica
John Fredy Rengifo Basto | Tel: +57 323 464 2257

Estimado/a ${calcClientName},
A continuación el desglose de tu inversión para el proceso de consultoría:

📦 *Programa:* ${calcPackage.name}
⏳ *Duración:* ${calcPackage.duration} (${calcPackage.sessionsCount} sesiones 1 a 1 de 60 min)
👤 *Enfoque:* ${calcPackage.targetAudience}

*Lo que incluye:*
${calcPackage.includes.map((i) => `• ${i}`).join('\n')}

💰 *Inversión Base:* $${calcPackage.basePriceCOP.toLocaleString('es-CO')} COP
${
  discountAmount > 0
    ? `🎁 *Descuento Bre-B Nu (${calcPackage.brebNuDiscountPercent}%):* -$${discountAmount.toLocaleString('es-CO')} COP\n✨ *Total a Invertir:* $${finalPrice.toLocaleString('es-CO')} COP`
    : `✨ *Total a Invertir:* $${finalPrice.toLocaleString('es-CO')} COP`
}

*Formas de Inversión habilitadas:*
- *Bre-B Nu:* Llave oficial: *@ASL775*
- *Efectivo:* En consultorio presencial (Crr 20bis # 65a-22)
- *Tarjeta / PSE:* https://checkout.wompi.co/l/raiz-y-balance-next-level
    `.trim();

    navigator.clipboard.writeText(text);
    setCopiedQuote(true);
    setTimeout(() => setCopiedQuote(false), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-[#141414] p-5 rounded-xl border border-gray-200 dark:border-neutral-800 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-lg">
              <Banknote className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Constructor de Valores, Tarifas & Finanzas
            </h2>
          </div>
          <p className="text-sm text-gray-600 dark:text-neutral-400 mt-1">
            Gestión de paquetes de consultoría ontológica, descuentos por Bre-B Nu (@ASL775) y validación contable.
          </p>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center gap-1.5 bg-gray-100 dark:bg-neutral-900 p-1.5 rounded-lg border border-gray-200 dark:border-neutral-800">
          <button
            onClick={() => setActiveTab('packages')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all flex items-center gap-1.5 ${
              activeTab === 'packages'
                ? 'bg-black text-white dark:bg-white dark:text-black shadow-xs'
                : 'text-gray-600 dark:text-neutral-400 hover:text-black dark:hover:text-white'
            }`}
          >
            <Banknote className="w-3.5 h-3.5" />
            Paquetes & Tarifas
          </button>
          <button
            onClick={() => setActiveTab('calculator')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all flex items-center gap-1.5 ${
              activeTab === 'calculator'
                ? 'bg-black text-white dark:bg-white dark:text-black shadow-xs'
                : 'text-gray-600 dark:text-neutral-400 hover:text-black dark:hover:text-white'
            }`}
          >
            <Calculator className="w-3.5 h-3.5" />
            Cotizador Rápido
          </button>
          <button
            onClick={() => setActiveTab('validation')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all flex items-center gap-1.5 ${
              activeTab === 'validation'
                ? 'bg-black text-white dark:bg-white dark:text-black shadow-xs'
                : 'text-gray-600 dark:text-neutral-400 hover:text-black dark:hover:text-white'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            Validación de Pagos
          </button>
        </div>
      </div>

      {/* Tab: Packages */}
      {activeTab === 'packages' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-700 dark:text-neutral-300">
              Catálogo de Servicios y Programas Ontológicos
            </h3>
            <button
              onClick={() => setShowNewModal(true)}
              className="px-3.5 py-1.5 bg-black text-white dark:bg-white dark:text-black rounded-lg text-xs font-semibold hover:opacity-90 transition-all flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              Nuevo Paquete
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {packages.map((pkg) => {
              const isEditing = editingPackageId === pkg.id;
              const discountCOP = Math.round((pkg.basePriceCOP * pkg.brebNuDiscountPercent) / 100);
              const priceWithDiscount = pkg.basePriceCOP - discountCOP;

              return (
                <div
                  key={pkg.id}
                  className="bg-white dark:bg-[#141414] p-5 rounded-xl border border-gray-200 dark:border-neutral-800 shadow-xs space-y-4 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                          {pkg.targetAudience}
                        </span>
                        <h4 className="text-base font-bold text-gray-900 dark:text-white">
                          {pkg.name}
                        </h4>
                      </div>

                      <div className="flex items-center gap-1">
                        {!isEditing && (
                          <button
                            onClick={() => handleStartEdit(pkg)}
                            className="p-1.5 text-gray-400 hover:text-black dark:hover:text-white rounded-md hover:bg-gray-100 dark:hover:bg-neutral-800"
                            title="Editar Tarifa"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDeletePackage(pkg.id)}
                          className="p-1.5 text-gray-400 hover:text-rose-500 rounded-md hover:bg-gray-100 dark:hover:bg-neutral-800"
                          title="Eliminar"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Price and Values Block */}
                    {isEditing ? (
                      <div className="p-3 bg-gray-50 dark:bg-neutral-900 rounded-lg space-y-2 border border-gray-200 dark:border-neutral-800 text-xs">
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-[10px] font-semibold text-gray-500">
                              Precio Base (COP):
                            </label>
                            <input
                              type="number"
                              value={editPrice}
                              onChange={(e) => setEditPrice(Number(e.target.value))}
                              className="w-full px-2 py-1 bg-white dark:bg-[#141414] border rounded text-xs"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] font-semibold text-gray-500">
                              % Desc Bre-B Nu:
                            </label>
                            <input
                              type="number"
                              value={editDiscount}
                              onChange={(e) => setEditDiscount(Number(e.target.value))}
                              className="w-full px-2 py-1 bg-white dark:bg-[#141414] border rounded text-xs"
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-[10px] font-semibold text-gray-500">Duración:</label>
                            <input
                              type="text"
                              value={editDuration}
                              onChange={(e) => setEditDuration(e.target.value)}
                              className="w-full px-2 py-1 bg-white dark:bg-[#141414] border rounded text-xs"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] font-semibold text-gray-500">Sesiones:</label>
                            <input
                              type="number"
                              value={editSessionsCount}
                              onChange={(e) => setEditSessionsCount(Number(e.target.value))}
                              className="w-full px-2 py-1 bg-white dark:bg-[#141414] border rounded text-xs"
                            />
                          </div>
                        </div>
                        <div className="flex justify-end gap-2 pt-1">
                          <button
                            onClick={() => setEditingPackageId(null)}
                            className="px-2.5 py-1 text-xs text-gray-500 hover:text-black"
                          >
                            Cancelar
                          </button>
                          <button
                            onClick={() => handleSaveEdit(pkg.id)}
                            className="px-3 py-1 bg-black text-white dark:bg-white dark:text-black rounded text-xs font-semibold"
                          >
                            Guardar
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="p-3 bg-gray-50 dark:bg-neutral-900/60 rounded-lg border border-gray-100 dark:border-neutral-800/80 flex items-center justify-between">
                        <div>
                          <span className="text-[11px] text-gray-500 dark:text-neutral-400 block">
                            Inversión Oficial:
                          </span>
                          <span className="text-xl font-bold text-gray-900 dark:text-white">
                            ${pkg.basePriceCOP.toLocaleString('es-CO')} COP
                          </span>
                        </div>

                        {pkg.brebNuDiscountPercent > 0 && (
                          <div className="text-right">
                            <span className="text-[10px] px-2 py-0.5 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 rounded font-semibold">
                              {pkg.brebNuDiscountPercent}% OFF Bre-B Nu
                            </span>
                            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 block mt-0.5">
                              ${priceWithDiscount.toLocaleString('es-CO')} COP
                            </span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Includes List */}
                    <div className="space-y-1 pt-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-neutral-400">
                        Entregables y Metodología:
                      </span>
                      <ul className="space-y-1">
                        {pkg.includes.map((inc, i) => (
                          <li
                            key={i}
                            className="text-xs text-gray-700 dark:text-neutral-300 flex items-start gap-1.5"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                            <span>{inc}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Footer Meta */}
                  <div className="pt-3 border-t border-gray-100 dark:border-neutral-800/80 flex items-center justify-between text-xs text-gray-500 dark:text-neutral-400">
                    <span>
                      Duración: <strong className="text-gray-900 dark:text-white">{pkg.duration}</strong>
                    </span>
                    <span>
                      Sesiones: <strong className="text-gray-900 dark:text-white">{pkg.sessionsCount}</strong>
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab: Quick Calculator */}
      {activeTab === 'calculator' && (
        <div className="bg-white dark:bg-[#141414] p-6 rounded-xl border border-gray-200 dark:border-neutral-800 shadow-xs space-y-6">
          <div className="border-b border-gray-100 dark:border-neutral-800 pb-3">
            <h3 className="text-base font-bold text-gray-900 dark:text-white">
              Cotizador & Propuestas Ejecutivas
            </h3>
            <p className="text-xs text-gray-500 dark:text-neutral-400">
              Genera presupuestos claros para coachees directivos con descuentos automáticos y llave Bre-B Nu.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Input Config */}
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-700 dark:text-neutral-300">
                  Nombre del Coachee / Empresa:
                </label>
                <input
                  type="text"
                  value={calcClientName}
                  onChange={(e) => setCalcClientName(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-lg text-xs text-gray-900 dark:text-white focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-700 dark:text-neutral-300">
                  Paquete Seleccionado:
                </label>
                <select
                  value={calcSelectedPackageId}
                  onChange={(e) => setCalcSelectedPackageId(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-lg text-xs text-gray-900 dark:text-white focus:outline-none"
                >
                  {packages.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} - ${p.basePriceCOP.toLocaleString('es-CO')} COP
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-700 dark:text-neutral-300">
                  Modalidad de Pago:
                </label>
                <div className="space-y-1.5">
                  <label className="flex items-center gap-2 p-2.5 rounded-lg border border-gray-200 dark:border-neutral-800 bg-gray-50 dark:bg-neutral-900/60 cursor-pointer text-xs">
                    <input
                      type="radio"
                      name="calcPay"
                      checked={calcPaymentMethod === 'bre_b_nu'}
                      onChange={() => setCalcPaymentMethod('bre_b_nu')}
                      className="accent-black dark:accent-white"
                    />
                    <div>
                      <strong className="block text-gray-900 dark:text-white">
                        Bre-B Nu (Llave @ASL775)
                      </strong>
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
                        Aplica descuento especial del {calcPackage.brebNuDiscountPercent}%
                      </span>
                    </div>
                  </label>

                  <label className="flex items-center gap-2 p-2.5 rounded-lg border border-gray-200 dark:border-neutral-800 bg-gray-50 dark:bg-neutral-900/60 cursor-pointer text-xs">
                    <input
                      type="radio"
                      name="calcPay"
                      checked={calcPaymentMethod === 'efectivo'}
                      onChange={() => setCalcPaymentMethod('efectivo')}
                      className="accent-black dark:accent-white"
                    />
                    <div>
                      <strong className="block text-gray-900 dark:text-white">
                        Efectivo en Consultorio
                      </strong>
                      <span className="text-[10px] text-gray-500">Presencial en Bogotá</span>
                    </div>
                  </label>

                  <label className="flex items-center gap-2 p-2.5 rounded-lg border border-gray-200 dark:border-neutral-800 bg-gray-50 dark:bg-neutral-900/60 cursor-pointer text-xs">
                    <input
                      type="radio"
                      name="calcPay"
                      checked={calcPaymentMethod === 'wompi'}
                      onChange={() => setCalcPaymentMethod('wompi')}
                      className="accent-black dark:accent-white"
                    />
                    <div>
                      <strong className="block text-gray-900 dark:text-white">
                        Tarjeta de Crédito / PSE (Wompi)
                      </strong>
                      <span className="text-[10px] text-gray-500">Pasarela segura Bancolombia</span>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            {/* Output Presentation */}
            <div className="md:col-span-2 bg-gray-50 dark:bg-neutral-900/60 p-5 rounded-xl border border-gray-200 dark:border-neutral-800 space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-gray-200 dark:border-neutral-800 pb-3">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                      Resumen de Cotización
                    </span>
                    <h4 className="text-lg font-bold text-gray-900 dark:text-white">
                      {calcPackage.name}
                    </h4>
                  </div>
                  <span className="text-xs px-2.5 py-1 bg-gray-200 dark:bg-neutral-800 text-gray-800 dark:text-neutral-200 rounded font-medium">
                    {calcPackage.duration}
                  </span>
                </div>

                <div className="space-y-1.5 text-xs text-gray-700 dark:text-neutral-300">
                  <div className="flex justify-between py-1">
                    <span>Inversión Bruta:</span>
                    <strong className="text-gray-900 dark:text-white">
                      ${calcPackage.basePriceCOP.toLocaleString('es-CO')} COP
                    </strong>
                  </div>

                  {discountAmount > 0 && (
                    <div className="flex justify-between py-1 text-emerald-600 dark:text-emerald-400">
                      <span>Descuento Bre-B Nu ({calcPackage.brebNuDiscountPercent}%):</span>
                      <strong>-${discountAmount.toLocaleString('es-CO')} COP</strong>
                    </div>
                  )}

                  <div className="flex justify-between py-2 border-t border-gray-200 dark:border-neutral-800 text-base font-bold text-gray-900 dark:text-white">
                    <span>Total a Invertir:</span>
                    <span className="text-emerald-600 dark:text-emerald-400">
                      ${finalPrice.toLocaleString('es-CO')} COP
                    </span>
                  </div>
                </div>

                <div className="p-3 bg-white dark:bg-[#141414] rounded-lg border border-gray-200 dark:border-neutral-800 text-[11px] text-gray-600 dark:text-neutral-400 space-y-1">
                  <p className="font-semibold text-gray-800 dark:text-neutral-200">
                    Datos para la consignación:
                  </p>
                  <p>• Llave Bre-B Nu: <strong>@ASL775</strong></p>
                  <p>• Consultoría: <strong>Rengifo Basto Consultoría Ontológica</strong></p>
                  <p>• Notificación inmediata: <strong>WhatsApp +57 323 464 2257</strong></p>
                </div>
              </div>

              <div className="pt-3 flex justify-end">
                <button
                  onClick={handleCopyQuote}
                  className="px-4 py-2 bg-black text-white dark:bg-white dark:text-black text-xs font-semibold rounded-lg hover:opacity-90 transition-all flex items-center gap-1.5 shadow-xs"
                >
                  <Copy className="w-3.5 h-3.5" />
                  {copiedQuote ? '¡Cotización Copiada!' : 'Copiar Propuesta para WhatsApp'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Validation (re-uses existing robust PaymentValidationManager) */}
      {activeTab === 'validation' && <PaymentValidationManager />}

      {/* Modal: New Package */}
      {showNewModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#141414] w-full max-w-md rounded-xl p-6 border border-gray-200 dark:border-neutral-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3 border-gray-100 dark:border-neutral-800">
              <h3 className="font-bold text-sm text-gray-900 dark:text-white">
                Crear Nuevo Paquete o Tarifa
              </h3>
              <button
                onClick={() => setShowNewModal(false)}
                className="text-gray-400 hover:text-black"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-gray-700 dark:text-neutral-300">
                  Nombre del Programa:
                </label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Ej: Taller Ejecutivo de Quiebres Directivos"
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-neutral-900 border rounded mt-1 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-gray-700 dark:text-neutral-300">
                    Precio (COP):
                  </label>
                  <input
                    type="number"
                    value={newPrice}
                    onChange={(e) => setNewPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-neutral-900 border rounded mt-1 text-xs"
                  />
                </div>
                <div>
                  <label className="font-semibold text-gray-700 dark:text-neutral-300">
                    Sesiones:
                  </label>
                  <input
                    type="number"
                    value={newSessions}
                    onChange={(e) => setNewSessions(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-neutral-900 border rounded mt-1 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-gray-700 dark:text-neutral-300">
                    Duración:
                  </label>
                  <input
                    type="text"
                    value={newDuration}
                    onChange={(e) => setNewDuration(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-neutral-900 border rounded mt-1 text-xs"
                  />
                </div>
                <div>
                  <label className="font-semibold text-gray-700 dark:text-neutral-300">
                    Audiencia:
                  </label>
                  <input
                    type="text"
                    value={newAudience}
                    onChange={(e) => setNewAudience(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-neutral-900 border rounded mt-1 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-gray-700 dark:text-neutral-300">
                  Qué incluye (1 ítem por línea):
                </label>
                <textarea
                  rows={3}
                  value={newIncludes}
                  onChange={(e) => setNewIncludes(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-neutral-900 border rounded mt-1 text-xs"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-gray-100 dark:border-neutral-800">
              <button
                onClick={() => setShowNewModal(false)}
                className="px-3 py-1.5 text-xs text-gray-500 hover:text-black"
              >
                Cancelar
              </button>
              <button
                onClick={handleCreatePackage}
                className="px-4 py-1.5 bg-black text-white dark:bg-white dark:text-black rounded text-xs font-semibold"
              >
                Crear Paquete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
