import { useDirection } from '@base-ui/react/direction-provider'
import type { Meta, StoryObj } from '@storybook/tanstack-react'
import * as stylex from '@stylexjs/stylex'
import { addDays, format } from 'date-fns'
import * as React from 'react'
import type { DayButton } from 'react-day-picker'
import type { DateRange } from 'react-day-picker'
import { arSA } from 'react-day-picker/locale'
import { expect, userEvent, waitFor } from 'storybook/test'
import { Button } from '../../base/button/button.component'
import { buttonFills } from '../../base/button/button.stylex'
import { Field, FieldGroup, FieldLabel } from '../../base/field/field.component'
import { Popover, PopoverContent, PopoverTrigger } from '../../base/popover/popover.component'
import { cellOf } from '../../contracts/control-sizes'
import { pressUntil } from '../../contracts/keyboard'
import { reducedMotionRules, watchTransitions } from '../../contracts/reduced-motion'
import { Axis } from '../../contracts/story-axes'
import { colors, fixedColors } from '../../styles/colors.stylex'
import { stroke, unit } from '../../styles/tokens.stylex'
import { Card, CardContent, CardFooter } from '../card/card.component'
import { InputGroup, InputGroupInput } from '../input-group'
import { Calendar } from './calendar.component'
import { calendarStyles } from './calendar.stylex'

const storyStyles = stylex.create({
  buttonGroup: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: unit.x2
  },
  buttonGroupButton: {
    flex: 1
  },
  pickerContent: {
    padding: 0,
    width: 'max-content'
  },
  pickerForm: {
    display: 'flex',
    flexDirection: 'column',
    gap: unit.x3,
    padding: unit.x4
  },
  pickerTrigger: {
    minWidth: '12rem'
  },
  timeFooter: {
    display: 'grid',
    gap: unit.x4,
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    width: '100%'
  },
  timeFooterSurface: {
    backgroundColor: colors.backgroundElevationBase,
    borderTopColor: colors.borderNeutralFaded,
    borderTopStyle: 'solid',
    borderTopWidth: stroke.ring1,
    paddingBlock: unit.x4
  },
  timeInput: {
    appearance: 'none',
    paddingInline: unit.x3,
    outline: {
      default: 'none',
      ':focus-visible': `${stroke.ring2} solid ${colors.foregroundPrimary}`
    },
    outlineOffset: `calc(-1 * ${stroke.ring1})`
  },
  dayCustom: {
    fontSize: '0.8125rem',
    gap: unit.x0_5
  },
  dayCustomOutside: {
    color: colors.foregroundNeutralFaded
  },
  dayPrice: {
    fontSize: '0.625rem',
    lineHeight: 1
  },
  dayPriceMuted: {
    color: colors.foregroundNeutralFaded
  },
  dayPriceSelected: {
    color: fixedColors.onBackgroundPrimary,
    opacity: 0.8
  }
})

type DayButtonProps = Omit<React.ComponentProps<typeof DayButton>, 'style'>

const meta: Meta<typeof Calendar> = {
  title: 'Extra Components/Calendar',
  component: Calendar
}

export default meta
type Story = StoryObj<typeof Calendar>

const jan = new Date(2026, 0, 12)

// Several calendars on one canvas: each navigation landmark needs its own name.
const nav = (name: string) => ({ labelNav: () => `Navigation bar ${name}` })

