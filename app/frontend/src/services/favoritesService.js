const KEY = 'deepsky:favorites'

export const favoritesService = {
  getAll() {
    try { return JSON.parse(localStorage.getItem(KEY) || '[]') } catch { return [] }
  },
  isFavorite(id) {
    return this.getAll().some(i => i.id === id)
  },
  add(item) {
    const all = this.getAll()
    if (!all.some(i => i.id === item.id)) {
      all.unshift(item)
      localStorage.setItem(KEY, JSON.stringify(all))
    }
  },
  remove(id) {
    const all = this.getAll().filter(i => i.id !== id)
    localStorage.setItem(KEY, JSON.stringify(all))
  }
}
