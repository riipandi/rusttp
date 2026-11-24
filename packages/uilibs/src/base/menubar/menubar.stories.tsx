import type { Meta, StoryObj } from '@storybook/tanstack-react'
import { expect, userEvent, waitFor, within } from 'storybook/test'
import { controlSizeNames, expectControlHeights } from '../../contracts/control-sizes'
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
export const Playground: Story = {
  tags: ['skip-webkit'],
  parameters: { controls: { disable: false, include: ['size', 'disabled', 'loopFocus'] } },
  argTypes: {
    size: { control: 'radio', options: Object.keys(controlSizes) },
    disabled: { control: 'boolean' },
    loopFocus: { control: 'boolean' }
  },
  args: { size: 'md', disabled: false, loopFocus: true },
  render: (args) => (
    <Menubar {...args}>
      <MenubarMenu>
        <MenubarTrigger>Grimoire</MenubarTrigger>
        <MenubarContent>
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
        <MenubarContent>
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
        <MenubarContent>
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
