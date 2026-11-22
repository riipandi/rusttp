import { Bell as BellIcon, User } from '@keyline-icons/react'
import type { Meta, StoryObj } from '@storybook/tanstack-react'
import atoms from '@stylexjs/atoms'
import * as stylex from '@stylexjs/stylex'
import { expect, userEvent } from 'storybook/test'
import {
  denseControlHeights,
  denseControlSizeNames,
  expectControlHeights
} from '../../contracts/control-sizes'
import { Axis } from '../../contracts/story-axes'
import { container } from '../../styles/tokens.stylex'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './tabs.component'

const meta = {
  title: 'Base Components/Tabs',
  component: Tabs,
  parameters: { layout: 'fullscreen' },
  argTypes: {
    orientation: { control: 'radio', options: ['horizontal', 'vertical'] }
  },
  tags: [], // ['autodocs']
  decorators: [
    (Story) => (
      <div {...stylex.props(atoms.padding['20px'], atoms.minWidth['448px'], atoms.width['100%'])}>
        <Story />
      </div>
    )
  ]
} satisfies Meta<typeof Tabs>

type Story = StoryObj<typeof meta>

const styles = stylex.create({
  tabs: {
    width: container.large
  },
  trigger: {
    alignItems: 'center',
    display: 'inline-flex',
    gap: 6
  },
  icon: { width: 16, height: 16 }
})

export default meta

export const Playground: Story = {
  args: { defaultValue: 'account' },
  render: (args) => (
    <Tabs {...args} style={styles.tabs}>
      <TabsList>
        <TabsTrigger value='account'>Gringotts Vault</TabsTrigger>
        <TabsTrigger value='password'>Vault Password</TabsTrigger>
      </TabsList>
      <TabsContent value='account'>Manage your vault at Gringotts.</TabsContent>
      <TabsContent value='password'>Change the password to your vault.</TabsContent>
    </Tabs>
  ),
  play: async ({ canvas }) => {
    const account = canvas.getByRole('tab', { name: 'Gringotts Vault' })
    const password = canvas.getByRole('tab', { name: 'Vault Password' })

    await expect(account).toHaveAttribute('aria-selected', 'true')
    await expect(canvas.getByText('Manage your vault at Gringotts.')).toBeInTheDocument()

    // Clicking a trigger swaps the visible panel.
    await userEvent.click(password)
    await expect(password).toHaveAttribute('aria-selected', 'true')
    await expect(account).toHaveAttribute('aria-selected', 'false')
    await expect(canvas.getByText('Change the password to your vault.')).toBeInTheDocument()
  }
}

export const Line: Story = {
  name: 'Line variant',
  args: { defaultValue: 'overview' },
  render: (args) => (
    <Tabs {...args}>
      <TabsList variant='line'>
        <TabsTrigger value='overview'>Daily Prophet</TabsTrigger>
        <TabsTrigger value='analytics'>The Quibbler</TabsTrigger>
        <TabsTrigger value='reports'>Ministry Briefings</TabsTrigger>
      </TabsList>
      <TabsContent value='overview'>The latest from the Daily Prophet.</TabsContent>
      <TabsContent value='analytics'>Theories from Luna Lovegood.</TabsContent>
      <TabsContent value='reports'>Notices from the Ministry of Magic.</TabsContent>
    </Tabs>
  )
}

export const Disabled: Story = {
  name: 'Disabled tab',
  args: { defaultValue: 'active' },
  render: (args) => (
    <Tabs {...args} style={styles.tabs}>
      <TabsList>
        <TabsTrigger value='active'>Hogsmeade</TabsTrigger>
        <TabsTrigger value='disabled' disabled>
          Azkaban
        </TabsTrigger>
      </TabsList>
      <TabsContent value='active'>The other tab is locked away in Azkaban.</TabsContent>
    </Tabs>
  ),
  play: async ({ canvas }) => {
    const locked = canvas.getByRole('tab', { name: 'Azkaban' })
    await expect(locked).toHaveAttribute('data-disabled')

    await userEvent.click(locked)
    await expect(locked).toHaveAttribute('aria-selected', 'false')
    await expect(canvas.getByRole('tab', { name: 'Hogsmeade' })).toHaveAttribute(
      'aria-selected',
      'true'
    )
  }
}

