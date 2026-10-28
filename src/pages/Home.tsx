import quadraAerea from '../assets/quadra-aerea.jpg'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowRight, CalendarDays, Clock, GraduationCap, MapPin, PartyPopper, Phone, Star, Trophy, Users, UtensilsCrossed, Zap } from 'lucide-react'
import { AVALIACOES, MODALIDADES, NEGOCIO, QUADRAS, quadraPorId } from '../data/mock'
import { DIAS_SEMANA, chaveData, dataDeChave, fmtDataCurta, fmtDiaSemana, fmtHora, fmtReais, linkWhatsApp, proximosLivres } from '../lib/agenda'
import { useDB } from '../lib/store'
import { IconeInstagram, IconeWhatsApp, Onda } from '../components/Icones'
import MapaQuadras from '../components/MapaQuadras'
import { proximoTorneio } from './Torneios'

export default function Home() {
  const { db } = useDB()
  const navegar = useNavigate()
  const livres = proximosLivres(db, 4)
  const torneio = proximoTorneio(db.torneios)
  const hoje = chaveData(new Date())
  const f = db.funcionamento

  return (
    <>
      {/* HERO */}
      <section className="relative bg-petroleo text-white overflow-hidden">
        <img src={quadraAerea} alt="" className="absolute inset-0 size-full object-cover opacity-35" aria-hidden />
        <div className="absolute inset-0 bg-gradient-to-r from-petroleo-noite/95 via-petroleo/80 to-petroleo/40" aria-hidden />
        <div className="relative mx-auto max-w-6xl px-4 pt-12 pb-24 sm:pt-20 sm:pb-32 grid gap-10 lg:grid-cols-[1.2fr_1fr] items-center">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full bg-white/10 backdrop-blur px-3 py-1 text-xs font-semibold">
              <Star className="size-3.5 fill-sol text-sol" /> {NEGOCIO.nota.toFixed(1)} no Google · {NEGOCIO.avaliacoes} avaliações
            </p>
            <h1 className="titulo text-6xl sm:text-8xl mt-4">
              A areia <br />
              <span className="text-sol">te chama.</span>
            </h1>
            <p className="mt-4 text-lg text-white/85 max-w-lg">
              Futevôlei, beach tennis e vôlei de praia em Embu-Guaçu. Reserve sua quadra em segundos ou entre para uma turma com nossos professores.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/agendar" className="inline-flex items-center gap-2 rounded-full bg-sol text-petroleo-noite px-6 py-3.5 font-extrabold hover:brightness-105 shadow-lg shadow-sol/20">
                <CalendarDays className="size-5" /> Agendar quadra
              </Link>
              {db.modulos.aulas && (
                <Link to="/aulas" className="inline-flex items-center gap-2 rounded-full border-2 border-white/30 px-6 py-3.5 font-bold hover:bg-white/10">
                  <GraduationCap className="size-5" /> Ver aulas
                </Link>
              )}
            </div>
          </div>

          <div className="rounded-3xl bg-white text-petroleo-noite p-5 shadow-2xl shadow-petroleo-noite/40">
            <div className="flex items-center justify-between">
              <p className="titulo text-2xl text-petroleo">Próximos horários livres</p>
              <Zap className="size-5 text-sol-escuro" />
            </div>
            <ul className="mt-3 space-y-2">
              {livres.map((l) => {
                const k = chaveData(l.data)
                return (
                  <li key={`${k}-${l.hora}`}>
                    <Link
                      to={`/agendar?data=${k}&hora=${l.hora}&quadra=${l.quadraId}`}
                      className="flex items-center gap-3 rounded-2xl border border-petroleo/10 px-4 py-3 hover:border-onda hover:bg-onda-claro/40 transition"
                    >
                      <span className="titulo text-3xl text-petroleo w-14">{fmtHora(l.hora)}</span>
                      <span className="flex-1 text-sm leading-tight">
                        <b className="first-letter:uppercase block">{k === hoje ? 'Hoje' : `${fmtDiaSemana(l.data)} ${fmtDataCurta(l.data)}`}</b>
                        <span className="text-petroleo-noite/60">{quadraPorId(l.quadraId).nome}</span>
                      </span>
                      <span className="text-xs font-bold rounded-full bg-sol px-3 py-1.5">Reservar</span>
                    </Link>
                  </li>
                )
              })}
            </ul>
            <Link to="/agendar" className="mt-3 flex items-center justify-center gap-1 text-sm font-semibold text-onda">
              Ver agenda completa <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>
        <Onda className="absolute bottom-0 left-0 w-full h-12 sm:h-16" />
      </section>

      {/* NÚMEROS */}
      <section className="mx-auto max-w-6xl px-4 -mt-2">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            [String(QUADRAS.length), 'quadras de areia'],
            [String(db.professores.length), 'professores'],
            [String(db.aulas.length), 'aulas por semana'],
            [`${NEGOCIO.nota.toFixed(1).replace('.', ',')} ★`, 'no Google'],
          ].map(([n, t]) => (
            <div key={t} className="rounded-2xl bg-white border border-petroleo/10 p-4 text-center">
              <p className="titulo text-4xl text-petroleo">{n}</p>
              <p className="text-xs text-petroleo-noite/60 font-medium">{t}</p>
            </div>
          ))}
        </div>
      </section>

      {/* MODALIDADES */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <p className="text-onda font-semibold text-sm uppercase tracking-[0.2em]">Modalidades</p>
        <h2 className="titulo text-5xl text-petroleo mt-1">Escolha seu esporte</h2>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {MODALIDADES.map((m) => {
            const qtd = db.aulas.filter((a) => a.modalidade === m.id).length
            return (
              <Link
                key={m.id}
                to={db.modulos.aulas ? `/aulas?modalidade=${m.id}` : '/agendar'}
                className="group relative overflow-hidden rounded-3xl bg-white border border-petroleo/10 p-6 hover:-translate-y-1 hover:shadow-xl transition"
              >
                <span className={`absolute -right-10 -top-10 size-32 rounded-full ${m.cor} opacity-20 group-hover:scale-125 transition`} />
                <span className={`inline-block size-3 rounded-full ${m.cor}`} />
                <h3 className="titulo text-4xl text-petroleo mt-3">{m.nome}</h3>
                <p className="mt-2 text-sm text-petroleo-noite/70">{m.descricao}</p>
                <p className="mt-4 text-sm font-bold text-onda inline-flex items-center gap-1">
                  {db.modulos.aulas ? `${qtd} turmas na semana` : 'Reservar quadra'} <ArrowRight className="size-4 group-hover:translate-x-1 transition" />
                </p>
              </Link>
            )
          })}
        </div>
      </section>

      {/* NOSSO ESPAÇO */}
      <section className="bg-areia/60">
        <div className="mx-auto max-w-6xl px-4 py-16 grid gap-8 lg:grid-cols-[1fr_1.1fr] items-center">
          <div>
            <p className="text-onda font-semibold text-sm uppercase tracking-[0.2em]">Nosso espaço</p>
            <h2 className="titulo text-5xl text-petroleo mt-1">Escolha a quadra pelo mapa</h2>
            <p className="mt-3 text-petroleo-noite/75">
              Duas quadras de areia com iluminação noturna, bar com petiscos e área de mesas para a família. Toque em uma quadra para ver os horários dela.
            </p>
            <ol className="mt-6 space-y-3">
              {['Toque na quadra que você quer', 'Escolha o dia e um horário livre', 'Confirme com nome e WhatsApp'].map((t, i) => (
                <li key={t} className="flex items-center gap-3">
                  <span className="titulo text-4xl text-sol w-8">{i + 1}</span>
                  <span className="font-semibold">{t}</span>
                </li>
              ))}
            </ol>
            <img src={quadraAerea} alt="Vista aérea das quadras do Quati Beach Sport" className="mt-6 rounded-3xl shadow-lg w-full max-h-60 object-cover" />
          </div>
          <div className="rounded-3xl bg-white p-3 sm:p-5 shadow-xl">
            <MapaQuadras selecionada={null} onEscolher={(id) => navegar(`/agendar?quadra=${id}&ir=1`)} />
          </div>
        </div>
      </section>

      {/* BAR E EVENTOS */}
      {(db.modulos.bar || db.modulos.eventos) && (
        <section className="mx-auto max-w-6xl px-4 pt-16 grid gap-4 md:grid-cols-2">
          {db.modulos.bar && (
            <Link to="/bar" className="group rounded-3xl bg-laranja text-white p-8 relative overflow-hidden hover:-translate-y-1 transition">
              <UtensilsCrossed className="absolute -right-4 -bottom-4 size-36 text-white/15" />
              <p className="text-xs font-bold uppercase tracking-widest text-white/80">Bar do Quati</p>
              <h2 className="titulo text-5xl mt-1">Porções e bebida gelada</h2>
              <p className="mt-2 text-white/90 max-w-sm">O pós-jogo favorito da galera. Veja o cardápio e encomende para o fim do seu horário.</p>
              <span className="mt-4 inline-flex items-center gap-1 font-bold">Ver cardápio <ArrowRight className="size-4 group-hover:translate-x-1 transition" /></span>
            </Link>
          )}
          {db.modulos.eventos && (
            <Link to="/eventos" className="group rounded-3xl bg-petroleo text-white p-8 relative overflow-hidden hover:-translate-y-1 transition">
              <PartyPopper className="absolute -right-4 -bottom-4 size-36 text-white/10" />
              <p className="text-xs font-bold uppercase tracking-widest text-sol">Eventos</p>
              <h2 className="titulo text-5xl mt-1">Aniversário na areia?</h2>
              <p className="mt-2 text-white/85 max-w-sm">Festas, confraternizações de empresa e torneios entre amigos com quadra exclusiva.</p>
              <span className="mt-4 inline-flex items-center gap-1 font-bold text-sol">Pedir orçamento <ArrowRight className="size-4 group-hover:translate-x-1 transition" /></span>
            </Link>
          )}
        </section>
      )}

      {/* TORNEIO */}
      {torneio && db.modulos.torneios && (
        <section className="mx-auto max-w-6xl px-4 py-16">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-onda to-petroleo text-white p-8 sm:p-12 grid gap-6 md:grid-cols-[1fr_auto] items-center">
            <Trophy className="absolute -right-6 -bottom-6 size-48 text-white/10" />
            <div className="relative">
              <p className="inline-block rounded-full bg-sol text-petroleo-noite text-xs font-extrabold px-3 py-1 uppercase tracking-wide">Inscrições abertas</p>
              <h2 className="titulo text-5xl sm:text-6xl mt-3">{torneio.nome}</h2>
              <p className="mt-2 text-white/85">
                {fmtDataCurta(dataDeChave(torneio.data))} · {DIAS_SEMANA[dataDeChave(torneio.data).getDay()].toLowerCase()} {torneio.horario} · categorias{' '}
                {torneio.categorias.join(', ').toLowerCase()}
              </p>
            </div>
            <div className="relative flex flex-col items-start md:items-end gap-3">
              <p><span className="titulo text-5xl text-sol">{fmtReais(torneio.valor)}</span> <span className="text-sm">por atleta</span></p>
              <Link to="/torneios" className="rounded-full bg-white text-petroleo px-6 py-3 font-extrabold hover:bg-sol transition">
                Quero participar
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* AVALIAÇÕES */}
      <section className="mx-auto max-w-6xl px-4 pb-16 pt-4">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-onda font-semibold text-sm uppercase tracking-[0.2em]">Quem joga, recomenda</p>
            <h2 className="titulo text-5xl text-petroleo mt-1">Nota {NEGOCIO.nota.toFixed(1)} no Google</h2>
          </div>
          <div className="flex items-center gap-1">
            {Array.from({ length: 5 }).map((_, i) => <Star key={i} className="size-6 fill-sol text-sol" />)}
          </div>
        </div>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {AVALIACOES.map((a) => (
            <figure key={a.nome} className="rounded-3xl bg-white border border-petroleo/10 p-6">
              <div className="flex gap-0.5">{Array.from({ length: 5 }).map((_, i) => <Star key={i} className="size-4 fill-sol text-sol" />)}</div>
              <blockquote className="mt-3 text-petroleo-noite/80">“{a.texto}”</blockquote>
              <figcaption className="mt-4 text-sm">
                <b>{a.nome}</b> <span className="text-petroleo-noite/50">· {a.quando}</span>
              </figcaption>
            </figure>
          ))}
        </div>
        <div className="mt-6 text-center">
          <a
            href={NEGOCIO.googleAvaliacoes}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-full border-2 border-petroleo/20 px-5 py-2.5 font-bold text-petroleo hover:border-petroleo"
          >
            Ver todas as {NEGOCIO.avaliacoes} avaliações no Google <ArrowRight className="size-4" />
          </a>
        </div>
      </section>

      {/* LOCAL */}
      <section className="bg-petroleo-escuro text-white">
        <div className="mx-auto max-w-6xl px-4 py-16 grid gap-8 lg:grid-cols-2">
          <div>
            <p className="text-sol font-semibold text-sm uppercase tracking-[0.2em]">Como chegar</p>
            <h2 className="titulo text-5xl mt-1">Venha jogar com a gente</h2>
            <ul className="mt-6 space-y-4">
              <li className="flex gap-3">
                <MapPin className="size-5 text-sol shrink-0 mt-0.5" />
                <span>{NEGOCIO.endereco}<br /><span className="text-white/60">{NEGOCIO.cidade}</span></span>
              </li>
              <li className="flex gap-3">
                <Clock className="size-5 text-sol shrink-0 mt-0.5" />
                <span>
                  Seg a sex: {f[1][0]}h às {f[1][1]}h<br />
                  Sábado: {f[6][0]}h às {f[6][1]}h<br />
                  Domingo: {f[0][0]}h às {f[0][1]}h
                </span>
              </li>
              <li className="flex gap-3">
                <Phone className="size-5 text-sol shrink-0 mt-0.5" />
                <a href={`tel:+${NEGOCIO.whatsapp}`}>{NEGOCIO.telefone}</a>
              </li>
              <li className="flex gap-3">
                <Users className="size-5 text-sol shrink-0 mt-0.5" />
                <span>Ambiente familiar, com bar, petiscos e área de descanso.</span>
              </li>
            </ul>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href={linkWhatsApp('Olá! Vim pelo site e gostaria de mais informações.')} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full bg-[#25d366] px-5 py-3 font-bold">
                <IconeWhatsApp /> WhatsApp
              </a>
              <a href={NEGOCIO.instagram} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full border-2 border-white/30 px-5 py-3 font-bold hover:bg-white/10">
                <IconeInstagram /> Instagram
              </a>
              <a href={NEGOCIO.mapaLink} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full border-2 border-white/30 px-5 py-3 font-bold hover:bg-white/10">
                <MapPin className="size-5" /> Abrir no Maps
              </a>
            </div>
          </div>
          <div className="rounded-3xl overflow-hidden min-h-72 bg-petroleo">
            <iframe title="Mapa Quati Beach Sport" src={NEGOCIO.mapaEmbed} className="w-full h-full min-h-72 border-0" loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
          </div>
        </div>
      </section>
    </>
  )
}
