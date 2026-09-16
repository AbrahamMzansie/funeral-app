export function formatMoney(amount) {
  const rounded = Math.round(Number(amount) * 100) / 100
  const [whole, cents] = rounded.toFixed(2).split('.')
  const grouped = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
  return cents === '00' ? `R${grouped}` : `R${grouped}.${cents}`
}

export function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString('en-ZA', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}
