// Fotos do espaço. Basta colocar arquivos .jpg/.png/.webp em src/assets/fotos/
// que eles aparecem no site (topo da página inicial e galeria), em ordem de nome.
import quadraAerea from '../assets/quadra-aerea.jpg'

const arquivos = import.meta.glob<string>('../assets/fotos/*.{jpg,jpeg,png,webp}', { eager: true, import: 'default' })

export const FOTOS: string[] = Object.keys(arquivos)
  .sort()
  .map((k) => arquivos[k])

// Foto de fundo do topo do site: a primeira da pasta, ou a vista aérea
export const FOTO_CAPA = FOTOS[0] ?? quadraAerea
