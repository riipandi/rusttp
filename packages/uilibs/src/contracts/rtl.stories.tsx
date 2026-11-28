import type { Meta, StoryObj } from '@storybook/tanstack-react'
import * as stylex from '@stylexjs/stylex'
import { useTable } from '@tanstack/react-table'
import type { ColumnDef } from '@tanstack/react-table'
import { useMemo } from 'react'
import { expect, screen, waitFor, within } from 'storybook/test'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../base/accordion'
import { Button } from '../base/button'
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList
} from '../base/combobox'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../base/dialog'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger
} from '../base/dropdown-menu'
import { Field, FieldDescription, FieldGroup, FieldLabel } from '../base/field'
import { Input } from '../base/input'
import { NumberField, NumberFieldGroup } from '../base/number-field'
import { OTPField, OTPFieldGroup, OTPFieldSlot } from '../base/otp-field'
import { Progress, ProgressLabel, ProgressValue } from '../base/progress'
import { UIProvider } from '../base/provider'
import { ScrollArea } from '../base/scroll-area'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../base/select'
import { Slider } from '../base/slider'
import { Switch } from '../base/switch'
import { ToggleGroup, ToggleGroupItem } from '../base/toggle-group'
import { DataGrid, DataGridContainer, DataGridScrollArea, DataGridTable } from '../data-grid'
import { dataGridFeatures } from '../data-grid'
import type { DataGridFeatures } from '../data-grid'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbSeparator
} from '../extra/breadcrumb'
import { ButtonGroup } from '../extra/button-group'
import { Calendar } from '../extra/calendar'
import {
  Command,
  CommandInput,
  CommandItem,
  CommandList,
  CommandShortcut
} from '../extra/command/command.component'
import { InputGroup, InputGroupAddon, InputGroupInput, InputGroupText } from '../extra/input-group'
import { Label } from '../extra/label'
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious
} from '../extra/pagination'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '../extra/sheet'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../extra/table'
import { container, unit } from '../styles/tokens.stylex'
import { pressUntil } from './keyboard'

const meta = {
  title: 'Contracts/Right to left',
  parameters: {
    docs: {
      description: {
        component:
          'Layout follows the reading direction, not the left and right of the screen: position, spacing, corners, and edges use logical properties (`insetInlineEnd`, `paddingInlineStart`, `borderStartStartRadius`), and a glyph or shadow with no logical form mirrors through `:dir(rtl)`. Each play sets `dir="rtl"` on the document, where a portal reads it too (the Storybook decorator puts it back to `ltr` when the story unmounts), and asserts where the part lands.'
      }
    }
  }
} satisfies Meta

export default meta

type Story = StoryObj<typeof meta>

const styles = stylex.create({
  frame: { maxWidth: container.large, width: '100%' },
  scroll: { height: unit.x16, width: container.xxsmall },
  wide: { width: 800 },
  stack: { display: 'flex', flexDirection: 'column', gap: unit.x4, maxWidth: container.large },
  form: { maxWidth: container.small }
})

/** The document carries `dir`, so a portaled popup sits in the same direction as the page. */
const rtl = () => {
  document.documentElement.dir = 'rtl'
}

const centerX = (rect: DOMRect) => rect.left + rect.width / 2

/** True when `part` sits in the left half of `box`: in right-to-left, the inline end. */
const atLeft = (part: Element, box: Element) =>
  centerX(part.getBoundingClientRect()) < centerX(box.getBoundingClientRect())

/** Like `atLeft`, for the glyphs of an element's own text. */
const textAtLeft = (element: Element) => {
  const range = document.createRange()
  range.selectNodeContents(element)
  return centerX(range.getBoundingClientRect()) < centerX(element.getBoundingClientRect())
}

const px = (element: Element, property: string) =>
  Number.parseFloat(getComputedStyle(element).getPropertyValue(property))

/** The x scale of an element's transform: `-1` when mirrored. */
const flip = (element: Element) => new DOMMatrix(getComputedStyle(element).transform).a

/** The x offset of a cell's inset divider shadow. */
const offset = (cell: Element) =>
  /(-?\d+)px 0px 0px 0px inset/.exec(getComputedStyle(cell).boxShadow)?.[1]