/** Single picks one day, multiple any number, range a start and an end with the days between. */
export const Modes: Story = {
  parameters: {
    docs: {
      source: {
        code: `<Calendar mode='single' defaultMonth={jan} selected={jan} />

<Calendar mode='multiple' defaultMonth={jan} selected={[jan, …]} />

<Calendar mode='range' defaultMonth={jan} selected={{ from: jan, to: …}} />`
      }
    }
  },
  render: () => (
    <Axis axis='mode' rows={['single', 'multiple', 'range'] as const}>
      {(mode) =>
        mode === 'single' ? (
          <Calendar mode='single' defaultMonth={jan} selected={jan} labels={nav(mode)} />
        ) : mode === 'multiple' ? (
          <Calendar
            mode='multiple'
            defaultMonth={jan}
            selected={[jan, new Date(2026, 0, 15), new Date(2026, 0, 20)]}
            labels={nav(mode)}
          />
        ) : (
          <Calendar
            mode='range'
            defaultMonth={jan}
            selected={{ from: jan, to: new Date(2026, 0, 16) }}
            labels={nav(mode)}
          />
        )
      }
    </Axis>
  ),
  play: async ({ canvasElement }) => {
    const count = (mode: string, selector: string) =>
      cellOf(canvasElement, 'mode', mode).querySelectorAll(selector).length
    await expect(count('single', '[data-selected-single="true"]')).toBe(1)
    await expect(count('multiple', '[data-selected-single="true"]')).toBe(3)
    await expect(count('range', '[data-range-start="true"]')).toBe(1)
    await expect(count('range', '[data-range-end="true"]')).toBe(1)
    await expect(count('range', '[data-range-middle="true"]')).toBe(3)
  }
}

/** The caption is a label or two dropdowns; `numberOfMonths` draws that many months side by side. */
export const Layouts: Story = {
  parameters: {
    docs: {
      source: { code: `<Calendar mode='single' captionLayout='dropdown' numberOfMonths={2} />` }
    }
  },
  render: () => (
    <Axis
      axis='caption'
      rows={['label', 'dropdown'] as const}
      columnAxis='months'
      columns={['1', '2'] as const}
    >
      {(caption, months) => (
        <Calendar
          mode='single'
          defaultMonth={jan}
          captionLayout={caption}
          numberOfMonths={Number(months)}
          labels={nav(`${caption} ${months}`)}
        />
      )}
    </Axis>
  ),
  play: async ({ canvasElement }) => {
    for (const caption of ['label', 'dropdown']) {
      for (const months of ['1', '2']) {
        const cell = canvasElement.querySelector(
          `[data-caption="${caption}"][data-months="${months}"]`
        )
        if (!cell) throw new Error(`No cell for ${caption} ${months}`)
        await expect(cell.querySelectorAll('[role="grid"]')).toHaveLength(Number(months))
        // A dropdown caption has a month and a year select per month; a label has none.
        await expect(cell.querySelectorAll('[role="combobox"]')).toHaveLength(
          caption === 'dropdown' ? 2 * Number(months) : 0
        )
      }
    }
  }
}

type PlaygroundArgs = Pick<
  React.ComponentProps<typeof Calendar>,
  | 'captionLayout'
  | 'showOutsideDays'
  | 'numberOfMonths'
  | 'showWeekNumber'
  | 'weekStartsOn'
  | 'buttonVariant'
  | 'startMonth'
  | 'endMonth'
>

export const Playground: StoryObj<PlaygroundArgs> = {
  parameters: {
    controls: {
      disable: false,
      include: [
        'captionLayout',
        'showOutsideDays',
        'numberOfMonths',
        'showWeekNumber',
        'weekStartsOn',
        'buttonVariant',
        'startMonth',
        'endMonth'
      ]
    }
  },
  argTypes: {
    captionLayout: {
      control: 'radio',
      options: ['label', 'dropdown', 'dropdown-months', 'dropdown-years']
    },
    showOutsideDays: { control: 'boolean' },
    numberOfMonths: { control: 'radio', options: [1, 2] },
    showWeekNumber: { control: 'boolean' },
    weekStartsOn: { control: 'radio', options: [0, 1, 6] },
    buttonVariant: { control: 'radio', options: Object.keys(buttonFills) },
    startMonth: { control: 'date' },
    endMonth: { control: 'date' }
  },
  args: {
    captionLayout: 'label',
    showOutsideDays: true,
    numberOfMonths: 1,
    showWeekNumber: false,
    weekStartsOn: 0,
    buttonVariant: 'ghost',
    startMonth: new Date(1900, 0, 1),
    endMonth: new Date(2100, 11, 31)
  },
  render: ({ startMonth, endMonth, ...args }) => {
    const [date, setDate] = React.useState<Date | undefined>(new Date())
    // The date control hands back a timestamp once it is edited.
    return (
      <Calendar
        {...args}
        startMonth={startMonth && new Date(startMonth)}
        endMonth={endMonth && new Date(endMonth)}
        mode='single'
        selected={date}
        onSelect={setDate}
      />
    )
  }
}

