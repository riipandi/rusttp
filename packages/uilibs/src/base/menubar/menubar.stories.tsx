import type { Meta, StoryObj } from '@storybook/tanstack-react'
import type { ComponentProps } from 'react'
import { expect, userEvent, waitFor, within } from 'storybook/test'
import {
  controlSizeNames,
  expectControlHeights,
  expectHighlightedItem
} from '../../contracts/control-sizes'
import { pressUntil } from '../../contracts/keyboard'
import { gone } from '../../contracts/overlay'
import { Axis } from '../../contracts/story-axes'
import { controlSizes } from '../../styles/control.stylex'
import {
  Menubar,
  MenubarCheckboxItem,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarRadioGroup,
  MenubarRadioItem,
  MenubarSeparator,
  MenubarShortcut,
  MenubarSub,
  MenubarSubContent,
  MenubarSubTrigger,
  MenubarTrigger
} from './menubar.component'

const meta = {
  title: 'Base Components/Menubar',
  component: Menubar,
  tags: [] // ['autodocs']
} satisfies Meta<typeof Menubar>

type Story = StoryObj<typeof meta>

export default meta

// F-12: axe fails the menubar in WebKit only (Base UI's focus guards), so the nightly WebKit run skips it.
// The popup placement lives on `MenubarContent`, so its props reach the story as args beside the bar's.
type PlaygroundArgs = ComponentProps<typeof Menubar> &
  Pick<ComponentProps<typeof MenubarContent>, 'side' | 'sideOffset' | 'align' | 'alignOffset'>

