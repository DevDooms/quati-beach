import { useState } from 'react'
import { QUADRAS, ehQuadraId, type QuadraId } from '../../../config/estabelecimento'
import { useDB } from '../../../lib/banco'
import { DIAS_SEMANA, ORDEM_DIAS, fmtFaixa, hojeISO } from '../../../lib/datas'
import { mascaraTelefone } from '../../../lib/formatos'
import { esquemaNome, valido } from '../../../lib/validacao'
import type { DiaSemana } from '../../../tipos'
import { Aviso, Botao, Campo, Entrada, Janela, Selecao } from '../../../ui'
import { aulaNoHorario } from '../../reservas/agenda'
import { SEMANAS_FIXO, conflitoDeFixo, criarHorarioFixo, reservasDoFixo } from '../regras'

export function JanelaNovoFixo({ onFechar }: { onFechar: () => void }) {
  const { db, set } = useDB()
  const [f, setF] = useState({ nome: '', telefone: '', diaSemana: 2 as DiaSemana, hora: 20, quadraId: QUADRAS[0].id as QuadraId })
  const [abre, fecha] = db.funcionamento[f.diaSemana]
  const horas = Array.from({ length: fecha - abre }, (_, i) => abre + i)

  const conflitoFixo = conflitoDeFixo(db, f)
  const conflitoAula = !!aulaNoHorario(db, f.diaSemana, f.hora, f.quadraId)
  const dados = { ...f, desde: hojeISO(), origem: 'Balcão' as const }
  const semanasLivres = conflitoFixo || conflitoAula ? 0 : reservasDoFixo(db, { ...dados, id: '' }, new Date()).length
  const pode = valido(esquemaNome, f.nome) && semanasLivres > 0 && horas.includes(f.hora)

  return (
    <Janela onFechar={onFechar} titulo="Novo horário fixo" largura="sm:max-w-lg">
      <div className="grid grid-cols-2 gap-3">
        <Campo rotulo="Nome do grupo / responsável" compacto className="col-span-2">
          <Entrada compacto value={f.nome} onChange={(e) => setF({ ...f, nome: e.target.value })} />
        </Campo>
        <Campo rotulo="WhatsApp" compacto className="col-span-2">
          <Entrada compacto value={f.telefone} onChange={(e) => setF({ ...f, telefone: mascaraTelefone(e.target.value) })} inputMode="tel" />
        </Campo>
        <Campo rotulo="Dia" compacto>
          <Selecao compacto value={f.diaSemana} onChange={(e) => setF({ ...f, diaSemana: Number(e.target.value) as DiaSemana })}>
            {ORDEM_DIAS.map((d) => <option key={d} value={d}>{DIAS_SEMANA[d]}</option>)}
          </Selecao>
        </Campo>
        <Campo rotulo="Horário" compacto>
          <Selecao compacto value={f.hora} onChange={(e) => setF({ ...f, hora: Number(e.target.value) })}>
            {horas.map((h) => <option key={h} value={h}>{fmtFaixa(h)}</option>)}
          </Selecao>
        </Campo>
        <Campo rotulo="Quadra" compacto className="col-span-2">
          <Selecao compacto value={f.quadraId} onChange={(e) => ehQuadraId(e.target.value) && setF({ ...f, quadraId: e.target.value })}>
            {QUADRAS.map((q) => <option key={q.id} value={q.id}>{q.nome}</option>)}
          </Selecao>
        </Campo>
      </div>

      <div className="mt-4">
        <Aviso tom={semanasLivres > 0 ? 'info' : 'alerta'}>
          {conflitoFixo
            ? 'Já existe um mensalista nesse dia, horário e quadra.'
            : conflitoAula
              ? 'Esse horário tem aula toda semana nessa quadra.'
              : `Vai reservar ${semanasLivres} das próximas ${SEMANAS_FIXO} semanas${semanasLivres < SEMANAS_FIXO ? ' (algumas já estavam ocupadas)' : ''}.`}
        </Aviso>
      </div>

      <div className="mt-5 flex justify-end gap-2">
        <Botao variante="secundario" onClick={onFechar}>Cancelar</Botao>
        <Botao
          disabled={!pode}
          onClick={() => {
            set((db) => criarHorarioFixo(db, dados))
            onFechar()
          }}
        >
          Criar horário fixo
        </Botao>
      </div>
    </Janela>
  )
}
