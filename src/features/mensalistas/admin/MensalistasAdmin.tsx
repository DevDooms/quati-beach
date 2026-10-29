import { useState } from 'react'
import { Plus, Repeat } from 'lucide-react'
import { quadraPorId } from '../../../config/estabelecimento'
import { useOcultarValores } from '../../../admin/useOcultarValores'
import { useDB } from '../../../lib/banco'
import { DIAS_SEMANA, ORDEM_DIAS, dataDeISO, fmtDataCurta, fmtFaixa } from '../../../lib/datas'
import { fmtReais } from '../../../lib/formatos'
import { doEstabelecimento } from '../../../lib/mensagens'
import { whatsPara } from '../../../lib/whatsapp'
import type { DB, Mensalista } from '../../../tipos'
import { Botao, Cartao, Confirmar, IconeWhatsApp, MiniNumero, TituloPagina, Vazio } from '../../../ui'
import { precoDoHorario } from '../../reservas/agenda'
import { SEMANAS_FIXO, encerrarFixo, renovarFixo, reservasFuturasDoFixo } from '../regras'
import { JanelaNovoFixo } from './JanelaNovoFixo'

const JOGOS_POR_MES = 4

function resumo(db: DB, m: Mensalista) {
  const futuras = reservasFuturasDoFixo(db, m)
  const proxima = futuras[0]
  const mensal = JOGOS_POR_MES * precoDoHorario(db, proxima ? dataDeISO(proxima.data) : new Date(), m.hora)
  return { futuras, proxima, mensal }
}

export default function MensalistasAdmin() {
  const { db, set } = useDB()
  const { valor } = useOcultarValores()
  const [novo, setNovo] = useState(false)

  const linhas = db.mensalistas
    .map((m) => ({ m, ...resumo(db, m) }))
    .sort((a, b) => ORDEM_DIAS.indexOf(a.m.diaSemana) - ORDEM_DIAS.indexOf(b.m.diaSemana) || a.m.hora - b.m.hora)
  const receita = linhas.reduce((s, l) => s + l.mensal, 0)

  return (
    <>
      <TituloPagina
        titulo="Mensalistas"
        sub={`${db.mensalistas.length} horários fixos · cerca de ${valor(fmtReais(receita))} por mês garantidos`}
        acoes={<Botao onClick={() => setNovo(true)}><Plus className="size-4" /> Novo horário fixo</Botao>}
      />

      {linhas.length === 0 && <Vazio>Nenhum horário fixo ainda.</Vazio>}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {linhas.map(({ m, futuras, proxima, mensal }) => (
          <Cartao key={m.id} className="p-5 flex flex-col">
            <div className="flex items-start gap-3">
              <span className="size-12 shrink-0 rounded-2xl bg-sol/30 grid place-items-center text-petroleo"><Repeat className="size-6" /></span>
              <div className="flex-1 min-w-0">
                <p className="font-extrabold text-lg truncate">{m.nome}</p>
                <p className="text-xs text-petroleo-noite/60">{m.telefone}</p>
              </div>
            </div>
            <p className="mt-3 titulo text-3xl text-petroleo">{DIAS_SEMANA[m.diaSemana]}s · {fmtFaixa(m.hora)}</p>
            <p className="text-sm text-petroleo-noite/70">{quadraPorId(m.quadraId).nome} · desde {fmtDataCurta(dataDeISO(m.desde))}</p>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <MiniNumero valor={futuras.length} rotulo="semanas reservadas" />
              <MiniNumero valor={valor(fmtReais(mensal))} rotulo="por mês (aprox.)" />
            </div>
            {proxima && <p className="mt-2 text-xs text-onda font-semibold">Próximo jogo: {fmtDataCurta(dataDeISO(proxima.data))}</p>}
            {futuras.length <= 2 && <p className="mt-1 text-xs font-semibold text-amber-700">Acabando: renove para manter o horário.</p>}
            <div className="mt-4 flex flex-wrap gap-2 flex-1 items-end">
              <Botao variante="secundario" onClick={() => set((db) => renovarFixo(db, m))}>+{SEMANAS_FIXO} semanas</Botao>
              <Botao href={whatsPara(m, doEstabelecimento.mensalista(m.nome, m.diaSemana, m.hora))} variante="whatsapp-contorno" aria-label={`WhatsApp de ${m.nome}`}>
                <IconeWhatsApp className="size-4" />
              </Botao>
              <Confirmar rotulo="Encerrar" pergunta="Encerrar?" onConfirmar={() => set((db) => encerrarFixo(db, m))} />
            </div>
          </Cartao>
        ))}
      </div>

      {novo && <JanelaNovoFixo onFechar={() => setNovo(false)} />}
    </>
  )
}
