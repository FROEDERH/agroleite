import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import RotaProtegida from './components/RotaProtegida';

import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import LactacaoGalpao from './pages/LactacaoGalpao';
import Animais from './pages/Animais';
import ProducaoLeite from './pages/ProducaoLeite';
import Reproducao from './pages/Reproducao';
import VendasAnimais from './pages/VendasAnimais';
import EstoqueRacao from './pages/EstoqueRacao';
import EstoqueFeno from './pages/EstoqueFeno';
import EstoqueSilagem from './pages/EstoqueSilagem';
import Despesas from './pages/Despesas';
import Receitas from './pages/Receitas';
import Propriedade from './pages/Propriedade';
import Usuarios from './pages/Usuarios';

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route
        path="/"
        element={
          <RotaProtegida>
            <Layout />
          </RotaProtegida>
        }
      >
        <Route index element={<LactacaoGalpao />} />
        <Route path="financeiro" element={<Dashboard />} />
        <Route path="animais" element={<Animais />} />
        <Route path="producao-leite" element={<ProducaoLeite />} />
        <Route path="reproducao" element={<Reproducao />} />
        <Route path="venda-animais" element={<VendasAnimais />} />
        <Route path="estoque-racao" element={<EstoqueRacao />} />
        <Route path="estoque-feno" element={<EstoqueFeno />} />
        <Route path="estoque-silagem" element={<EstoqueSilagem />} />
        <Route path="despesas" element={<Despesas />} />
        <Route path="receitas" element={<Receitas />} />
        <Route path="propriedade" element={<Propriedade />} />
        <Route
          path="usuarios"
          element={
            <RotaProtegida somenteAdmin>
              <Usuarios />
            </RotaProtegida>
          }
        />
      </Route>
    </Routes>
  );
}
