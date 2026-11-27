/**
 * A phone number input with a searchable country selector.
 *
 * @see: https://www.npmjs.com/package/react-phone-number-input
 * @see: https://base-ui.com/react/components/combobox
 */

import { Input as BaseInput } from '@base-ui/react/input'
import { Globe as GlobeIcon, Search } from '@keyline-icons/react'
import * as stylex from '@stylexjs/stylex'
import * as React from 'react'
import * as BasePhoneInput from 'react-phone-number-input'
import type { Country, Value } from 'react-phone-number-input'
import flags from 'react-phone-number-input/flags'
import { comboboxCreateItems } from '../../base/combobox'
import { Combobox, ComboboxContent, ComboboxEmpty, ComboboxInput } from '../../base/combobox'
import { ComboboxItem, ComboboxList, ComboboxTrigger } from '../../base/combobox'
import {
  type ControlVariant,
  controlBase,
  controlSizes,
  controlVariantsWithin
} from '../../styles/control.stylex'
import type { ControlSize, PartProps } from '../../styles/types'
import { inputPhoneStyles as s } from './input-phone.stylex'

type LibraryPhoneInputProps = React.ComponentProps<typeof BasePhoneInput.default>

export interface InputPhoneProps extends PartProps<LibraryPhoneInputProps, 'onChange' | 'value'> {
  /** E.164 phone value, e.g. `+12135551234`. Use for a controlled field. */
  value?: Value
  /** Called with the E.164 value (or `''` when cleared). */
  onChange?: (value: Value) => void
  /** Country shown initially. Defaults to `US`. */
  defaultCountry?: Country
  /** Restrict the country dropdown to these countries. */
  countries?: Country[]
  /** Called when the selected country changes. */
  onCountryChange?: (country: Country | undefined) => void
  /** Show the "International" entry in the dropdown. Defaults to `true`. */
  addInternationalOption?: boolean
  /** Render the country selector. Set `false` for a digits-only field.
   * Defaults to `true`. */
  withCountrySelect?: boolean
  /** Control height and type; `medium` (36px) by default. */
  size?: ControlSize
  /** The box: `outline` (default), `faded`, `ghost`, or `headless`. */
  variant?: ControlVariant
  /** Visible and accessible strings; English by default. */
  labels?: Partial<InputPhoneLabels>
  /** Marks the field visually as invalid. */
  invalid?: boolean
  /** Disables the entire component (input and country selector). */
  disabled?: boolean
  /** Sets the field into read-only mode. */
  readOnly?: boolean
}

export interface InputPhoneLabels {
  /**
   * Name of the country trigger, from the name of the selected country (`United States`, or
   * `International` when none is). Defaults to `Select country, <name>`.
   */
  selectCountry: (country: string) => string
  /** Placeholder of the country search. Defaults to `Search country…`. */
  searchCountry: string
  /** Text shown when the search matches no country. Defaults to `No country found.` */
  noCountry: string
}

const defaultLabels: InputPhoneLabels = {
  selectCountry: (country) => `Select country, ${country}`,
  searchCountry: 'Search country…',
  noCountry: 'No country found.'
}

interface CountryEntry {
  label: string
  value: Country | undefined
}

interface CountrySelectProps {
  disabled?: boolean
  readOnly?: boolean
  value: Country
  options: CountryEntry[]
  onChange: (country: Country) => void
}

interface PhoneContextValue {
  containerRef: React.RefObject<HTMLDivElement | null>
  size: ControlSize
  variant: ControlVariant
  labels: InputPhoneLabels
}

// The library renders the container, input, and country select as components of its own,
// so what they share with `InputPhone` travels through context.
const PhoneContext = React.createContext<PhoneContextValue | null>(null)

/**
 * Flag SVG from the library's bundled flags (no external requests). `countryName` is the full name
 * and becomes the SVG title; a flag beside the name in text is `decorative`, so it is not read twice.
 */
function FlagComponent({
  country,
  countryName,
  decorative
}: BasePhoneInput.FlagProps & { decorative?: boolean }) {
  const Flag = country ? flags[country] : undefined
  return (
    <span aria-hidden={decorative || undefined} {...stylex.props(s.flag)}>
      {Flag ? <Flag title={countryName} /> : <GlobeIcon {...stylex.props(s.flagFallback)} />}
    </span>
  )
}