export const Playground: StoryObj<PlaygroundArgs> = {
  tags: ['skip-webkit'],
  parameters: {
    controls: {
      disable: false,
      include: [
        'size',
        'disabled',
        'loopFocus',
        'modal',
        'side',
        'sideOffset',
        'align',
        'alignOffset'
      ]
    },
    docs: {
      source: {
        code: `<Menubar size='medium'>
  <MenubarMenu>
    <MenubarTrigger>Grimoire</MenubarTrigger>
    <MenubarContent
          side={side}
          sideOffset={sideOffset}
          align={align}
          alignOffset={alignOffset}
        >
      <MenubarItem>
        New scroll
        <MenubarShortcut>⌘T</MenubarShortcut>
      </MenubarItem>
      <MenubarSeparator />
      <MenubarSub>
        <MenubarSubTrigger>Dispatch</MenubarSubTrigger>
        <MenubarSubContent>
          <MenubarItem>Send by owl</MenubarItem>
        </MenubarSubContent>
      </MenubarSub>
    </MenubarContent>
  </MenubarMenu>
  <MenubarMenu>
    <MenubarTrigger>Divination</MenubarTrigger>
    <MenubarContent
          side={side}
          sideOffset={sideOffset}
          align={align}
          alignOffset={alignOffset}
        >
      <MenubarCheckboxItem defaultChecked>Always show full incantations</MenubarCheckboxItem>
      <MenubarRadioGroup defaultValue='gryffindor'>
        <MenubarRadioItem value='gryffindor'>Gryffindor</MenubarRadioItem>
        <MenubarRadioItem value='slytherin'>Slytherin</MenubarRadioItem>
      </MenubarRadioGroup>
    </MenubarContent>
  </MenubarMenu>
</Menubar>`
      }
    }
  },
  argTypes: {
    size: { control: 'radio', options: Object.keys(controlSizes) },
    disabled: { control: 'boolean' },
    loopFocus: { control: 'boolean' },
    modal: { control: 'boolean' },
    side: { control: 'select', options: ['top', 'right', 'bottom', 'left'] },
    sideOffset: { control: 'number' },
    align: { control: 'radio', options: ['start', 'center', 'end'] },
    alignOffset: { control: 'number' }
  },
  args: {
    size: 'medium',
    disabled: false,
    loopFocus: true,
    modal: true,
    side: 'bottom',
    sideOffset: 8,
    align: 'start',
    alignOffset: -4
  },
  render: ({ side, sideOffset, align, alignOffset, ...args }) => (
    <Menubar {...args}>
      <MenubarMenu>
        <MenubarTrigger>Grimoire</MenubarTrigger>
        <MenubarContent side={side} sideOffset={sideOffset} align={align} alignOffset={alignOffset}>
          <MenubarItem>
            New scroll
            <MenubarShortcut>⌘T</MenubarShortcut>
          </MenubarItem>
          <MenubarItem>
            New parchment
            <MenubarShortcut>⌘N</MenubarShortcut>
          </MenubarItem>
          <MenubarSeparator />
          <MenubarSub>
            <MenubarSubTrigger>Dispatch</MenubarSubTrigger>
            <MenubarSubContent>
              <MenubarItem>Send by owl</MenubarItem>
              <MenubarItem>Message Bezu Fache</MenubarItem>
            </MenubarSubContent>
          </MenubarSub>
          <MenubarSeparator />
          <MenubarItem>
            Transcribe…
            <MenubarShortcut>⌘P</MenubarShortcut>
          </MenubarItem>
        </MenubarContent>
      </MenubarMenu>
      <MenubarMenu>
        <MenubarTrigger>Cryptex</MenubarTrigger>
        <MenubarContent side={side} sideOffset={sideOffset} align={align} alignOffset={alignOffset}>
          <MenubarItem>
            Rotate dial left
            <MenubarShortcut>⌘Z</MenubarShortcut>
          </MenubarItem>
          <MenubarItem>
            Rotate dial right
            <MenubarShortcut>⇧⌘Z</MenubarShortcut>
          </MenubarItem>
        </MenubarContent>
      </MenubarMenu>
      <MenubarMenu>
        <MenubarTrigger>Divination</MenubarTrigger>
        <MenubarContent side={side} sideOffset={sideOffset} align={align} alignOffset={alignOffset}>
          <MenubarCheckboxItem defaultChecked>
            Always show the Marauder&apos;s Map bar
          </MenubarCheckboxItem>
          <MenubarCheckboxItem>Always show full incantations</MenubarCheckboxItem>
          <MenubarSeparator />
          <MenubarRadioGroup defaultValue='andy'>
            <MenubarRadioItem value='andy'>Gryffindor</MenubarRadioItem>
            <MenubarRadioItem value='benoit'>Slytherin</MenubarRadioItem>
          </MenubarRadioGroup>
        </MenubarContent>
      </MenubarMenu>
    </Menubar>
  ),
  play: async ({ canvas }) => {
    const body = within(document.body)

    // Clicking a trigger opens its dropdown. Menubar triggers render as
    // menuitem elements inside the menubar role.
    await userEvent.click(canvas.getByRole('menuitem', { name: 'Grimoire' }))
    await body.findByRole('menu')
    await expect(body.getByRole('menuitem', { name: /new scroll/i })).toBeInTheDocument()

    // A highlighted item draws its state. The pointer sets it as the arrows do, and a test of the
    // arrows is in the DropdownMenu `Keyboard` story.
    await userEvent.hover(body.getByRole('menuitem', { name: /new scroll/i }))
    await expectHighlightedItem(body.getByRole('menuitem', { name: /new scroll/i }))

    // Submenus open from their trigger.
    await userEvent.click(body.getByRole('menuitem', { name: /dispatch/i }))
    await waitFor(() =>
      expect(body.getByRole('menuitem', { name: 'Send by owl' })).toBeInTheDocument()
    )

    // The first Escape closes the submenu, the second the root menu.
    await userEvent.keyboard('{Escape}')
    await waitFor(() => expect(body.queryByRole('menuitem', { name: 'Send by owl' })).toBeNull())
    await userEvent.keyboard('{Escape}')
    await waitFor(() => expect(body.queryByRole('menu')).toBeNull())

    // The radio group switches exclusively inside the third dropdown.
    await userEvent.click(canvas.getByRole('menuitem', { name: 'Divination' }))
    await body.findByRole('menu')
    await userEvent.click(body.getByRole('menuitemradio', { name: 'Slytherin' }))
    await expect(body.getByRole('menuitemradio', { name: 'Slytherin' })).toHaveAttribute(
      'aria-checked',
      'true'
    )
    await expect(body.getByRole('menuitemradio', { name: 'Gryffindor' })).toHaveAttribute(
      'aria-checked',
      'false'
    )
  }
}

