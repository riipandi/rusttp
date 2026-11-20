import { colors } from '../constants.ts'

// The favicon's five bars (70/106/140/106/70 on a 140 grid), as fractions of the mark's height.
const bars = [
  { id: 'outer-left', ratio: 0.5 },
  { id: 'inner-left', ratio: 0.75 },
  { id: 'center', ratio: 1 },
  { id: 'inner-right', ratio: 0.75 },
  { id: 'outer-right', ratio: 0.5 }
]

/**
 * The app mark drawn with table cells instead of an image, so it needs no hosted file: Gmail and
 * Outlook strip inline SVG and `data:` images, but render plain blocks everywhere.
 */
interface LogoProps {
  color?: string
  /** Height of the tallest bar in px; bar width and gap scale with it. */
  size?: number
}

export function Logo({ color = colors.brand, size = 28 }: LogoProps) {
  const barWidth = Math.max(2, Math.round(size / 7))
  const gap = Math.max(1, Math.round(size / 14))

  return (
    <table
      data-skip='true'
      role='presentation'
      cellPadding={0}
      cellSpacing={0}
      style={{ borderCollapse: 'collapse' }}
    >
      <tbody>
        <tr>
          {bars.map(({ id, ratio }, index) => {
            const height = Math.round(size * ratio)
            return (
              <td
                key={id}
                style={{
                  verticalAlign: 'middle',
                  height: `${size}px`,
                  paddingLeft: index ? `${gap}px` : 0
                }}
              >
                <div
                  style={{
                    width: `${barWidth}px`,
                    height: `${height}px`,
                    lineHeight: `${height}px`,
                    fontSize: 0,
                    backgroundColor: color,
                    borderRadius: `${barWidth / 2}px`
                  }}
                >
                  &nbsp;
                </div>
              </td>
            )
          })}
        </tr>
      </tbody>
    </table>
  )
}