/** Library-provided country select, rendered as the design system's Combobox. */
function CountrySelect({
  disabled,
  readOnly,
  value: selectedCountry,
  options: countryList,
  onChange
}: CountrySelectProps) {
  const phone = React.useContext(PhoneContext)
  const containerRef = phone?.containerRef
  const labels = phone?.labels ?? defaultLabels
  const countryName =
    countryList.find((entry) => entry.value === selectedCountry)?.label ?? selectedCountry ?? ''
  const collection = React.useMemo(
    () =>
      comboboxCreateItems(countryList, {
        getValue: (entry) => entry.value ?? '',
        getLabel: (entry) => entry.label
      }),
    [countryList]
  )

  return (
    <Combobox
      items={collection}
      value={selectedCountry ?? null}
      onValueChange={(next) => {
        if (next) onChange(next)
      }}
    >
      <ComboboxTrigger
        disabled={disabled || readOnly}
        aria-label={labels.selectCountry(countryName)}
        size={phone?.size}
        showIcon={false}
        style={s.countryTrigger}
      >
        <FlagComponent country={selectedCountry} countryName={countryName} />
      </ComboboxTrigger>
      <ComboboxContent
        anchor={containerRef ?? undefined}
        collisionAvoidance={{ side: 'none', align: 'shift' }}
        style={s.popup}
      >
        <div {...stylex.props(s.searchWrap)}>
          <Search {...stylex.props(s.searchIcon)} />
          <ComboboxInput
            placeholder={labels.searchCountry}
            showTrigger={false}
            showClear={false}
            style={s.countrySearchWrap}
            inputStyle={s.countrySearchInput}
          />
        </div>
        <ComboboxEmpty>{labels.noCountry}</ComboboxEmpty>
        <ComboboxList>
          {(item: CountryEntry) =>
            item.value ? (
              <ComboboxItem key={item.value} value={item.value}>
                <FlagComponent country={item.value} countryName={item.label} decorative />
                <span {...stylex.props(s.countryLabel)}>{item.label}</span>
                <span {...stylex.props(s.countryCode)}>
                  +{BasePhoneInput.getCountryCallingCode(item.value)}
                </span>
              </ComboboxItem>
            ) : null
          }
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  )
}

/** Hidden select stub for `withCountrySelect={false}` — the library always
 * renders its `countrySelectComponent`, so we give it a null placeholder and
 * let the digits span the whole group. */
function NoCountrySelect() {
  return null
}

function PhoneInputContainer({ style, ...props }: PartProps<React.ComponentProps<'div'>>) {
  const phone = React.useContext(PhoneContext)
  return (
    <div
      ref={phone?.containerRef}
      role='group'
      {...props}
      {...stylex.props(
        controlBase.root,
        controlBase.within,
        controlVariantsWithin[phone?.variant ?? 'outline'],
        controlSizes[phone?.size ?? 'medium'],
        s.root,
        style
      )}
    />
  )
}

function PhoneInput({ style, ...props }: PartProps<React.ComponentPropsWithRef<typeof BaseInput>>) {
  const phone = React.useContext(PhoneContext)
  return (
    <BaseInput
      {...props}
      {...stylex.props(controlSizes[phone?.size ?? 'medium'], s.control, style)}
    />
  )
}

export function InputPhone({
  style,
  defaultCountry = 'US',
  countries,
  onCountryChange,
  addInternationalOption = true,
  withCountrySelect = true,
  size = 'medium',
  variant = 'outline',
  labels,
  invalid = false,
  disabled,
  readOnly,
  onChange = () => {},
  ...props
}: InputPhoneProps) {
  const containerRef = React.useRef<HTMLDivElement | null>(null)
  const context = React.useMemo(
    () => ({ containerRef, size, variant, labels: { ...defaultLabels, ...labels } }),
    [size, variant, labels]
  )

  return (
    <PhoneContext.Provider value={context}>
      <BasePhoneInput.default
        {...props}
        disabled={disabled}
        readOnly={readOnly}
        className={undefined}
        containerComponent={PhoneInputContainer}
        containerComponentProps={{ style, 'data-invalid': invalid || undefined }}
        inputComponent={PhoneInput}
        countrySelectComponent={withCountrySelect ? CountrySelect : NoCountrySelect}
        flagComponent={FlagComponent}
        smartCaret={false}
        defaultCountry={defaultCountry}
        countries={countries}
        onCountryChange={onCountryChange}
        addInternationalOption={addInternationalOption}
        value={props.value || undefined}
        onChange={(next) => onChange(next || '')}
      />
    </PhoneContext.Provider>
  )
}

// Re-exported for type consumers.
export type { Country, Value }
