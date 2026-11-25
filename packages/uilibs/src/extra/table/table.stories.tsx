import { MoreVertical } from '@keyline-icons/react'
import type { Meta, StoryObj } from '@storybook/tanstack-react'
import * as stylex from '@stylexjs/stylex'
import { expect, userEvent, within } from 'storybook/test'
import { Button } from '../../base/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '../../base/dropdown-menu'
import { cellOf, expectTypeRole } from '../../contracts/control-sizes'
import { Axis } from '../../contracts/story-axes'
import { visuallyHidden } from '../../styles/utils.stylex'
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow
} from './table.component'

const meta = {
  title: 'Extra Components/Table',
  component: Table,
  tags: [] // ['autodocs']
} satisfies Meta<typeof Table>

type Story = StoryObj<typeof meta>

const invoices = [
  { invoice: 'GRN001', status: 'Settled', method: 'Galleon transfer', amount: '$250.00' },
  { invoice: 'GRN002', status: 'Awaiting galleons', method: 'Owl post', amount: '$150.00' },
  { invoice: 'GRN003', status: 'Overdue', method: 'Vault withdrawal', amount: '$350.00' },
  { invoice: 'GRN004', status: 'Settled', method: 'Galleon transfer', amount: '$450.00' }
]

const footerInvoices = [
  { invoice: 'GRN001', method: 'Galleon transfer', amount: 250 },
  { invoice: 'GRN002', method: 'Owl post', amount: 150 },
  { invoice: 'GRN003', method: 'Vault withdrawal', amount: 350 }
]

const total = footerInvoices.reduce((sum, row) => sum + row.amount, 0)

const members = [
  { name: 'Albus Dumbledore', role: 'Headmaster' },
  { name: 'Severus Snape', role: 'Professor' },
  { name: 'Robert Langdon', role: 'Guest lecturer' }
]

const styles = stylex.create({
  root: {
    width: '100%'
  },
  footerRoot: {
    width: '100%'
  },
  actionsRoot: {
    width: '100%'
  },
  right: {
    textAlign: 'right'
  },
  icon: { height: 16, width: 16 },
  stack: { display: 'flex', flexDirection: 'column', gap: 24 },
  tall: { height: 64 },
  fit: { width: 'auto' }
})

export default meta

export const Playground: Story = {
  parameters: { controls: { disable: false, include: ['border', 'columnBorder'] } },
  argTypes: {
    border: { control: 'boolean' },
    columnBorder: { control: 'boolean' }
  },
  args: { border: false, columnBorder: false },
  render: (args) => (
    <div {...stylex.props(styles.root)}>
      <Table {...args}>
        <TableCaption>A list of your recent Gringotts vault transactions.</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Ledger no.</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Method</TableHead>
            <TableHead style={styles.right}>Amount</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {invoices.map((row) => (
            <TableRow key={row.invoice}>
              <TableCell>{row.invoice}</TableCell>
              <TableCell>{row.status}</TableCell>
              <TableCell>{row.method}</TableCell>
              <TableCell style={styles.right}>{row.amount}</TableCell>
            </TableRow>
          ))}
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell colSpan={3}>Total</TableCell>
            <TableCell style={styles.right}>$1,200.00</TableCell>
          </TableRow>
        </TableFooter>
      </Table>
    </div>
  ),
  play: async ({ canvas }) => {
    // A real table: named by its caption, with column headers and one row per ledger entry.
    const table = canvas.getByRole('table', {
      name: 'A list of your recent Gringotts vault transactions.'
    })
    await expect(within(table).getAllByRole('columnheader')).toHaveLength(4)
    await expectTypeRole(within(table).getAllByRole('columnheader')[0]!, 'body2')
    // The header row, the ledger rows, and the total row.
    await expect(within(table).getAllByRole('row')).toHaveLength(invoices.length + 2)
    await expect(within(table).getByRole('cell', { name: 'Total' })).toHaveAttribute('colspan', '3')
  }
}