export const Checkbox: Story = {
  parameters: {
    docs: {
      source: {
        code: `<Menubar>
  <MenubarMenu>
    <MenubarTrigger>Divination</MenubarTrigger>
    <MenubarContent>
      <MenubarCheckboxItem defaultChecked>Always show the Marauder's Map bar</MenubarCheckboxItem>
      <MenubarCheckboxItem>Always show full incantations</MenubarCheckboxItem>
      <MenubarSeparator />
      <MenubarCheckboxItem>Show crystal ball preview</MenubarCheckboxItem>
    </MenubarContent>
  </MenubarMenu>
</Menubar>`
      }
    }
  },
  name: 'Checkbox items',
  render: () => (
    <Menubar>
      <MenubarMenu>
        <MenubarTrigger>Divination</MenubarTrigger>
        <MenubarContent>
          <MenubarCheckboxItem defaultChecked>
            Always show the Marauder&apos;s Map bar
          </MenubarCheckboxItem>
          <MenubarCheckboxItem>Always show full incantations</MenubarCheckboxItem>
          <MenubarSeparator />
          <MenubarCheckboxItem>Show crystal ball preview</MenubarCheckboxItem>
        </MenubarContent>
      </MenubarMenu>
    </Menubar>
  )
}

export const Radio: Story = {
  name: 'Radio group',
  render: () => (
    <Menubar>
      <MenubarMenu>
        <MenubarTrigger>Ministry staff</MenubarTrigger>
        <MenubarContent>
          <MenubarRadioGroup defaultValue='andy'>
            <MenubarRadioItem value='andy'>Harry</MenubarRadioItem>
            <MenubarRadioItem value='benoit'>Ron</MenubarRadioItem>
            <MenubarRadioItem value='luis'>Hermione</MenubarRadioItem>
          </MenubarRadioGroup>
        </MenubarContent>
      </MenubarMenu>
    </Menubar>
  )
}

export const Submenu: Story = {
  render: () => (
    <Menubar>
      <MenubarMenu>
        <MenubarTrigger>Grimoire</MenubarTrigger>
        <MenubarContent>
          <MenubarItem>New scroll</MenubarItem>
          <MenubarSub>
            <MenubarSubTrigger>Dispatch</MenubarSubTrigger>
            <MenubarSubContent>
              <MenubarItem>Send by owl</MenubarItem>
              <MenubarItem>Message Bezu Fache</MenubarItem>
              <MenubarSeparator />
              <MenubarItem>Copy incantation</MenubarItem>
            </MenubarSubContent>
          </MenubarSub>
        </MenubarContent>
      </MenubarMenu>
    </Menubar>
  )
}

export const Sizes: Story = {
  parameters: {
    docs: {
      source: {
        code: `<Menubar size='large'>
  <MenubarMenu>
    <MenubarTrigger>Grimoire</MenubarTrigger>
    <MenubarContent>
      <MenubarItem>New scroll</MenubarItem>
    </MenubarContent>
  </MenubarMenu>
  <MenubarMenu>
    <MenubarTrigger>Marauder's Map</MenubarTrigger>
    <MenubarContent>
      <MenubarItem>Solemnly swear</MenubarItem>
    </MenubarContent>
  </MenubarMenu>
</Menubar>`
      }
    }
  },
  render: () => (
    <Axis axis='size' rows={controlSizeNames}>
      {(size) => (
        <Menubar size={size}>
          <MenubarMenu>
            <MenubarTrigger>Grimoire</MenubarTrigger>
            <MenubarContent>
              <MenubarItem>New scroll</MenubarItem>
            </MenubarContent>
          </MenubarMenu>
          <MenubarMenu>
            <MenubarTrigger>Marauder&apos;s Map</MenubarTrigger>
            <MenubarContent>
              <MenubarItem>Solemnly swear</MenubarItem>
            </MenubarContent>
          </MenubarMenu>
        </Menubar>
      )}
    </Axis>
  ),
  play: async ({ canvasElement }) => await expectControlHeights(canvasElement)
}