const corner = (element: Element, side: 'left' | 'right') =>
  px(element, `border-top-${side}-radius`)

/** A menu of every part that sits at an inline edge: the check, the inset, the shortcut, the chevron. */
export const Menu: Story = {
  render: () => (
    <DropdownMenu defaultOpen>
      <DropdownMenuTrigger render={<Button variant='outline' />}>Open the menu</DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuCheckboxItem defaultChecked>Show the map</DropdownMenuCheckboxItem>
        <DropdownMenuItem inset>Inset item</DropdownMenuItem>
        <DropdownMenuItem>
          Evanesco
          <DropdownMenuShortcut>⌘⌫</DropdownMenuShortcut>
        </DropdownMenuItem>
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>Send by Owl</DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <DropdownMenuItem>Email the Prophet</DropdownMenuItem>
          </DropdownMenuSubContent>
        </DropdownMenuSub>
      </DropdownMenuContent>
    </DropdownMenu>
  ),
  play: async () => {
    rtl()
    const menu = await screen.findByRole('menu')
    await waitFor(() => expect(menu).toBeVisible())
    const check = within(menu).getByRole('menuitemcheckbox')
    // The trailing check is at the inline end, the left edge, and room is reserved on that side.
    await waitFor(() => expect(atLeft(check.querySelector('svg')!, check)).toBe(true))
    await expect(px(check, 'padding-left')).toBeGreaterThan(px(check, 'padding-right'))
    // `inset` indents from the inline start, the right edge.
    const inset = within(menu).getByRole('menuitem', { name: 'Inset item' })
    await expect(px(inset, 'padding-right')).toBeGreaterThan(px(inset, 'padding-left'))
    const evanesco = within(menu).getByRole('menuitem', { name: /Evanesco/ })
    await expect(atLeft(within(evanesco).getByText('⌘⌫'), evanesco)).toBe(true)
    const owl = within(menu).getByRole('menuitem', { name: 'Send by Owl' })
    const chevron = owl.querySelector('svg')!
    await expect(atLeft(chevron, owl)).toBe(true)
    await expect(flip(chevron)).toBe(-1)
  }
}

