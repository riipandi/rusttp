import { GripVertical } from '@keyline-icons/react'
import type { Meta, StoryObj } from '@storybook/tanstack-react'
import * as stylex from '@stylexjs/stylex'
import { useState } from 'react'
import { expect, userEvent } from 'storybook/test'
import { Button } from '../base/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../base/tabs'
import {
  Kanban,
  KanbanBoard,
  KanbanColumn,
  KanbanColumnContent,
  KanbanColumnHandle,
  KanbanItem
} from '../extra/kanban'
import { Sortable, SortableItem, SortableItemHandle } from '../extra/sortable'
import { colors } from '../styles/colors.stylex'
import { container, radius, stroke, unit } from '../styles/tokens.stylex'
import { fontFamily, fontLineHeight, fontSize, fontWeight } from '../styles/tokens.stylex'

const meta = {
  title: 'Contracts/Focus is visible',
  parameters: {
    docs: {
      description: {
        component:
          'Every keyboard stop draws a focus indicator (WCAG 2.4.7). A stop with `outline: none` and no other cue is invisible to a keyboard user.'
      }
    }
  }
} satisfies Meta

export default meta

type Story = StoryObj<typeof meta>

// The rows and the column header mirror the Sortable and Kanban stories, so the ring is judged on a
// real-looking surface: a handle and its label on one line, inside a framed row.
const styles = stylex.create({
  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: unit.x2,
    maxWidth: container.large,
    width: '100%'
  },
  row: {
    alignItems: 'center',
    backgroundColor: colors.backgroundElevationBase,
    borderColor: colors.borderNeutralFaded,
    borderRadius: radius.medium,
    borderStyle: 'solid',
    borderWidth: stroke.ring1,
    boxSizing: 'border-box',
    color: colors.foregroundNeutral,
    display: 'flex',
    fontFamily: fontFamily.body,
    fontSize: fontSize.body2,
    fontWeight: fontWeight.medium,
    gap: unit.x3,
    lineHeight: fontLineHeight.body2,
    paddingBlock: unit.x3,
    paddingInline: unit.x3,
    width: '100%'
  },
  columnHeader: {
    alignItems: 'center',
    display: 'flex',
    gap: unit.x2,
    justifyContent: 'space-between'
  },
  columnTitle: {
    color: colors.foregroundNeutral,
    fontFamily: fontFamily.body,
    fontSize: fontSize.body2,
    fontWeight: fontWeight.semibold,
    lineHeight: fontLineHeight.body2
  },
  tabsFrame: {
    maxWidth: container.large,
    width: '100%'
  }
})

/** What a keyboard user sees on the focused element: an outline or a box shadow. */
async function expectFocusIndicator(element: HTMLElement) {
  await expect(element).toHaveFocus()
  const style = getComputedStyle(element)
  const outline = style.outlineStyle !== 'none' && Number.parseFloat(style.outlineWidth) > 0
  const shadow = style.boxShadow !== 'none'
  await expect(outline || shadow).toBe(true)
}

/** The control: a Button composes `focusRing.root`, so this must pass. It proves the helper can tell. */
export const ButtonRing: Story = {
  name: 'Button (control)',
  render: () => <Button>Alohomora</Button>,
  play: async ({ canvas }) => {
    await userEvent.tab()
    await expectFocusIndicator(canvas.getByRole('button', { name: 'Alohomora' }))
  }
}

// audit-00002 F-02: the panel is a tab stop, so it draws the ring too.
export const TabsPanel: Story = {
  name: 'Tabs panel',
  render: () => (
    <Tabs defaultValue='account' style={styles.tabsFrame}>
      <TabsList aria-label='Vault settings'>
        <TabsTrigger value='account'>Gringotts Vault</TabsTrigger>
        <TabsTrigger value='keys'>Vault Keys</TabsTrigger>
      </TabsList>
      <TabsContent value='account'>Manage your vault at Gringotts.</TabsContent>
      <TabsContent value='keys'>Count the keys in your vault.</TabsContent>
    </Tabs>
  ),
  play: async ({ canvas }) => {
    // The panel is a tab stop (tabindex 0): Tab, then Tab again from the selected tab.
    await userEvent.tab()
    await userEvent.tab()
    await expectFocusIndicator(canvas.getByRole('tabpanel'))
  }
}

// audit-00002 F-03: the handle is the keyboard drag control, so it draws the ring.
export const SortableHandle: Story = {
  name: 'Sortable handle',
  render: () => {
    const [items, setItems] = useState(['Hedwig', 'Crookshanks', 'Scabbers'])
    return (
      <Sortable
        value={items}
        onValueChange={setItems}
        getItemValue={(item) => item}
        style={styles.list}
      >
        {items.map((item) => (
          <SortableItem key={item} value={item}>
            <div {...stylex.props(styles.row)}>
              <SortableItemHandle aria-label={`Move ${item}`}>
                <GripVertical size={16} />
              </SortableItemHandle>
              {item}
            </div>
          </SortableItem>
        ))}
      </Sortable>
    )
  },
  play: async ({ canvas }) => {
    await userEvent.tab()
    await expectFocusIndicator(canvas.getByRole('button', { name: 'Move Hedwig' }))
  }
}

// audit-00002 F-03: the handle is the keyboard drag control, so it draws the ring.
export const KanbanColumnHandleRing: Story = {
  name: 'Kanban column handle',
  render: () => {
    const [value, setValue] = useState<Record<string, string[]>>({
      Todo: ['Brew Polyjuice Potion', 'Decode the Voynich cryptex'],
      Doing: ['Find the Horcrux']
    })
    return (
      <Kanban value={value} onValueChange={setValue} getItemValue={(item) => item}>
        <KanbanBoard>
          {Object.keys(value).map((column) => (
            <KanbanColumn key={column} value={column}>
              <div {...stylex.props(styles.columnHeader)}>
                <span {...stylex.props(styles.columnTitle)}>{column}</span>
                <KanbanColumnHandle aria-label={`Reorder ${column}`}>
                  <GripVertical size={16} />
                </KanbanColumnHandle>
              </div>
              <KanbanColumnContent value={column}>
                {value[column]?.map((task) => (
                  <KanbanItem key={task} value={task}>
                    {task}
                  </KanbanItem>
                ))}
              </KanbanColumnContent>
            </KanbanColumn>
          ))}
        </KanbanBoard>
      </Kanban>
    )
  },
  play: async ({ canvas }) => {
    await userEvent.tab()
    await expectFocusIndicator(canvas.getByRole('button', { name: 'Reorder Todo' }))
  }
}