export const DatePickerSingle: Story = {
  parameters: {
    docs: {
      source: {
        code: `<Popover open={open} onOpenChange={setOpen}>
  <PopoverTrigger render={<Button variant='outline' />}>
    {date ? format(date, 'PPP') : 'Pick a date'}
  </PopoverTrigger>
  <PopoverContent align='start'>
    <Calendar
      mode='single'
      selected={date}
      onSelect={(nextDate) => {
        setDate(nextDate)
        setOpen(false)
      }}
    />
  </PopoverContent>
</Popover>`
      }
    }
  },
  render: () => {
    const [date, setDate] = React.useState<Date | undefined>(new Date())
    const [open, setOpen] = React.useState(false)

    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger render={<Button variant='outline' style={storyStyles.pickerTrigger} />}>
          {date ? format(date, 'PPP') : 'Pick a date'}
        </PopoverTrigger>
        <PopoverContent align='start' style={storyStyles.pickerContent}>
          <Calendar
            mode='single'
            selected={date}
            onSelect={(nextDate) => {
              setDate(nextDate)
              setOpen(false)
            }}
          />
        </PopoverContent>
      </Popover>
    )
  }
}

export const DatePickerRange: Story = {
  render: () => {
    const [range, setRange] = React.useState<DateRange | undefined>({
      from: new Date(),
      to: addDays(new Date(), 5)
    })
    const [open, setOpen] = React.useState(false)

    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger render={<Button variant='outline' style={storyStyles.pickerTrigger} />}>
          {range?.from
            ? range.to
              ? `${format(range.from, 'LLL d, y')} – ${format(range.to, 'LLL d, y')}`
              : format(range.from, 'LLL d, y')
            : 'Pick a date range'}
        </PopoverTrigger>
        <PopoverContent align='start' style={storyStyles.pickerContent}>
          <Calendar
            mode='range'
            numberOfMonths={2}
            defaultMonth={range?.from}
            selected={range}
            onSelect={setRange}
          />
        </PopoverContent>
      </Popover>
    )
  }
}

export const DateTimePicker: Story = {
  render: () => {
    const [date, setDate] = React.useState<Date | undefined>(new Date())
    const [open, setOpen] = React.useState(false)

    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger render={<Button variant='outline' style={storyStyles.pickerTrigger} />}>
          {date ? format(date, 'PPP p') : 'Pick date and time'}
        </PopoverTrigger>
        <PopoverContent align='start' style={storyStyles.pickerContent}>
          <div {...stylex.props(storyStyles.pickerForm)}>
            <Calendar
              mode='single'
              selected={date}
              onSelect={(nextDate) => {
                if (nextDate) {
                  const currentTime = date ?? new Date()
                  nextDate.setHours(currentTime.getHours(), currentTime.getMinutes())
                }
                setDate(nextDate)
              }}
            />
            <Field>
              <FieldLabel htmlFor='calendar-date-time'>Time</FieldLabel>
              <InputGroup>
                <InputGroupInput
                  id='calendar-date-time'
                  type='time'
                  step={60}
                  value={date ? format(date, 'HH:mm') : ''}
                  onChange={(event) => {
                    if (!date) return
                    const [hours = 0, minutes = 0] = event.target.value.split(':').map(Number)
                    const nextDate = new Date(date)
                    nextDate.setHours(hours, minutes)
                    setDate(nextDate)
                  }}
                />
              </InputGroup>
            </Field>
          </div>
        </PopoverContent>
      </Popover>
    )
  }
}
export const WithPresets: Story = {
  render: () => {
    const [date, setDate] = React.useState<Date | undefined>(
      new Date(new Date().getFullYear(), 1, 12)
    )
    const [currentMonth, setCurrentMonth] = React.useState<Date>(
      new Date(new Date().getFullYear(), new Date().getMonth(), 1)
    )

    return (
      <Card size='small'>
        <CardContent>
          <Calendar
            mode='single'
            selected={date}
            onSelect={setDate}
            month={currentMonth}
            onMonthChange={setCurrentMonth}
            fixedWeeks
          />
        </CardContent>
        <CardFooter>
          <div {...stylex.props(storyStyles.buttonGroup)}>
            {[
              { label: 'Today', value: 0 },
              { label: 'Tomorrow', value: 1 },
              { label: 'In 3 days', value: 3 },
              { label: 'In a week', value: 7 },
              { label: 'In 2 weeks', value: 14 }
            ].map((preset) => (
              <Button
                key={preset.value}
                variant='outline'
                size='small'
                style={storyStyles.buttonGroupButton}
                onClick={() => {
                  const newDate = addDays(new Date(), preset.value)
                  setDate(newDate)
                  setCurrentMonth(new Date(newDate.getFullYear(), newDate.getMonth(), 1))
                }}
              >
                {preset.label}
              </Button>
            ))}
          </div>
        </CardFooter>
      </Card>
    )
  }
}