/** A list opens with its check at the inline end and room reserved there. */
export const ComboboxPopup: Story = {
  name: 'Combobox',
  render: () => (
    <Combobox items={['Gryffindor', 'Slytherin']} defaultOpen defaultValue='Gryffindor'>
      <ComboboxInput aria-label='House' placeholder='House' />
      <ComboboxContent>
        <ComboboxEmpty>No house found.</ComboboxEmpty>
        <ComboboxList>
          {(item) => (
            <ComboboxItem key={item} value={item}>
              {item}
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  ),
  play: async () => {
    rtl()
    const list = await screen.findByRole('listbox')
    const selected = within(list).getByRole('option', { name: 'Gryffindor' })
    await waitFor(() => expect(selected).toBeVisible())
    await waitFor(() => expect(atLeft(selected.querySelector('svg')!, selected)).toBe(true))
    await expect(px(selected, 'padding-left')).toBeGreaterThan(px(selected, 'padding-right'))
  }
}

/** The command's shortcut sits at the inline end. */
export const CommandShortcutEnd: Story = {
  name: 'Command',
  render: () => (
    <div {...stylex.props(styles.frame)}>
      <Command items={['Lumos']} itemToStringValue={(item: unknown) => String(item)}>
        <CommandInput placeholder='Search spells…' />
        <CommandList>
          {(item: string) => (
            <CommandItem key={item} value={item}>
              {item}
              <CommandShortcut>⌘L</CommandShortcut>
            </CommandItem>
          )}
        </CommandList>
      </Command>
    </div>
  ),
  play: async ({ canvas }) => {
    rtl()
    const item = await canvas.findByRole('option', { name: /Lumos/ })
    await expect(atLeft(within(item).getByText('⌘L'), item)).toBe(true)
  }
}

/** The chevron is at the inline end, and the trigger's text aligns to the inline start. */
export const Disclosure: Story = {
  render: () => (
    <div {...stylex.props(styles.frame)}>
      <Accordion defaultValue={['end']}>
        <AccordionItem value='end'>
          <AccordionTrigger>Is the vault accessible?</AccordionTrigger>
          <AccordionContent>Yes.</AccordionContent>
        </AccordionItem>
        <AccordionItem value='start'>
          <AccordionTrigger iconPosition='start'>Is it enchanted?</AccordionTrigger>
          <AccordionContent>Yes.</AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  ),
  play: async ({ canvas }) => {
    rtl()
    const end = await canvas.findByRole('button', { name: 'Is the vault accessible?' })
    await expect(atLeft(end.querySelector('svg')!, end)).toBe(true)
    await expect(getComputedStyle(end).textAlign).toBe('start')
    const start = canvas.getByRole('button', { name: 'Is it enchanted?' })
    await expect(atLeft(start.querySelector('svg')!, start)).toBe(false)
  }
}

/** Text that aligns to the start sits at the right edge, and a value sits at the inline end. */
export const TextAlign: Story = {
  render: () => (
    <div {...stylex.props(styles.frame)}>
      <Field>
        <FieldLabel htmlFor='rtl-name'>Wizard name</FieldLabel>
        <Input id='rtl-name' />
        <FieldDescription>Embossed on the badge.</FieldDescription>
      </Field>
      <Progress value={40} locale='en-US'>
        <ProgressLabel>Brewing</ProgressLabel>
        <ProgressValue />
      </Progress>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>Hedwig</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  ),
  play: async ({ canvas }) => {
    rtl()
    const description = await canvas.findByText('Embossed on the badge.')
    await expect(textAtLeft(description)).toBe(false)
    await expect(textAtLeft(canvas.getByRole('columnheader', { name: 'Name' }))).toBe(false)
    const progress = canvas.getByRole('progressbar')
    await expect(atLeft(canvas.getByText('40%'), progress)).toBe(true)
  }
}

/** The previous and next glyphs and the breadcrumb separator point along the reading direction. */
export const Navigation: Story = {
  render: () => (
    <div {...stylex.props(styles.stack)}>
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious href='#previous' />
          </PaginationItem>
          <PaginationItem>
            <PaginationNext href='#next' />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>Hogwarts</BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>Library</BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    </div>
  ),
  play: async ({ canvas }) => {
    rtl()
    const previous = await canvas.findByRole('link', { name: 'Go to previous page' })
    const next = canvas.getByRole('link', { name: 'Go to next page' })
    await expect(flip(previous.querySelector('svg')!)).toBe(-1)
    await expect(flip(next.querySelector('svg')!)).toBe(-1)
    // `previous` trims its padding on the inline start, the right edge.
    await expect(px(previous, 'padding-right')).toBeLessThan(px(previous, 'padding-left'))
    await expect(px(next, 'padding-left')).toBeLessThan(px(next, 'padding-right'))
    const separator = canvas
      .getByRole('navigation', { name: 'Breadcrumb' })
      .querySelector('li svg')!
    await expect(flip(separator)).toBe(-1)
  }
}

/** Joined controls round their outer corners on the inline start and end, and share one edge. */
export const Joined: Story = {
  render: () => (
    <div {...stylex.props(styles.stack)}>
      <ToggleGroup variant='outline' spacing='joined'>
        <ToggleGroupItem value='a' aria-label='Charm'>
          Charm
        </ToggleGroupItem>
        <ToggleGroupItem value='b' aria-label='Hex'>
          Hex
        </ToggleGroupItem>
      </ToggleGroup>
      <OTPField length={2} aria-label='Code'>
        <OTPFieldGroup>
          <OTPFieldSlot />
          <OTPFieldSlot />
        </OTPFieldGroup>
      </OTPField>
      <ButtonGroup aria-label='Charms'>
        <Button variant='outline'>Accio</Button>
        <Button variant='outline'>Lumos</Button>
      </ButtonGroup>
      <NumberField defaultValue={3}>
        <Label>
          Galleons
          <NumberFieldGroup controls='sides' />
        </Label>
      </NumberField>
    </div>
  ),
  play: async ({ canvas }) => {
    rtl()
    const charm = await canvas.findByRole('button', { name: 'Charm' })
    const hex = canvas.getByRole('button', { name: 'Hex' })
    // The first item is on the right: it keeps the right corners, and its left ones are square.
    await expect(corner(charm, 'right')).toBeGreaterThan(0)
    await expect(corner(charm, 'left')).toBe(0)
    await expect(corner(hex, 'left')).toBeGreaterThan(0)
    await expect(corner(hex, 'right')).toBe(0)
    // The second item drops the border it shares with the first, on its inline start (right).
    await expect(px(hex, 'border-right-width')).toBe(0)
    await expect(px(hex, 'border-left-width')).toBeGreaterThan(0)
    const slots = canvas.getAllByRole('textbox')
    await expect(corner(slots[0]!, 'right')).toBeGreaterThan(0)
    await expect(corner(slots[0]!, 'left')).toBe(0)
    await expect(corner(slots[1]!, 'left')).toBeGreaterThan(0)
    const accio = canvas.getByRole('button', { name: 'Accio' })
    const lumos = canvas.getByRole('button', { name: 'Lumos' })
    await expect(corner(accio, 'right')).toBeGreaterThan(0)
    await expect(corner(accio, 'left')).toBe(0)
    await expect(corner(lumos, 'left')).toBeGreaterThan(0)
    await expect(corner(lumos, 'right')).toBe(0)
    await expect(px(lumos, 'border-right-width')).toBe(0)
    // The stepper at the inline start keeps its divider on the side that faces the input.
    const decrease = canvas.getByRole('button', { name: 'Decrease' })
    await expect(px(decrease, 'border-left-width')).toBeGreaterThan(0)
    await expect(px(decrease, 'border-right-width')).toBe(0)
    const increase = canvas.getByRole('button', { name: 'Increase' })
    await expect(px(increase, 'border-right-width')).toBeGreaterThan(0)
    await expect(px(increase, 'border-left-width')).toBe(0)
  }
}

/** An addon at the inline start is on the right and pads on that side. */
export const InputAddon: Story = {
  render: () => (
    <div {...stylex.props(styles.frame)}>
      <InputGroup>
        <InputGroupAddon>
          <InputGroupText>https://</InputGroupText>
        </InputGroupAddon>
        <InputGroupInput aria-label='Owl address' placeholder='dailyprophet.co.uk' />
        <InputGroupAddon align='inline-end'>
          <InputGroupText>.uk</InputGroupText>
        </InputGroupAddon>
      </InputGroup>
    </div>
  ),
  play: async ({ canvas }) => {
    rtl()
    const input = await canvas.findByRole('textbox', { name: 'Owl address' })
    const start = canvas.getByText('https://').parentElement!
    const end = canvas.getByText('.uk').parentElement!
    await expect(atLeft(start, input)).toBe(false)
    await expect(atLeft(end, input)).toBe(true)
    await expect(px(start, 'padding-right')).toBeGreaterThan(px(start, 'padding-left'))
    await expect(px(end, 'padding-left')).toBeGreaterThan(px(end, 'padding-right'))
  }
}

/** A checked thumb travels to the inline end, the left edge. */
export const SwitchThumb: Story = {
  render: () => (
    <div {...stylex.props(styles.stack)}>
      <Switch aria-label='Checked' defaultChecked />
      <Switch aria-label='Unchecked' />
    </div>
  ),
  play: async ({ canvas }) => {
    rtl()
    const checked = await canvas.findByRole('switch', { name: 'Checked' })
    const unchecked = canvas.getByRole('switch', { name: 'Unchecked' })
    // The thumb has a transform transition.
    await waitFor(() => expect(atLeft(checked.firstElementChild!, checked)).toBe(true))
    await expect(atLeft(unchecked.firstElementChild!, unchecked)).toBe(false)
  }
}

/** The close button of a dialog sits at the inline end, the left edge. */
export const DialogClose: Story = {
  name: 'Dialog',
  render: () => (
    <Dialog defaultOpen>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Enter the passphrase</DialogTitle>
          <DialogDescription>Five letters turn the rings.</DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  ),
  play: async () => {
    rtl()
    const dialog = await screen.findByRole('dialog', {
      name: 'Enter the passphrase'
    })
    const close = within(dialog).getByRole('button', { name: 'Close' })
    await waitFor(() => expect(atLeft(close, dialog)).toBe(true))
  }
}

/** A sheet on the left keeps the left edge in right-to-left, and its close button is at the inline end. */
export const SheetClose: Story = {
  name: 'Sheet',
  render: () => (
    <Sheet defaultOpen>
      <SheetContent side='left'>
        <SheetHeader>
          <SheetTitle>Vault ledger</SheetTitle>
          <SheetDescription>Every withdrawal since 1991.</SheetDescription>
        </SheetHeader>
      </SheetContent>
    </Sheet>
  ),
  play: async () => {
    rtl()
    const sheet = await screen.findByRole('dialog', { name: 'Vault ledger' })
    const close = within(sheet).getByRole('button', { name: 'Close' })
    await waitFor(() => expect(atLeft(close, sheet)).toBe(true))
  }
}

/** A range rounds its first day on the inline start, the right edge. */
export const CalendarRange: Story = {
  render: () => (
    <Calendar
      mode='range'
      defaultMonth={new Date(2026, 0, 1)}
      selected={{ from: new Date(2026, 0, 12), to: new Date(2026, 0, 16) }}
    />
  ),
  play: async ({ canvas }) => {
    rtl()
    const first = await canvas.findByRole('button', { name: /January 12th/ })
    const last = canvas.getByRole('button', { name: /January 16th/ })
    await expect(corner(first, 'right')).toBeGreaterThan(0)
    await expect(corner(first, 'left')).toBe(0)
    await expect(corner(last, 'left')).toBeGreaterThan(0)
    await expect(corner(last, 'right')).toBe(0)
  }
}

/** The fade at the scroll origin sits on the right edge, so its gradient runs the other way. */
export const ScrollFade: Story = {
  render: () => (
    <ScrollArea fade orientation='horizontal' style={styles.scroll}>
      <div {...stylex.props(styles.wide)}>Daily Prophet editions</div>
    </ScrollArea>
  ),
  play: async ({ canvasElement }) => {
    rtl()
    // The fade needs scroll-driven animations; an engine without them draws none.
    if (!CSS.supports('animation-timeline: scroll(self block)')) return
    const viewport = await waitFor(async () => {
      const found = Array.from(canvasElement.querySelectorAll('div')).find(
        (element) => element.scrollWidth > element.clientWidth
      )
      await expect(found).toBeDefined()
      return found!
    })
    await expect(getComputedStyle(viewport).maskImage).toContain('to left')
  }
}

interface Spell {
  id: string
  name: string
  kind: string
}

const spells: Spell[] = [
  { id: 'a', name: 'Lumos', kind: 'Charm' },
  { id: 'b', name: 'Accio', kind: 'Charm' }
]

function PinnedGrid() {
  const columns = useMemo<ColumnDef<DataGridFeatures, Spell>[]>(
    () => [
      { accessorKey: 'name', header: 'Spell', size: 160 },
      { accessorKey: 'kind', header: 'Kind', size: 160 }
    ],
    []
  )
  const table = useTable({
    features: dataGridFeatures,
    columns,
    data: spells,
    getRowId: (row: Spell) => row.id,
    state: { columnPinning: { start: ['name'], end: ['kind'] } }
  })
  return (
    <DataGrid table={table} recordCount={spells.length} tableLayout={{ columnsPinnable: true }}>
      <DataGridContainer>
        <DataGridScrollArea table={table}>
          <DataGridTable aria-label='Spells' table={table} />
        </DataGridScrollArea>
      </DataGridContainer>
    </DataGrid>
  )
}

/** A pinned column draws its divider on the side that faces the scrolling columns. */
export const PinnedColumns: Story = {
  render: () => (
    <div {...stylex.props(styles.frame)}>
      <PinnedGrid />
    </div>
  ),
  play: async ({ canvas }) => {
    rtl()
    const start = (await canvas.findAllByRole('cell', { name: 'Lumos' }))[0]!
    const end = canvas.getAllByRole('cell', { name: 'Charm' })[0]!
    // `inset 1px 0 0 0` is a line on the left edge; `inset -1px 0 0 0`, on the right.
    // The start column sits on the right, so its divider is on the left.
    await expect(offset(start)).toBe('1')
    await expect(offset(end)).toBe('-1')
  }
}

const houses = [
  { label: 'Gryffindor', value: 'gryffindor' },
  { label: 'Hufflepuff', value: 'hufflepuff' },
  { label: 'Ravenclaw', value: 'ravenclaw' },
  { label: 'Slytherin', value: 'slytherin' }
]

/**
 * A right-to-left form needs two things, and `UIProvider` is one of them. The `dir` attribute on
 * the document (or a subtree) makes the layout, the logical StyleX properties, and the text run
 * right to left. `UIProvider direction='rtl'` tells the Base UI parts that read a direction in
 * script: a slider's arrow keys, a menu's submenu keys, a tab list's roving focus.
 */
export const ProviderDirection: Story = {
  parameters: {
    docs: {
      source: {
        code: `<div dir='rtl'>
  <UIProvider direction='rtl'>
    <FieldGroup>
      <Field>
        <FieldLabel>Wizard name</FieldLabel>
        <Input defaultValue='هيرميون' />
      </Field>
      <Field>
        <FieldLabel>House</FieldLabel>
        <Select items={houses} defaultValue='ravenclaw'>…</Select>
      </Field>
      <Field>
        <FieldLabel>Spell power</FieldLabel>
        <Slider defaultValue={[25]} aria-label='Spell power' />
        <FieldDescription>…</FieldDescription>
      </Field>
    </FieldGroup>
  </UIProvider>
</div>`
      }
    }
  },
  render: () => (
    <div dir='rtl' lang='ar'>
      <UIProvider direction='rtl'>
        <FieldGroup style={styles.form}>
          <Field>
            <FieldLabel>Wizard name</FieldLabel>
            <Input defaultValue='هيرميون' />
          </Field>
          <Field>
            <FieldLabel>House</FieldLabel>
            <Select items={houses} defaultValue='ravenclaw'>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {houses.map(({ label, value }) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field>
            <FieldLabel>Spell power</FieldLabel>
            <Slider defaultValue={[25]} aria-label='Spell power' />
            <FieldDescription>The thumb starts at the right edge</FieldDescription>
          </Field>
        </FieldGroup>
      </UIProvider>
    </div>
  ),
  play: async ({ canvas }) => {
    // The text runs right to left, and the select's chevron sits at the end, which is the left.
    const input = canvas.getByRole('textbox', { name: 'Wizard name' })
    await expect(getComputedStyle(input).direction).toBe('rtl')
    const select = canvas.getByRole('combobox', { name: 'House' })
    const chevron = select.querySelector('svg')
    if (!chevron) throw new Error('No chevron in the select trigger')
    await expect(centerX(chevron.getBoundingClientRect())).toBeLessThan(
      centerX(select.getBoundingClientRect())
    )

    // The slider's minimum is at the right: a value of 25 puts the thumb right of the middle.
    const thumb = canvas.getByRole('slider', { name: 'Spell power' })
    // The input sits in the thumb, and the thumb in the control that spans the track.
    const control = thumb.closest('[data-orientation]')?.parentElement
    if (!control) throw new Error('No slider control around the thumb')
    await expect(centerX(thumb.getBoundingClientRect())).toBeGreaterThan(
      centerX(control.getBoundingClientRect())
    )

    // `direction='rtl'` reaches Base UI: ArrowLeft moves the thumb toward the maximum.
    thumb.focus()
    await expect(thumb).toHaveFocus()
    await pressUntil('{ArrowLeft}', () => expect(thumb).toHaveAttribute('aria-valuenow', '26'), {
      when: () => thumb.getAttribute('aria-valuenow') === '25'
    })

    // The select still opens from the keyboard and lists every house.
    select.focus()
    await pressUntil('{Enter}', () => expect(screen.getByRole('listbox')).toBeVisible(), {
      when: () => !screen.queryByRole('listbox')
    })
    await expect(screen.getAllByRole('option')).toHaveLength(houses.length)
    await pressUntil('{Escape}', () => expect(screen.queryByRole('listbox')).toBeNull())
  }
}
