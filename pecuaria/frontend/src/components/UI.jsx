import { X, ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react';

export function Card({ children, className = '' }) {
  return (
    <div className={`bg-white rounded-2xl shadow-sm border border-black/5 ${className}`}>
      {children}
    </div>
  );
}

export function StatCard({ icon: Icon, label, value, sublabel, color = 'verde' }) {
  const colors = {
    verde: 'bg-verde-50 text-verde-700',
    terra: 'bg-terra-50 text-terra-700',
    azul: 'bg-blue-50 text-blue-700',
    vermelho: 'bg-red-50 text-red-700',
    amarelo: 'bg-amber-50 text-amber-700',
  };

  return (
    <Card className="p-5 flex items-start gap-4">
      <div className={`rounded-xl p-3 ${colors[color]}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="min-w-0">
        <p className="text-sm text-gray-500 font-medium">{label}</p>
        <p className="text-2xl font-bold text-gray-800 mt-0.5 truncate">{value}</p>
        {sublabel && <p className="text-xs text-gray-400 mt-0.5">{sublabel}</p>}
      </div>
    </Card>
  );
}

export function Button({ children, variant = 'primary', className = '', ...props }) {
  const variants = {
    primary: 'bg-verde-600 hover:bg-verde-700 text-white shadow-sm',
    secondary: 'bg-gray-100 hover:bg-gray-200 text-gray-700',
    danger: 'bg-red-50 hover:bg-red-100 text-red-600',
    outline: 'border border-gray-300 hover:bg-gray-50 text-gray-700',
    ghost: 'hover:bg-gray-100 text-gray-600',
  };

  return (
    <button
      className={`inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export function Input({ label, error, className = '', ...props }) {
  return (
    <div className={className}>
      {label && <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>}
      <input
        className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-verde-400 focus:border-verde-400 transition-shadow"
        {...props}
      />
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
}

export function Select({ label, error, children, className = '', ...props }) {
  return (
    <div className={className}>
      {label && <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>}
      <select
        className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-verde-400 focus:border-verde-400 bg-white transition-shadow"
        {...props}
      >
        {children}
      </select>
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
}

export function Textarea({ label, error, className = '', ...props }) {
  return (
    <div className={className}>
      {label && <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>}
      <textarea
        className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-verde-400 focus:border-verde-400 transition-shadow"
        rows={3}
        {...props}
      />
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
}

export function Badge({ children, color = 'verde' }) {
  const colors = {
    verde: 'bg-verde-100 text-verde-700',
    terra: 'bg-terra-100 text-terra-700',
    vermelho: 'bg-red-100 text-red-700',
    amarelo: 'bg-amber-100 text-amber-700',
    azul: 'bg-blue-100 text-blue-700',
    cinza: 'bg-gray-100 text-gray-600',
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${colors[color]}`}>
      {children}
    </span>
  );
}

export function Modal({ open, onClose, title, children, maxWidth = 'max-w-lg' }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={onClose}>
      <div
        className={`bg-white rounded-2xl shadow-xl w-full ${maxWidth} max-h-[90vh] overflow-y-auto`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white rounded-t-2xl">
          <h3 className="font-semibold text-lg text-gray-800">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

export function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      {Icon && <Icon className="w-12 h-12 text-gray-300 mb-3" />}
      <h3 className="font-semibold text-gray-700">{title}</h3>
      {description && <p className="text-sm text-gray-400 mt-1 max-w-sm">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

// Cabeçalho de coluna clicável; usar com o hook useOrdenacao
export function ThOrdenavel({ direcao, onClick, children, className = '' }) {
  const Icone = direcao === 'asc' ? ChevronUp : direcao === 'desc' ? ChevronDown : ChevronsUpDown;
  const ariaSort = direcao === 'asc' ? 'ascending' : direcao === 'desc' ? 'descending' : 'none';

  return (
    <th className={className} aria-sort={ariaSort}>
      <button
        type="button"
        onClick={onClick}
        className={`inline-flex items-center gap-1 select-none hover:text-gray-800 ${direcao ? 'text-gray-800' : ''}`}
      >
        {children}
        <Icone className={`w-3.5 h-3.5 shrink-0 ${direcao ? 'text-verde-700' : 'text-gray-300'}`} />
      </button>
    </th>
  );
}

// Fica preso no topo ao rolar a página, para os botões de cadastro continuarem
// à mão em listas longas. No celular, fica logo abaixo da barra verde (top-12)
// e esconde o subtítulo para ocupar menos espaço.
export function PageHeader({ title, subtitle, action }) {
  return (
    <div className="sticky top-12 lg:top-0 z-10 bg-leite-200 -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 -mt-3 py-3 mb-3 flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
      <div className="min-w-0">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800">{title}</h1>
        {subtitle && <p className="hidden sm:block text-gray-500 text-sm mt-1">{subtitle}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}

export function ConfirmDialog({ open, onClose, onConfirm, title, message, danger = true }) {
  if (!open) return null;
  return (
    <Modal open={open} onClose={onClose} title={title} maxWidth="max-w-sm">
      <p className="text-gray-600 text-sm mb-6">{message}</p>
      <div className="flex justify-end gap-3">
        <Button variant="outline" onClick={onClose}>Cancelar</Button>
        <Button variant={danger ? 'danger' : 'primary'} onClick={onConfirm}>
          {danger ? 'Excluir' : 'Confirmar'}
        </Button>
      </div>
    </Modal>
  );
}
