import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Check, ChevronDown, Search, X } from 'lucide-react';

function normalizar(texto) {
  return String(texto ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
}

function useTelaPequena() {
  const consulta = '(max-width: 639px)';
  const [pequena, setPequena] = useState(() => window.matchMedia(consulta).matches);
  useEffect(() => {
    const mq = window.matchMedia(consulta);
    const atualizar = () => setPequena(mq.matches);
    mq.addEventListener('change', atualizar);
    return () => mq.removeEventListener('change', atualizar);
  }, []);
  return pequena;
}

/**
 * Substitui o <select> quando a lista é grande: abre uma lista com busca.
 * No celular abre como painel de baixo para cima; no computador, abaixo do campo.
 *
 * - opcoes: lista de objetos com `id`
 * - titulo(op) / subtitulo(op): textos de cada linha; textoBusca(op): onde a busca procura
 * - value / onChange(id): id como string ('' = nada selecionado), igual ao <select>
 * - opcaoVazia: texto de uma opção para limpar a seleção (ex: "Não informado")
 */
export default function SeletorBusca({
  label, value, onChange, opcoes, titulo, subtitulo, textoBusca,
  placeholder = 'Selecione...', tituloPainel = 'Selecionar', placeholderBusca = 'Buscar...',
  textoNenhum = 'Nenhum resultado encontrado', opcaoVazia, required, disabled, className = '',
}) {
  const [aberto, setAberto] = useState(false);
  const [busca, setBusca] = useState('');
  const [destaque, setDestaque] = useState(0);
  const [posicao, setPosicao] = useState(null);
  const campoRef = useRef(null);
  const buscaRef = useRef(null);
  const listaRef = useRef(null);
  const obrigatorioRef = useRef(null);
  const telaPequena = useTelaPequena();

  const selecionada = opcoes.find((op) => String(op.id) === String(value));

  const itens = useMemo(() => {
    const termo = normalizar(busca.trim());
    const filtradas = termo
      ? opcoes.filter((op) => normalizar(textoBusca ? textoBusca(op) : titulo(op)).includes(termo))
      : opcoes;
    const lista = filtradas.map((op) => ({ id: String(op.id), op }));
    return opcaoVazia && !termo ? [{ id: '', op: null }, ...lista] : lista;
  }, [busca, opcoes, opcaoVazia, textoBusca, titulo]);

  function abrir() {
    if (disabled) return;
    setBusca('');
    const ids = opcoes.map((op) => String(op.id));
    setDestaque(Math.max(0, (opcaoVazia ? ['', ...ids] : ids).indexOf(String(value ?? ''))));
    setAberto(true);
  }

  function escolher(id) {
    onChange(id);
    setAberto(false);
    campoRef.current?.focus();
  }

  // No computador, a lista abre logo abaixo do campo (ou acima, se não couber)
  useLayoutEffect(() => {
    if (!aberto || telaPequena) return;
    function posicionar() {
      const r = campoRef.current.getBoundingClientRect();
      const espacoAbaixo = window.innerHeight - r.bottom - 12;
      const espacoAcima = r.top - 12;
      const paraCima = espacoAbaixo < 260 && espacoAcima > espacoAbaixo;
      const altura = Math.min(360, paraCima ? espacoAcima : espacoAbaixo);
      setPosicao({
        left: r.left,
        width: r.width,
        maxHeight: altura,
        ...(paraCima ? { bottom: window.innerHeight - r.top + 4 } : { top: r.bottom + 4 }),
      });
    }
    posicionar();
    window.addEventListener('resize', posicionar);
    window.addEventListener('scroll', posicionar, true);
    return () => {
      window.removeEventListener('resize', posicionar);
      window.removeEventListener('scroll', posicionar, true);
    };
  }, [aberto, telaPequena]);

  useEffect(() => {
    if (aberto) buscaRef.current?.focus();
  }, [aberto]);

  useEffect(() => {
    obrigatorioRef.current?.setCustomValidity(value ? '' : 'Selecione um item da lista.');
  }, [value]);

  useEffect(() => {
    listaRef.current?.querySelector(`[data-indice="${destaque}"]`)?.scrollIntoView({ block: 'nearest' });
  }, [destaque]);

  function teclado(e) {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setDestaque((d) => Math.min(d + 1, itens.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setDestaque((d) => Math.max(d - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (itens[destaque]) escolher(itens[destaque].id);
    } else if (e.key === 'Escape') {
      e.stopPropagation();
      setAberto(false);
      campoRef.current?.focus();
    }
  }

  const painel = aberto && (telaPequena || posicao) && createPortal(
    <div
      className={`fixed inset-0 z-[60] ${telaPequena ? 'bg-black/50 flex items-end' : ''}`}
      onClick={(e) => { if (e.target === e.currentTarget) setAberto(false); }}
    >
      <div
        role="dialog"
        aria-label={tituloPainel}
        className={telaPequena
          ? 'bg-white w-full h-[85vh] supports-[height:100dvh]:h-[85dvh] rounded-t-2xl shadow-xl flex flex-col'
          : 'fixed bg-white rounded-xl shadow-xl border border-gray-200 flex flex-col overflow-hidden'}
        style={telaPequena ? undefined : posicao}
      >
        {telaPequena && (
          <div className="flex items-center justify-between px-4 pt-4 pb-2">
            <h3 className="font-semibold text-gray-800">{tituloPainel}</h3>
            <button type="button" onClick={() => setAberto(false)} className="p-2 -mr-2 text-gray-400 hover:text-gray-600 rounded-lg" aria-label="Fechar">
              <X className="w-5 h-5" />
            </button>
          </div>
        )}
        <div className={telaPequena ? 'px-4 pb-3' : 'p-2 border-b border-gray-100'}>
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              ref={buscaRef}
              type="search"
              value={busca}
              onChange={(e) => { setBusca(e.target.value); setDestaque(0); }}
              onKeyDown={teclado}
              placeholder={placeholderBusca}
              autoComplete="off"
              className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-300 text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-verde-400 focus:border-verde-400"
            />
          </div>
        </div>
        <ul ref={listaRef} role="listbox" className="flex-1 overflow-y-auto overscroll-contain">
          {itens.length === 0 && (
            <li className="px-4 py-6 text-center text-sm text-gray-400">{textoNenhum}</li>
          )}
          {itens.map(({ id, op }, i) => {
            const marcado = id === String(value ?? '');
            return (
              <li
                key={id || 'vazio'}
                data-indice={i}
                role="option"
                aria-selected={marcado}
                onMouseMove={() => setDestaque(i)}
                onClick={() => escolher(id)}
                className={`flex items-center gap-3 px-4 cursor-pointer border-b border-gray-50 last:border-b-0
                  ${telaPequena ? 'py-3' : 'py-2'} ${(telaPequena ? marcado : i === destaque) ? 'bg-verde-50' : ''}`}
              >
                <div className="flex-1 min-w-0">
                  {op ? (
                    <>
                      <div className="text-sm text-gray-800 truncate">{titulo(op)}</div>
                      {subtitulo && <div className="text-xs text-gray-500 truncate">{subtitulo(op)}</div>}
                    </>
                  ) : (
                    <div className="text-sm text-gray-500 italic">{opcaoVazia}</div>
                  )}
                </div>
                {marcado && <Check className="w-4 h-4 text-verde-600 shrink-0" />}
              </li>
            );
          })}
        </ul>
      </div>
    </div>,
    document.body
  );

  return (
    <div className={className}>
      {label && <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>}
      <div className="relative">
        <button
          ref={campoRef}
          type="button"
          onClick={abrir}
          onKeyDown={(e) => { if (e.key === 'ArrowDown') { e.preventDefault(); abrir(); } }}
          disabled={disabled}
          aria-haspopup="listbox"
          aria-expanded={aberto}
          className="w-full flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm text-left bg-white transition-shadow focus:outline-none focus:ring-2 focus:ring-verde-400 focus:border-verde-400 disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed"
        >
          <span className={`flex-1 truncate ${selecionada ? '' : 'text-gray-400'}`}>
            {selecionada ? titulo(selecionada) : (value === '' && opcaoVazia) ? opcaoVazia : placeholder}
          </span>
          <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />
        </button>
        {/* Mantém a validação "required" do formulário funcionando */}
        {required && (
          <input
            ref={obrigatorioRef}
            tabIndex={-1}
            aria-hidden="true"
            required
            value={value ?? ''}
            onChange={() => {}}
            className="absolute inset-0 opacity-0 pointer-events-none"
          />
        )}
      </div>
      {painel}
    </div>
  );
}

const tituloAnimal = (a) => `${a.numeroBrinco}${a.nome ? ` - ${a.nome}` : ''}`;
const subtituloAnimal = (a) => [a.raca, a.categoria].filter(Boolean).join(' · ');

// Seletor de animal: busca por brinco ou nome; mostra raça e categoria embaixo
export function SeletorAnimal(props) {
  return (
    <SeletorBusca
      titulo={tituloAnimal}
      subtitulo={subtituloAnimal}
      textoBusca={tituloAnimal}
      tituloPainel="Selecionar animal"
      placeholderBusca="Buscar por brinco ou nome"
      textoNenhum="Nenhum animal encontrado"
      {...props}
      opcoes={props.animais}
    />
  );
}
