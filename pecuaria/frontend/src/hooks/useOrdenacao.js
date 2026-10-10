import { useMemo, useState } from 'react';

function vazio(valor) {
  return valor === null || valor === undefined || valor === '';
}

function comparar(a, b) {
  if (typeof a === 'number' && typeof b === 'number') return a - b;
  if (typeof a === 'boolean' && typeof b === 'boolean') return a === b ? 0 : a ? -1 : 1;
  // numeric: true faz o brinco "2" vir antes do "10"; datas AAAA-MM-DD ordenam como texto
  return String(a).localeCompare(String(b), 'pt-BR', { numeric: true, sensitivity: 'base' });
}

/**
 * Ordena uma listagem ao clicar no cabeçalho das colunas.
 * Cada clique na mesma coluna alterna: crescente → decrescente → ordem original.
 *
 *   const { ordenados, cabecalho } = useOrdenacao(registros);
 *   <ThOrdenavel {...cabecalho('data')}>Data</ThOrdenavel>
 *   {ordenados.map(...)}
 */
export function useOrdenacao(itens) {
  const [ordenacao, setOrdenacao] = useState({ coluna: null, direcao: null });

  const ordenados = useMemo(() => {
    const { coluna, direcao } = ordenacao;
    if (!coluna) return itens;

    const sinal = direcao === 'asc' ? 1 : -1;
    return [...itens].sort((x, y) => {
      const a = x[coluna];
      const b = y[coluna];
      // Campos vazios sempre no fim da lista, nas duas direções
      if (vazio(a) && vazio(b)) return 0;
      if (vazio(a)) return 1;
      if (vazio(b)) return -1;
      return comparar(a, b) * sinal;
    });
  }, [itens, ordenacao]);

  function alternar(coluna) {
    setOrdenacao((atual) => {
      if (atual.coluna !== coluna) return { coluna, direcao: 'asc' };
      if (atual.direcao === 'asc') return { coluna, direcao: 'desc' };
      return { coluna: null, direcao: null };
    });
  }

  function cabecalho(coluna) {
    return {
      direcao: ordenacao.coluna === coluna ? ordenacao.direcao : null,
      onClick: () => alternar(coluna),
    };
  }

  return { ordenados, cabecalho };
}
