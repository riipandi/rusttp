import { renderToString } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { Slider } from './slider.component'

// Base UI reads a thumb's place from `index` on the server, where no layout effect has run.
describe('Slider on the server', () => {
  it('numbers and names each thumb of a range', () => {
    const html = renderToString(
      <Slider defaultValue={[25, 75]} thumbLabels={['Minimum price', 'Maximum price']} />
    )
    expect(html).toContain('data-index="0"')
    expect(html).toContain('data-index="1"')
    expect(html).toContain('aria-label="Minimum price"')
    expect(html).toContain('aria-label="Maximum price"')
  })
})