export const DateAndTime: Story = {
  render: () => {
    const [date, setDate] = React.useState<Date | undefined>(
      new Date(new Date().getFullYear(), new Date().getMonth(), 12)
    )

    return (
      <Card size='small'>
        <CardContent>
          <Calendar mode='single' selected={date} onSelect={setDate} />
        </CardContent>
        <CardFooter style={storyStyles.timeFooterSurface}>
          <FieldGroup style={storyStyles.timeFooter}>
            <Field>
              <FieldLabel htmlFor='time-from'>Start Time</FieldLabel>
              <InputGroup>
                <InputGroupInput
                  id='time-from'
                  type='time'
                  step={1}
                  defaultValue='10:30:00'
                  style={storyStyles.timeInput}
                />
              </InputGroup>
            </Field>
            <Field>
              <FieldLabel htmlFor='time-to'>End Time</FieldLabel>
              <InputGroup>
                <InputGroupInput
                  id='time-to'
                  type='time'
                  step={1}
                  defaultValue='12:30:00'
                  style={storyStyles.timeInput}
                />
              </InputGroup>
            </Field>
          </FieldGroup>
        </CardFooter>
      </Card>
    )
  }
}

export const BookedDates: Story = {
  render: () => {
    const [date, setDate] = React.useState<Date | undefined>(
      new Date(new Date().getFullYear(), 0, 6)
    )
    const bookedDays = Array.from(
      { length: 15 },
      (_, i) => new Date(new Date().getFullYear(), 0, 12 + i)
    )

    return (
      <Card size='small'>
        <CardContent>
          <Calendar
            mode='single'
            defaultMonth={date}
            selected={date}
            onSelect={setDate}
            disabled={bookedDays}
            modifiers={{ booked: bookedDays }}
            modifiersClassNames={{ booked: 'line-through opacity-100' }}
          />
        </CardContent>
      </Card>
    )
  }
}

