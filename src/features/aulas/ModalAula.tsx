// Inscrição numa turma (aula experimental), usada na página de aulas e na agenda de quadras
import { useState } from 'react'
import { modalidadePorId, quadraPorId } from '../../config/estabelecimento'
import { useDB } from '../../lib/banco'
import { dataISO, fmtDataLonga, fmtFaixa } from '../../lib/datas'
import { doCliente } from '../../lib/mensagens'
import type { Aula } from '../../tipos'
import { SeloModalidade } from '../../ui'
import ModalReserva from '../reservas/modal/ModalReserva'
import { acharProfessor, estaLotada, matricular, proximaDataDaAula } from './regras'

// `dia`: quando vem da agenda, mostra o dia em que a pessoa clicou em vez da próxima aula
export function ModalAula({ aula, dia, onFechar }: { aula: Aula; dia?: Date; onFechar: () => void }) {
  const { db, aplicar } = useDB()
  // data e lotação calculadas ao abrir: depois de confirmar, a turma pode lotar com a própria pessoa
  const [data] = useState(() => dia ?? proximaDataDaAula(aula))
  const [lotada] = useState(() => estaLotada(aula))
  const professor = acharProfessor(db, aula.professorId).nome
  const modalidade = modalidadePorId(aula.modalidade).nome

  return (
    <ModalReserva
      onFechar={onFechar}
      titulo={lotada ? 'Lista de espera' : 'Aula experimental'}
      etiqueta={<SeloModalidade id={aula.modalidade} />}
      detalhes={[
        { rotulo: 'Turma', valor: aula.nivel },
        { rotulo: 'Professor', valor: professor },
        { rotulo: dia ? 'Dia' : 'Próxima aula', valor: fmtDataLonga(data) },
        { rotulo: 'Horário', valor: fmtFaixa(aula.hora) },
        { rotulo: 'Local', valor: quadraPorId(aula.quadraId).nome },
        { rotulo: 'Vagas', valor: lotada ? 'Turma cheia' : `${aula.vagas - aula.alunos.length} de ${aula.vagas}` },
      ]}
      preco="Grátis (1ª aula)"
      textoConfirmar={lotada ? 'Entrar na lista de espera' : 'Garantir minha vaga'}
      textoSucesso={lotada ? 'Você está na lista!' : 'Vaga garantida!'}
      mensagemWhatsApp={(nome) => doCliente.aulaExperimental(nome, modalidade, aula.nivel, professor, dataISO(data), aula.hora)}
      onConfirmar={(c) => (lotada ? null : aplicar((db) => matricular(db, aula.id, c)))}
    />
  )
}