export const Footer: Story = {
  render: () => (
    <div {...stylex.props(styles.footerRoot)}>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Ledger no.</TableHead>
            <TableHead>Method</TableHead>
            <TableHead style={styles.right}>Amount</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {footerInvoices.map((row) => (
            <TableRow key={row.invoice}>
              <TableCell>{row.invoice}</TableCell>
              <TableCell>{row.method}</TableCell>
              <TableCell style={styles.right}>${row.amount.toFixed(2)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell colSpan={2}>Total</TableCell>
            <TableCell style={styles.right}>${total.toFixed(2)}</TableCell>
          </TableRow>
        </TableFooter>
      </Table>
    </div>
  )
}

export const Actions: Story = {
  render: () => (
    <div {...stylex.props(styles.actionsRoot)}>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Scholar</TableHead>
            <TableHead>Title</TableHead>
            <TableHead style={styles.right}>
              <span {...stylex.props(visuallyHidden.root)}>Actions</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {members.map((member) => (
            <TableRow key={member.name}>
              <TableCell>{member.name}</TableCell>
              <TableCell>{member.role}</TableCell>
              <TableCell style={styles.right}>
                <DropdownMenu>
                  <DropdownMenuTrigger
                    render={<Button variant='ghost' size='icon-md' aria-label='Ledger actions' />}
                  >
                    <MoreVertical {...stylex.props(styles.icon)} />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align='end'>
                    <DropdownMenuItem>Edit title</DropdownMenuItem>
                    <DropdownMenuItem>Send an owl</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem color='critical'>Expel</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

const timetable = (
  <>
    <TableHeader>
      <TableRow>
        <TableHead>Subject</TableHead>
        <TableHead>Professor</TableHead>
        <TableHead>Classroom</TableHead>
        <TableHead>Time</TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      <TableRow>
        <TableCell>Defence Against the Dark Arts</TableCell>
        <TableCell>Remus Lupin</TableCell>
        <TableCell>Third floor, East Wing</TableCell>
        <TableCell>Monday 09:00</TableCell>
      </TableRow>
    </TableBody>
  </>
)

/**
 * A table wider than its column scrolls inside a focusable region. It is named by `labels.region`,
 * or by its caption when there is no label.
 */
export const ScrollRegion: Story = {
  render: () => (
    <div {...stylex.props(styles.stack)}>
      <div style={{ width: 240 }}>
        <Table labels={{ region: 'Hogwarts timetable' }}>{timetable}</Table>
      </div>
      <div style={{ width: 240 }}>
        <Table>
          <TableCaption>Beauxbatons timetable</TableCaption>
          {timetable}
        </Table>
      </div>
    </div>
  ),
  play: async ({ canvas }) => {
    const labelled = canvas.getByRole('region', { name: 'Hogwarts timetable' })
    const captioned = canvas.getByRole('region', { name: 'Beauxbatons timetable' })
    for (const region of [labelled, captioned]) {
      await expect(region.scrollWidth).toBeGreaterThan(region.clientWidth)
      await expect(region).toHaveAttribute('tabindex', '0')
    }
    await userEvent.tab()
    await expect(labelled).toHaveFocus()
    await userEvent.tab()
    await expect(captioned).toHaveFocus()
  }
}

/** A table that fits its column adds no Tab stop and no region landmark. */
export const FitsColumn: Story = {
  name: 'Fits its column',
  render: () => (
    <div {...stylex.props(styles.root)}>
      <Table labels={{ region: 'Hogwarts timetable' }}>{timetable}</Table>
    </div>
  ),
  play: async ({ canvas, canvasElement }) => {
    const table = canvas.getByRole('table')
    const wrapper = table.parentElement
    if (!wrapper) throw new Error('No wrapper')
    await expect(wrapper.scrollWidth).toBeLessThanOrEqual(wrapper.clientWidth)
    await expect(canvas.queryByRole('region')).toBeNull()
    await expect(wrapper).not.toHaveAttribute('tabindex')
    await userEvent.tab()
    await expect(canvasElement.contains(document.activeElement)).toBe(false)
  }
}

const edges = ['none', 'border', 'columnBorder', 'both'] as const

/** An edge around the table, between its columns, or both. */
export const Borders: Story = {
  render: () => (
    <Axis axis='edge' rows={edges} wide>
      {(edge) => (
        <Table
          border={edge === 'border' || edge === 'both'}
          columnBorder={edge === 'columnBorder' || edge === 'both'}
        >
          <TableCaption>Ledger, {edge}</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Ledger no.</TableHead>
              <TableHead>Method</TableHead>
              <TableHead>Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell>GRN001</TableCell>
              <TableCell>Owl post</TableCell>
              <TableCell>$150.00</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      )}
    </Axis>
  ),
  play: async ({ canvasElement, canvas }) => {
    // The wrapper draws the outer edge; it is the table's parent.
    const wrapper = (edge: string) => {
      const el = canvas.getByRole('table', { name: `Ledger, ${edge}` }).parentElement
      if (!el) throw new Error(`No wrapper for ${edge}`)
      return el
    }
    const cell = (edge: string, index: number) => {
      const el = cellOf(canvasElement, 'edge', edge).querySelectorAll('td')[index]
      if (!el) throw new Error(`No cell ${index} for ${edge}`)
      return getComputedStyle(el).borderInlineEndWidth
    }
    for (const edge of edges) {
      const bordered = edge === 'border' || edge === 'both'
      const columns = edge === 'columnBorder' || edge === 'both'
      await expect(getComputedStyle(wrapper(edge)).borderTopWidth).toBe(bordered ? '1px' : '0px')
      // The edge sits between columns: every cell but the last in its row.
      await expect(cell(edge, 0)).toBe(columns ? '1px' : '0px')
      await expect(cell(edge, 2)).toBe('0px')
    }
  }
}

/** A highlighted row holds a tint, so a selected row reads apart from a hovered one. */
export const States: Story = {
  render: () => (
    <Axis axis='state' rows={['default', 'highlighted'] as const} wide>
      {(state) => (
        <Table labels={{ region: `Scholars, ${state}` }}>
          <TableBody>
            <TableRow highlighted={state === 'highlighted'}>
              <TableCell>Hermione Granger</TableCell>
              <TableCell>Arithmancy</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      )}
    </Axis>
  ),
  play: async ({ canvasElement }) => {
    const tint = (state: string) => {
      const row = cellOf(canvasElement, 'state', state).querySelector('tr')
      if (!row) throw new Error(`No row for ${state}`)
      return getComputedStyle(row).backgroundColor
    }
    await expect(tint('highlighted')).not.toBe(tint('default'))
  }
}

const aligns = ['start', 'center', 'end'] as const

/** Content alignment of a cell on both axes, and a cell's width as a count of `unit` steps or a CSS length. */
export const Alignment: Story = {
  render: () => (
    <div {...stylex.props(styles.stack)}>
      <Axis axis='align' rows={aligns} wide>
        {(align) => (
          <Table labels={{ region: `Horizontal, ${align}` }}>
            <TableHeader>
              <TableRow>
                <TableHead align={align}>Vault</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell align={align}>713</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        )}
      </Axis>
      <Axis axis='valign' rows={aligns} wide>
        {(verticalAlign) => (
          <Table labels={{ region: `Vertical, ${verticalAlign}` }}>
            <TableBody>
              <TableRow>
                <TableCell style={styles.tall}>Tall cell</TableCell>
                <TableCell verticalAlign={verticalAlign}>{verticalAlign}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        )}
      </Axis>
      <Axis axis='width' rows={['width', 'minWidth'] as const} wide>
        {(prop) => (
          <Table style={styles.fit} labels={{ region: `Size, ${prop}` }}>
            <TableBody>
              <TableRow>
                <TableCell
                  width={prop === 'width' ? 20 : undefined}
                  minWidth={prop === 'minWidth' ? '10rem' : undefined}
                >
                  Narrow
                </TableCell>
                <TableCell>Rest</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        )}
      </Axis>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const first = (axis: string, value: string, tag: 'td' | 'th') => {
      const el = cellOf(canvasElement, axis, value).querySelector(tag)
      if (!el) throw new Error(`No ${tag} for ${axis} ${value}`)
      return el
    }
    for (const align of aligns) {
      await expect(getComputedStyle(first('align', align, 'th')).textAlign).toBe(align)
      await expect(getComputedStyle(first('align', align, 'td')).textAlign).toBe(align)
    }
    const vertical = { start: 'top', center: 'middle', end: 'bottom' } as const
    for (const align of aligns) {
      const cells = cellOf(canvasElement, 'valign', align).querySelectorAll('td')
      await expect(
        getComputedStyle(cells[1] ?? cellOf(canvasElement, 'valign', align)).verticalAlign
      ).toBe(vertical[align])
    }
    // 20 steps is 80px; the table fits its content, so the cell is as wide as asked.
    await expect(first('width', 'width', 'td').getBoundingClientRect().width).toBe(80)
    await expect(getComputedStyle(first('width', 'minWidth', 'td')).minWidth).toBe('160px')
  }
}