export const CustomDays: Story = {
  parameters: {
    docs: {
      source: {
        code: `<Calendar
  mode='range'
  selected={range}
  onSelect={setRange}
  components={{
    DayButton: ({ children, modifiers, day, ...props }) => (
      <button {...props} {...stylex.props(calendarStyles.dayBtnBase, …)}>
        {children}
        <span>{price}</span>
      </button>
    )
  }}
/>`
      }
    }
  },
  render: () => {
    // A fixed month: the play counts the days of the range, so it cannot depend on today's date.
    const [range, setRange] = React.useState<DateRange | undefined>({
      from: new Date(2026, 11, 8),
      to: new Date(2026, 11, 18)
    })

    return (
      <Card size='small'>
        <CardContent>
          <Calendar
            mode='range'
            defaultMonth={range?.from}
            selected={range}
            onSelect={setRange}
            numberOfMonths={1}
            captionLayout='dropdown'
            formatters={{
              formatMonthDropdown: (calendarDate) =>
                calendarDate.toLocaleString('default', { month: 'long' })
            }}
            components={{
              // Example-level custom day button with a weekend price badge.
              DayButton: ({ children, modifiers, day, ...dayBtnProps }: DayButtonProps) => {
                const isWeekend = day.date.getDay() === 0 || day.date.getDay() === 6
                const price = isWeekend ? '$120' : '$100'
                const isSelectedSingle =
                  modifiers.selected &&
                  !modifiers.range_start &&
                  !modifiers.range_end &&
                  !modifiers.range_middle

                return (
                  <button
                    // react-day-picker's own `className` goes first so the StyleX class below is
                    // not replaced by it.
                    {...dayBtnProps}
                    type='button'
                    data-day={day.date.toLocaleDateString()}
                    data-selected-single={isSelectedSingle}
                    data-range-start={modifiers.range_start}
                    data-range-end={modifiers.range_end}
                    data-range-middle={modifiers.range_middle}
                    {...stylex.props(
                      calendarStyles.dayBtnBase,
                      isSelectedSingle && calendarStyles.dayBtnSelected,
                      modifiers.focused && calendarStyles.dayBtnFocused,
                      modifiers.range_start && calendarStyles.dayBtnRangeStart,
                      modifiers.range_end && calendarStyles.dayBtnRangeEnd,
                      modifiers.range_middle && calendarStyles.dayBtnRangeMiddle,
                      storyStyles.dayCustom,
                      modifiers.outside && storyStyles.dayCustomOutside
                    )}
                    // The name starts with everything the button shows: the number, then the price.
                    aria-label={[
                      [day.date.getDate(), !modifiers.outside && price].filter(Boolean).join(' '),
                      day.date.toLocaleDateString('default', { dateStyle: 'full' })
                    ].join(', ')}
                  >
                    {children}
                    {!modifiers.outside && (
                      <span
                        {...stylex.props(
                          storyStyles.dayPrice,
                          // Only the filled days (the ends and a single pick) are on the primary
                          // color; the days between sit on the neutral tint.
                          isSelectedSingle || modifiers.range_start || modifiers.range_end
                            ? storyStyles.dayPriceSelected
                            : storyStyles.dayPriceMuted
                        )}
                      >
                        {price}
                      </span>
                    )}
                  </button>
                )
              }
            }}
          />
        </CardContent>
      </Card>
    )
  },
  play: async ({ canvasElement }) => {
    // The range is 8 to 18 December: nine days between the two ends, and every one of the eleven is
    // filled (the ends on the primary color, the days between on the neutral tint).
    const filled = (part: string) =>
      canvasElement.querySelectorAll<HTMLElement>(`[data-range-${part}="true"]`)
    await expect(filled('middle')).toHaveLength(9)
    await expect(filled('start')).toHaveLength(1)
    await expect(filled('end')).toHaveLength(1)
    for (const day of [...filled('start'), ...filled('middle'), ...filled('end')]) {
      await expect(getComputedStyle(day).backgroundColor).not.toBe('rgba(0, 0, 0, 0)')
    }
  }
}

const ring = (element: HTMLElement) => {
  const style = getComputedStyle(element)
  return [style.outlineStyle, style.outlineWidth]
}

