// Mock imagen service - returns static data for now
const MOCK = [
  { id: '1', title: 'Cassini — Saturn Rings', imageUrl: 'https://images-assets.nasa.gov/image/PIA11667/PIA11667~medium.jpg', description: 'Imagen de Saturno por Cassini.' },
  { id: '2', title: 'Hubble — Galaxy', imageUrl: 'https://wallpapers.com/images/hd/nasa-galaxy-6z6g1k5g7b9v1k2b.jpg', description: 'Nebulosa y galaxia.' },
  { id: '3', title: 'Deep Sky Cluster', imageUrl: 'https://images.gettyimages.com/gi-resources/images/500px/983794168.jpg', description: 'Cúmulo estelar.' }
]

export const imagenService = {
  async search(q, category) {
    // simplistic filter
    const str = (q||'').toLowerCase()
    return MOCK.filter(i => i.title.toLowerCase().includes(str))
  },
  async all() { return MOCK }
}
// feature imagenes service placeholder
export const imagenServiceFeature = {};
