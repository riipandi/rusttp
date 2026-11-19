import * as stylex from '@stylexjs/stylex'

// The five bars of the SPA loader in `apps/server/stub/body.html`, same geometry and color.
const styles = stylex.create({
  mark: {
    height: '1.25em',
    width: 'auto',
    color: '#d9531e'
  }
})

export function Logo() {
  return (
    <svg
      viewBox='0 0 135 140'
      fill='currentColor'
      aria-hidden='true'
      {...stylex.props(styles.mark)}
    >
      <rect y='10' width='15' height='120' rx='6' />
      <rect x='30' y='10' width='15' height='120' rx='6' />
      <rect x='60' width='15' height='140' rx='6' />
      <rect x='90' y='10' width='15' height='120' rx='6' />
      <rect x='120' y='10' width='15' height='120' rx='6' />
    </svg>
  )
}