/** Keyboard focus draws the 2 px ring on the previous and next buttons and on the day, and the arrow keys move it. */
export const Keyboard: Story = {
  parameters: {
    docs: { source: { code: `<Calendar mode='single' defaultMonth={jan} selected={jan} />` } }
  },
  render: () => (
    <Calendar mode='single' defaultMonth={jan} selected={jan} labels={nav('keyboard')} />
  ),
  play: async ({ canvas }) => {
    await userEvent.tab()
    const previous = canvas.getByRole('button', { name: /previous month/i })
    await expect(previous).toHaveFocus()
    await expect(ring(previous)).toEqual(['solid', '2px'])

    const day = (date: number) => canvas.getByRole('button', { name: new RegExp(`^${date}, `) })
    day(12).focus()
    await waitFor(() => expect(ring(day(12))).toEqual(['solid', '2px']))
    await userEvent.keyboard('{ArrowRight}')
    await waitFor(() => expect(day(13)).toHaveFocus())
    await waitFor(() => expect(ring(day(13))).toEqual(['solid', '2px']))
    // The ring moved with the focus: the day left behind draws none.
    await expect(ring(day(12))[0]).toBe('none')

    // The other arrows step a day or a week; Home and End go to the week's first and last day.
    // Idempotent keys repeat until they land; each stepping key passes a precondition.
    await pressUntil('{ArrowLeft}', () => expect(day(12)).toHaveFocus(), {
      when: () => document.activeElement === day(13)
    })
    await pressUntil('{ArrowDown}', () => expect(day(19)).toHaveFocus(), {
      when: () => document.activeElement === day(12)
    })
    await pressUntil('{ArrowUp}', () => expect(day(12)).toHaveFocus(), {
      when: () => document.activeElement === day(19)
    })
    await pressUntil('{End}', () => expect(day(17)).toHaveFocus())
    await pressUntil('{Home}', () => expect(day(11)).toHaveFocus())
    await pressUntil('{ArrowRight}', () => expect(day(12)).toHaveFocus(), {
      when: () => document.activeElement === day(11)
    })

    // Enter and Space pick the focused day; the pick moves with the focus.
    await pressUntil('{ArrowRight}', () => expect(day(13)).toHaveFocus(), {
      when: () => document.activeElement === day(12)
    })
    await pressUntil(
      '{Enter}',
      () => expect(day(13)).toHaveAttribute('data-selected-single', 'true'),
      {
        when: () => day(13).getAttribute('data-selected-single') !== 'true'
      }
    )
    await pressUntil('{ArrowRight}', () => expect(day(14)).toHaveFocus(), {
      when: () => document.activeElement === day(13)
    })
    await pressUntil(' ', () => expect(day(14)).toHaveAttribute('data-selected-single', 'true'), {
      when: () => day(14).getAttribute('data-selected-single') !== 'true'
    })

    // Page Down shows the next month and Page Up comes back.
    const month = () => canvas.getByRole('status').textContent
    const before = month()
    await pressUntil('{PageDown}', () => expect(month()).not.toBe(before), {
      when: () => month() === before
    })
    await pressUntil('{PageUp}', () => expect(month()).toBe(before), {
      when: () => month() !== before
    })
  }
}

/** A day eases its fill on hover and on pick, and swaps it at once under reduced motion. */
export const Motion: Story = {
  parameters: {
    docs: { source: { code: `<Calendar mode='single' defaultMonth={jan} />` } }
  },
  render: () => <Calendar mode='single' defaultMonth={jan} labels={nav('motion')} />,
  play: async ({ canvas, canvasElement }) => {
    const runs = watchTransitions(canvasElement, 'background-color')
    const day = (date: number) => canvas.getByRole('button', { name: new RegExp(`^${date}, `) })
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const style = getComputedStyle(day(12))
    await expect(style.transitionProperty).toBe(reduce ? 'none' : 'background-color, color')
    if (!reduce) await expect(style.transitionDuration).toBe('0.15s')

    // Hover fills the day; the fill eases in, so the transition runs on that very button.
    const { userEvent: pointer } = await import('vitest/browser')
    await pointer.hover(day(12))
    await waitFor(() =>
      expect(getComputedStyle(day(12)).backgroundColor).not.toBe('rgba(0, 0, 0, 0)')
    )
    if (!reduce) await waitFor(() => expect(runs.some((run) => run.target === day(12))).toBe(true))

    // So does picking one.
    await userEvent.click(day(13))
    await waitFor(() => expect(day(13)).toHaveAttribute('data-selected-single', 'true'))
    if (!reduce) await waitFor(() => expect(runs.some((run) => run.target === day(13))).toBe(true))

    // The shipped reduced-motion rule: no transition.
    const rules = reducedMotionRules(day(12))
    await expect(rules.some((rule) => rule.style.transitionProperty === 'none')).toBe(true)
  }
}

