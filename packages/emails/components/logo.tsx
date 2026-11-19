import { colors } from '../constants.ts'

// The favicon's five bars (70/106/140/106/70 on a 140 grid), scaled to 28px.
const bars = [
  { id: 'outer-left', height: 14 },
  { id: 'inner-left', height: 21 },
  { id: 'center', height: 28 },
  { id: 'inner-right', height: 21 },
  { id: 'outer-right', height: 14 }
]

/**
 * The app mark drawn with table cells instead of an image, so it needs no hosted file: Gmail and
 * Outlook strip inline SVG and `data:` images, but render plain blocks everywhere.
 */
export function Logo({ color = colors.brand }: { color?: string }) {
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
          {bars.map(({ id, height }, index) => (
            <td
              key={id}
              style={{ verticalAlign: 'middle', height: '28px', paddingLeft: index ? '2px' : 0 }}
            >
              <div
                style={{
                  width: '4px',
                  height: `${height}px`,
                  lineHeight: `${height}px`,
                  fontSize: 0,
                  backgroundColor: color,
                  borderRadius: '2px'
                }}
              >
                &nbsp;
              </div>
            </td>
          ))}
        </tr>
      </tbody>
    </table>
  )
}