function Bar({ defaultOpen }: { defaultOpen?: boolean }) {
  return (
    <Menubar>
      <MenubarMenu defaultOpen={defaultOpen}>
        <MenubarTrigger>Grimoire</MenubarTrigger>
        <MenubarContent>
          <MenubarItem>New scroll</MenubarItem>
          <MenubarItem>New parchment</MenubarItem>
          <MenubarSub>
            <MenubarSubTrigger>Dispatch</MenubarSubTrigger>
            <MenubarSubContent>
              <MenubarItem>Send by owl</MenubarItem>
            </MenubarSubContent>
          </MenubarSub>
        </MenubarContent>
      </MenubarMenu>
      <MenubarMenu>
        <MenubarTrigger>Cryptex</MenubarTrigger>
        <MenubarContent>
          <MenubarItem>Rotate dial left</MenubarItem>
          <MenubarItem>Rotate dial right</MenubarItem>
        </MenubarContent>
      </MenubarMenu>
    </Menubar>
  )
}

// F-12: the open popup brings Base UI's focus guards, which axe fails in WebKit only.
// The a11y gate runs after `play`, when a menu a play opened has closed again: this story keeps
// the first menu open so the gate checks it.
export const Open: Story = {
  tags: ['skip-webkit'],
  render: () => <Bar defaultOpen />,
  play: async () => {
    const menu = await within(document.body).findByRole('menu')
    await waitFor(() => expect(menu).toBeVisible())
    await expect(within(menu).getByRole('menuitem', { name: 'New scroll' })).toBeVisible()
  }
}

/** Tab enters the bar once, the arrows move between the triggers, and Enter, Space, or ArrowDown opens a menu. */
export const Keyboard: Story = {
  render: () => <Bar />,
  play: async ({ canvas }) => {
    const body = within(document.body)
    const grimoire = canvas.getByRole('menuitem', { name: 'Grimoire' })
    const cryptex = canvas.getByRole('menuitem', { name: 'Cryptex' })
    const popup = () => body.queryByRole('menu')

    // Tab enters the bar on the first trigger.
    await userEvent.tab()
    await waitFor(() => expect(grimoire).toHaveFocus())

    // ArrowRight and ArrowLeft move between the triggers.
    await pressUntil('{ArrowRight}', () => expect(cryptex).toHaveFocus(), {
      when: () => document.activeElement === grimoire
    })
    await pressUntil('{ArrowLeft}', () => expect(grimoire).toHaveFocus(), {
      when: () => document.activeElement === cryptex
    })

    // Enter opens the focused trigger's menu, and Escape closes it and returns focus.
    await pressUntil('{Enter}', () => expect(body.getByRole('menu')).toBeVisible(), {
      when: () => !body.queryByRole('menu')
    })
    await pressUntil('{Escape}', gone(popup))
    await waitFor(() => expect(grimoire).toHaveFocus())

    // Space and ArrowDown open it too.
    await pressUntil(' ', () => expect(body.getByRole('menu')).toBeVisible(), {
      when: () => !body.queryByRole('menu')
    })
    await pressUntil('{Escape}', gone(popup))
    await waitFor(() => expect(grimoire).toHaveFocus())
    await pressUntil('{ArrowDown}', () => expect(body.getByRole('menu')).toBeVisible(), {
      when: () => !body.queryByRole('menu')
    })

    // Inside an open menu the arrows move the highlight: Home pins its start.
    const highlightedName = () =>
      body.queryAllByRole('menuitem').find((item) => item.hasAttribute('data-highlighted'))
        ?.textContent ?? null
    await pressUntil('{Home}', () => expect(highlightedName()).toBe('New scroll'))
    await pressUntil('{ArrowDown}', () => expect(highlightedName()).toBe('New parchment'), {
      when: () => highlightedName() === 'New scroll'
    })

    // Escape closes the menu and returns focus to its trigger.
    await pressUntil('{Escape}', gone(popup))
    await waitFor(() => expect(grimoire).toHaveFocus())
  }
}