export const WeekNumbers: Story = {
  parameters: {
    docs: {
      source: {
        code: `<Calendar mode='single' selected={date} onSelect={setDate} showWeekNumber />`
      }
    }
  },
  render: () => {
    const [date, setDate] = React.useState<Date | undefined>(
      new Date(new Date().getFullYear(), 0, 12)
    )

    return (
      <Card size='small'>
        <CardContent>
          <Calendar
            mode='single'
            defaultMonth={date}
            selected={date}
            onSelect={setDate}
            showWeekNumber
          />
        </CardContent>
      </Card>
    )
  }
}

export const Direction: Story = {
  render: () => {
    const direction = useDirection()

    return (
      <Calendar
        mode='single'
        captionLayout='dropdown'
        locale={direction === 'rtl' ? arSA : undefined}
      />
    )
  }
}

/** The two month arrows' horizontal scale; found by position, since a locale renames them. */
const arrowFlip = (canvasElement: HTMLElement) =>
  [...canvasElement.querySelectorAll('nav button svg')].map(
    (svg) => new DOMMatrix(getComputedStyle(svg).transform).a
  )

/** The root sizes to its content, not to the parent: a 32 px day cell at every canvas width. */
const hugsContent = async (canvasElement: HTMLElement) => {
  const root = canvasElement.querySelector<HTMLElement>('[data-slot="calendar"]')!
  const today = root.querySelector<HTMLElement>('[data-today]')!
  await expect(root.getBoundingClientRect().width).toBeLessThan(
    root.parentElement!.getBoundingClientRect().width
  )
  await expect(today.getBoundingClientRect().width).toBe(32)
  await expect(today.getBoundingClientRect().height).toBe(32)
}

/**
 * `dir='rtl'` on a wrapper, with no `lang` anywhere, mirrors the month arrows. The flip is a
 * `:dir(rtl)` rule, which the build must keep as `:dir()` (issue-00007): rewritten to a `:lang()`
 * list it follows the language, and the picker's own `lang` (its locale) hides the wrapper's.
 */
export const RightToLeft: Story = {
  parameters: {
    docs: {
      source: {
        code: `<div dir='rtl'>
  <Calendar mode='single' />
</div>`
      }
    }
  },
  render: () => (
    <div dir='rtl'>
      <Calendar mode='single' />
    </div>
  ),
  play: async ({ canvasElement }) => {
    await expect(arrowFlip(canvasElement)).toEqual([-1, -1])
    await hugsContent(canvasElement)
  }
}

/**
 * The language alone does not flip anything: Arabic text in a left-to-right page keeps its arrows.
 * The text itself comes from `locale` (`lang` sets only the attribute), and the glyphs from the
 * Arabic `@font-face` of `Mona Sans Variable` in `assets/fontface.css`, not from the OS.
 */
export const ArabicLeftToRight: Story = {
  render: () => (
    <div dir='ltr'>
      <Calendar mode='single' lang='ar' locale={arSA} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    await expect(arrowFlip(canvasElement)).toEqual([1, 1])
    await hugsContent(canvasElement)
    const heading = canvasElement.querySelector<HTMLElement>('[role="status"]')!
    await expect(heading.textContent).toMatch(/\p{Script=Arabic}/u)
    await document.fonts.load('1em "Mona Sans Variable"', heading.textContent)
    // Chromium and Firefox serialize the range as `U+600-6FF`, WebKit as `U+0600-06FF`.
    const arabicFace = [...document.fonts].find(
      (face) => face.family.includes('Mona Sans Variable') && /^U\+0*600-/i.test(face.unicodeRange)
    )
    await expect(arabicFace?.status).toBe('loaded')
  }
}
