import * as stylex from '@stylexjs/stylex'
import { colors } from 'uilibs/styles/colors.stylex'

// The mark of `public/favicon.svg`. It fills with the primary foreground token, which is the same
// orange in light and its lighter step in dark, so the logo follows the theme without reading it.
const styles = stylex.create({
  mark: { fill: colors.foregroundPrimary }
})

export function Logo() {
  return (
    <svg
      viewBox='0 0 140 140'
      aria-hidden='true'
      width='1.25em'
      height='1.25em'
      {...stylex.props(styles.mark)}
    >
      <rect x='0' y='35' width='20' height='70' rx='7' />
      <rect x='30' y='17' width='20' height='106' rx='7' />
      <rect x='60' y='0' width='20' height='140' rx='7' />
      <rect x='90' y='17' width='20' height='106' rx='7' />
      <rect x='120' y='35' width='20' height='70' rx='7' />
    </svg>
  )
}
