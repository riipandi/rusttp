import { renderToString } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { OTPField, OTPFieldGroup, OTPFieldSlot } from './otp-field.component'

// A server render runs no layout effect, so a slot has to take its place from Base UI's own index.
describe('OTPField on the server', () => {
  it('names every slot, the first after the field and the rest by position', () => {
    const html = renderToString(
      <OTPField aria-label='Owl post code' length={3}>
        <OTPFieldGroup>
          <OTPFieldSlot />
          <OTPFieldSlot />
          <OTPFieldSlot />
        </OTPFieldGroup>
      </OTPField>
    )
    expect(html).toContain('aria-label="Character 2 of 3"')
    expect(html).toContain('aria-label="Character 3 of 3"')
    expect(html).not.toContain('Character 1 of 3')
    expect(html).toMatch(/<input[^>]*aria-labelledby="[^"]+"/)
  })
})