export const Vertical: Story = {
  args: { defaultValue: 'profile', orientation: 'vertical' },
  render: (args) => (
    <Tabs {...args} style={styles.tabs}>
      <TabsList>
        <TabsTrigger value='profile'>Prefect</TabsTrigger>
        <TabsTrigger value='account'>Gringotts Vault</TabsTrigger>
        <TabsTrigger value='notifications'>Owl Post</TabsTrigger>
      </TabsList>
      <TabsContent value='profile'>Update your name at Hogwarts.</TabsContent>
      <TabsContent value='account'>Manage your vault details.</TabsContent>
      <TabsContent value='notifications'>Choose which owls you receive.</TabsContent>
    </Tabs>
  )
}

export const Icons: Story = {
  args: { defaultValue: 'account' },
  render: (args) => (
    <Tabs {...args} style={styles.tabs}>
      <TabsList>
        <TabsTrigger value='account' style={styles.trigger}>
          <User {...stylex.props(styles.icon)} />
          Wizard Profile
        </TabsTrigger>
        <TabsTrigger value='notifications' style={styles.trigger}>
          <BellIcon {...stylex.props(styles.icon)} />
          Owl Post
        </TabsTrigger>
      </TabsList>
      <TabsContent value='account'>Update your wizard profile.</TabsContent>
      <TabsContent value='notifications'>Manage your owl post preferences.</TabsContent>
    </Tabs>
  )
}

export const ControlSizes: Story = {
  render: () => (
    <Axis axis='size' rows={denseControlSizeNames}>
      {(size) => (
        <Tabs defaultValue='one'>
          <TabsList size={size}>
            <TabsTrigger value='one'>Charms</TabsTrigger>
            <TabsTrigger value='two'>Potions</TabsTrigger>
          </TabsList>
        </Tabs>
      )}
    </Axis>
  ),
  // The list, tab padding included, is as tall as a control of its size.
  play: async ({ canvasElement }) => {
    await expectControlHeights(canvasElement, denseControlHeights)
  }
}

export const LineControlSizes: Story = {
  render: () => (
    <Axis axis='size' rows={denseControlSizeNames}>
      {(size) => (
        <Tabs defaultValue='one'>
          <TabsList size={size} variant='line'>
            <TabsTrigger value='one'>Charms</TabsTrigger>
            <TabsTrigger value='two'>Potions</TabsTrigger>
          </TabsList>
        </Tabs>
      )}
    </Axis>
  ),
  // The active tab's bar overlaps the list's bottom border, so the list is as tall as the tab.
  play: async ({ canvasElement }) => {
    await expectControlHeights(canvasElement, denseControlHeights)
  }
}

export const Keyboard: Story = {
  args: { defaultValue: 'account' },
  render: (args) => (
    <Tabs {...args} style={styles.tabs}>
      <TabsList aria-label='Vault settings'>
        <TabsTrigger value='account'>Gringotts Vault</TabsTrigger>
        <TabsTrigger value='password'>Vault Password</TabsTrigger>
        <TabsTrigger value='keys'>Vault Keys</TabsTrigger>
      </TabsList>
      <TabsContent value='account'>Manage your vault at Gringotts.</TabsContent>
      <TabsContent value='password'>Change the password to your vault.</TabsContent>
      <TabsContent value='keys'>Count the keys in your vault.</TabsContent>
    </Tabs>
  ),
  play: async ({ canvas }) => {
    const account = canvas.getByRole('tab', { name: 'Gringotts Vault' })
    const password = canvas.getByRole('tab', { name: 'Vault Password' })
    const keys = canvas.getByRole('tab', { name: 'Vault Keys' })

    // Tab enters the list on the selected tab; the arrow keys move focus along it.
    await userEvent.tab()
    await expect(account).toHaveFocus()
    await userEvent.keyboard('{ArrowRight}')
    await expect(password).toHaveFocus()
    // Focus moves first; Enter selects.
    await userEvent.keyboard('{Enter}')
    await expect(password).toHaveAttribute('aria-selected', 'true')
    await userEvent.keyboard('{End}')
    await expect(keys).toHaveFocus()
    await userEvent.keyboard('{Home}')
    await expect(account).toHaveFocus()
  }
}
