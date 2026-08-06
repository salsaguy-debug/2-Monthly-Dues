import React, { useState, useEffect } from 'react';
import { X, UserCheck, Trash2, Save, Mail, User, Phone, AlertTriangle } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface EditPerformerModalProps {
  isOpen: boolean;
  onClose: () => void;
  performer: { name: string; email: string; phone?: string } | null;
  onSave: (oldEmail: string, updated: { name: string; email: string; phone?: string }) => void;
  onDelete?: (email: string) => void;
}

export const EditPerformerModal: React.FC<EditPerformerModalProps> = ({
  isOpen,
  onClose,
  performer,
  onSave,
  onDelete
}) => {
  const { language } = useLanguage();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

  useEffect(() => {
    if (performer) {
      setName(performer.name || '');
      setEmail(performer.email || '');
      setPhone(performer.phone || '');
      setIsConfirmingDelete(false);
    }
  }, [performer]);

  if (!isOpen || !performer) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;

    onSave(performer.email, {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim()
    });
    onClose();
  };

  const handleConfirmDelete = () => {
    if (onDelete && performer) {
      onDelete(performer.email);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-6 max-w-md w-full border border-slate-200 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-all cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2.5 mb-4">
          <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-slate-800">
              {language === 'es' ? 'Editar Información de Integrante' : 'Edit Performer Information'}
            </h3>
            <p className="text-xs text-slate-500">
              {language === 'es' ? 'Corrija el nombre, correo o número de contacto.' : 'Update or correct name, email, or contact number.'}
            </p>
          </div>
        </div>

        {isConfirmingDelete ? (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl mb-4 space-y-3">
            <div className="flex items-center gap-2 text-rose-800 font-bold text-xs">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>
                {language === 'es'
                  ? `¿Confirmar eliminación de ${performer.name}?`
                  : `Confirm deletion of ${performer.name}?`}
              </span>
            </div>
            <p className="text-[11px] text-rose-700">
              {language === 'es'
                ? 'Esta acción eliminará al integrante del elenco activo. Esta acción no se puede deshacer.'
                : 'This will remove the performer from the active roster. This action cannot be undone.'}
            </p>
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-rose-200/60">
              <button
                type="button"
                onClick={() => setIsConfirmingDelete(false)}
                className="px-3 py-1.5 text-xs font-bold text-slate-700 bg-white hover:bg-slate-100 rounded-xl border border-slate-200 transition-all cursor-pointer"
              >
                {language === 'es' ? 'Cancelar' : 'Cancel'}
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-3.5 py-1.5 text-xs font-black text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{language === 'es' ? 'Sí, Eliminar' : 'Yes, Delete'}</span>
              </button>
            </div>
          </div>
        ) : null}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-extrabold uppercase text-slate-600 mb-1 flex items-center gap-1">
              <User className="w-3.5 h-3.5 text-indigo-600" />
              {language === 'es' ? 'Nombre del Integrante' : 'Performer Full Name'}
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Mateo Silva"
              className="w-full p-2.5 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-extrabold uppercase text-slate-600 mb-1 flex items-center gap-1">
              <Mail className="w-3.5 h-3.5 text-indigo-600" />
              {language === 'es' ? 'Correo Electrónico (Email)' : 'Email Address'}
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="e.g. mateo.silva@gmail.com"
              className="w-full p-2.5 text-xs font-mono font-semibold bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-extrabold uppercase text-slate-600 mb-1 flex items-center gap-1">
              <Phone className="w-3.5 h-3.5 text-indigo-600" />
              {language === 'es' ? 'Teléfono / Notas de Contacto' : 'Phone / Contact Notes'}
            </label>
            <input
              type="text"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              placeholder="e.g. 804-555-0199"
              className="w-full p-2.5 text-xs font-mono bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
            />
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-100 mt-6">
            {onDelete && !isConfirmingDelete ? (
              <button
                type="button"
                onClick={() => setIsConfirmingDelete(true)}
                className="px-3.5 py-2 text-xs font-extrabold text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-xl transition-all border border-rose-200 flex items-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{language === 'es' ? 'Eliminar' : 'Delete'}</span>
              </button>
            ) : <div />}

            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all cursor-pointer"
              >
                {language === 'es' ? 'Cancelar' : 'Cancel'}
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-extrabold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{language === 'es' ? 'Guardar Cambios' : 'Save Changes'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
