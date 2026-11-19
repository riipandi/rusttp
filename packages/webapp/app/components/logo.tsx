import { useTheme } from 'uilibs/theme'

// The mark and colors of `public/favicon.svg`; the favicon follows the OS color scheme through a media
// query, the logo follows the theme the user picked.
const fill = { light: '#d9531e', dark: '#fb8f5a' }

export function Logo() {
  const { resolvedTheme } = useTheme()

  return (
    <svg
      viewBox='0 0 140 140'
      fill={resolvedTheme === 'dark' ? fill.dark : fill.light}
      aria-hidden='true'
      width='1.25em'
      height='1.25em'
    >
      <rect x='0' y='35' width='20' height='70' rx='7' />
      <rect x='30' y='17' width='20' height='106' rx='7' />
      <rect x='60' y='0' width='20' height='140' rx='7' />
      <rect x='90' y='17' width='20' height='106' rx='7' />
      <rect x='120' y='35' width='20' height='70' rx='7' />
    </svg>
  )
}
