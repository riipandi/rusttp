import * as v from 'valibot'
import { beforeEach, describe, expect, test } from 'vitest'
import { localeStore } from '#/libraries/locale.store'
import en from '#/locales/en.json'
import id from '#/locales/id.json'
import {
  deviceSchema,
  emailSchema,
  loginSchema,
  newPasswordSchema,
  resetPasswordSchema,
  signupSchema,
  twoFactorSchema
} from '#/schemas/auth.schema'

beforeEach(() => {
  localStorage.clear()
  localeStore.setState(() => 'en')
})

/** Each failed field with its messages, so a test names the field and the exact text. */
function failures(schema: v.GenericSchema, input: unknown) {
  const result = v.safeParse(schema, input)
  if (result.success) return null
  return result.issues.map((issue) => [
    issue.path?.map((segment) => String(segment.key)).join('.') ?? '',
    issue.message
  ])
}

describe('emailSchema', () => {
  test('trims before it checks and keeps the trimmed address', () => {
    const result = v.safeParse(emailSchema, '  hermione.granger@example.com  ')
    expect(result.success && result.output).toBe('hermione.granger@example.com')
  })

  test('empty and spaces-only are "required"; text that is not an address is "invalid"', () => {
    expect(failures(emailSchema, '')?.[0]?.[1]).toBe(en.validation_email_required)
    expect(failures(emailSchema, '   ')?.[0]?.[1]).toBe(en.validation_email_required)
    expect(failures(emailSchema, 'hermione')?.[0]?.[1]).toBe(en.validation_email_invalid)
    expect(failures(emailSchema, 'hermione@')?.[0]?.[1]).toBe(en.validation_email_invalid)
  })

  test('the error is written in the language shown when the rule fails', () => {
    expect(failures(emailSchema, '')?.[0]?.[1]).toBe(en.validation_email_required)

    localeStore.actions.set('id')

    expect(failures(emailSchema, '')?.[0]?.[1]).toBe(id.validation_email_required)
  })
})

describe('newPasswordSchema', () => {
  test('11 characters are too short and 12 pass', () => {
    expect('Expecto-Pat'.length).toBe(11)
    expect(failures(newPasswordSchema, 'Expecto-Pat')).toEqual([
      ['', en.validation_password_too_short]
    ])
    expect(failures(newPasswordSchema, 'Expecto-Patr')).toBeNull()
  })

  test('empty is "required", not "too short"', () => {
    expect(failures(newPasswordSchema, '')?.[0]?.[1]).toBe(en.validation_password_required)
  })
})

describe('loginSchema', () => {
  const valid = { email: 'robert.langdon@example.com', password: 'x', captcha: true }

  test('accepts a password shorter than a new one must be', () => {
    expect(failures(loginSchema, valid)).toBeNull()
  })

  test('names the field that fails: password empty, captcha unchecked', () => {
    expect(failures(loginSchema, { ...valid, password: '' })).toEqual([
      ['password', en.validation_login_password_required]
    ])
    expect(failures(loginSchema, { ...valid, captcha: false })).toEqual([
      ['captcha', en.validation_captcha_required]
    ])
  })
})

describe('signupSchema', () => {
  const valid = {
    firstName: 'Sophie',
    lastName: 'Neveu',
    email: 'sophie.neveu@example.com',
    password: 'Cryptex-Sang',
    captcha: true
  }

  test('a name of only spaces is missing, and a padded name is trimmed', () => {
    expect(failures(signupSchema, { ...valid, firstName: '   ' })).toEqual([
      ['firstName', en.validation_first_name_required]
    ])
    const result = v.safeParse(signupSchema, { ...valid, lastName: ' Neveu ' })
    expect(result.success && result.output.lastName).toBe('Neveu')
  })
})

describe('resetPasswordSchema', () => {
  const valid = { token: 'lumos', password: 'Cryptex-Sang', confirm: 'Cryptex-Sang' }

  test('a confirmation that differs fails on confirm, not on password', () => {
    expect(failures(resetPasswordSchema, { ...valid, confirm: 'Cryptex-Sand' })).toEqual([
      ['confirm', en.validation_passwords_mismatch]
    ])
  })

  test('matching passwords pass, and an empty confirmation is "required"', () => {
    expect(failures(resetPasswordSchema, valid)).toBeNull()
    expect(failures(resetPasswordSchema, { ...valid, confirm: '' })?.[0]).toEqual([
      'confirm',
      en.validation_confirm_required
    ])
  })

  test('a password that is too short is reported on password', () => {
    expect(
      failures(resetPasswordSchema, { ...valid, password: 'short', confirm: 'short' })?.[0]
    ).toEqual(['password', en.validation_password_too_short])
  })
})

describe('twoFactorSchema', () => {
  test.each(['123456', '000000'])('accepts the code %s', (code) => {
    expect(failures(twoFactorSchema, { code, trust: false })).toBeNull()
  })

  test.each(['12345', '1234567', 'abcdef', '12345a', ' 12345', '１２３４５６'])(
    'rejects the code %j',
    (code) => {
      expect(failures(twoFactorSchema, { code, trust: false })).toEqual([
        ['code', en.validation_two_factor_code_invalid]
      ])
    }
  )
})

describe('deviceSchema', () => {
  const valid = { token: 'lumos', code: 'LUMOS123' }

  test('takes eight upper-case letters or digits', () => {
    expect(failures(deviceSchema, valid)).toBeNull()
  })

  test.each(['lumos123', 'LUMOS12', 'LUMOS1234', 'LUMOS-12'])('rejects %j', (code) => {
    expect(failures(deviceSchema, { ...valid, code })).toEqual([
      ['code', en.validation_device_code_invalid]
    ])
  })
})
