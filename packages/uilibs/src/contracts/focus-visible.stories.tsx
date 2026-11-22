import { GripVertical } from '@keyline-icons/react'
import type { Meta, StoryObj } from '@storybook/tanstack-react'
import { useState } from 'react'
import { expect, userEvent } from 'storybook/test'
import { Button } from '../base/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../base/tabs'
import {
  Kanban,
  KanbanBoard,
  KanbanColumn,
  KanbanColumnContent,
  KanbanColumnHandle
} from '../extra/kanban'
import { Sortable, SortableItem, SortableItemHandle } from '../extra/sortable'

const meta = {
  title: 'Contracts/Focus is visible',
  parameters: {
    layout: 'centered',
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

// audit-00002 F-02: the story is excluded from the run (`!test`) until the fix lands; remove the tag to reproduce.
export const TabsPanel: Story = {
  name: 'Tabs panel',
  tags: ['!test'],
  render: () => (
    <Tabs defaultValue='account'>
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

// audit-00002 F-03: see TabsPanel.
export const SortableHandle: Story = {
  name: 'Sortable handle',
  tags: ['!test'],
  render: () => {
    const [items, setItems] = useState(['Hedwig', 'Crookshanks', 'Scabbers'])
    return (
      <Sortable value={items} onValueChange={setItems} getItemValue={(item) => item}>
        {items.map((item) => (
          <SortableItem key={item} value={item}>
            <SortableItemHandle aria-label={`Move ${item}`}>
              <GripVertical size={16} />
            </SortableItemHandle>
            {item}
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

// audit-00002 F-03: see TabsPanel.
export const KanbanColumnHandleRing: Story = {
  name: 'Kanban column handle',
  tags: ['!test'],
  render: () => {
    const [value, setValue] = useState<Record<string, string[]>>({
      Todo: ['Brew Polyjuice Potion'],
      Doing: ['Find the Horcrux']
    })
    return (
      <Kanban value={value} onValueChange={setValue} getItemValue={(item) => item}>
        <KanbanBoard>
          {Object.keys(value).map((column) => (
            <KanbanColumn key={column} value={column}>
              {column}
              <KanbanColumnHandle aria-label={`Reorder ${column}`}>
                <GripVertical size={16} />
              </KanbanColumnHandle>
              <KanbanColumnContent value={column}>{null}</KanbanColumnContent>
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
