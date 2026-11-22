import { Plus } from '@keyline-icons/react'
import type { Meta, StoryObj } from '@storybook/tanstack-react'
import atoms from '@stylexjs/atoms'
import * as stylex from '@stylexjs/stylex'
import * as React from 'react'
import { expect, fn, userEvent } from 'storybook/test'
import { radius } from '../../styles/tokens.stylex'
import { Button, LinkButton } from './button.component'
import { buttonSizes } from './button.stylex'

const meta = {
  title: 'Base Components/Button',
  component: Button,
  parameters: { layout: 'centered' },
  argTypes: {
    variant: {
      control: 'radio',
      options: ['primary', 'secondary', 'outline', 'ghost']
    },
    size: { control: 'radio', options: Object.keys(buttonSizes) },
    disabled: { control: 'boolean' }
  },
  tags: [], // ['autodocs']
  args: { onClick: fn() },
  decorators: [
    (Story) => (
      <div
        {...stylex.props(
          atoms.display.flex,
          atoms.justifyContent.center,
          atoms.padding['20px'],
          atoms.minWidth['448px'],
          atoms.width['100%']
        )}
      >
        <Story />
      </div>
    )
  ]
} satisfies Meta<typeof Button>

type Story = StoryObj<typeof meta>

const styles = stylex.create({
  icon: { width: 16, height: 16 },
  row: {
    alignItems: 'center',
    display: 'flex',
    flexWrap: 'wrap',
    gap: 8
  },
  rounded: { borderRadius: radius.full },
  pill: { borderRadius: radius.full },
  wide: { paddingInline: 48 }
})

export default meta

export const Playground: Story = {
  args: { variant: 'outline' },
  render: (args) => (
    <Button {...args}>
      <Plus {...stylex.props(styles.icon)} />
      New lecture
    </Button>
  )
}

export const Default: Story = {
  args: { variant: 'primary' },
  render: (args) => <Button {...args}>Expelliarmus</Button>
}

export const Secondary: Story = {
  args: { variant: 'secondary' },
  render: (args) => <Button {...args}>Protego</Button>
}

export const Outline: Story = {
  args: { variant: 'outline' },
  render: (args) => <Button {...args}>Petrificus Totalus</Button>
}

export const Ghost: Story = {
  args: { variant: 'ghost' },
  render: (args) => <Button {...args}>Moaning Myrtle</Button>
}

export const Critical: Story = {
  args: { tone: 'critical' },
  render: (args) => <Button {...args}>Avada Kedavra</Button>
}

export const CriticalQuiet: Story = {
  render: () => (
    <div {...stylex.props(styles.row)}>
      <Button variant='outline' tone='critical'>
        Obliviate
      </Button>
      <Button variant='ghost' tone='critical'>
        Confundo
      </Button>
    </div>
  )
}

export const Sizes: Story = {
  render: () => (
    <div {...stylex.props(styles.row)}>
      <Button size='xs' variant='outline'>
        Fairy
      </Button>
      <Button size='sm' variant='outline'>
        House-elf
      </Button>
      <Button size='md' variant='outline'>
        Wizard
      </Button>
      <Button size='lg' variant='outline'>
        Giant
      </Button>
    </div>
  )
}

export const Icon: Story = {
  render: () => (
    <Button size='icon-md' variant='outline' aria-label='Accio'>
      <Plus {...stylex.props(styles.icon)} />
    </Button>
  )
}

export const IconSizes: Story = {
  render: () => (
    <div {...stylex.props(styles.row)}>
      <Button size='icon-xs' variant='outline' aria-label='Accio'>
        <Plus {...stylex.props(styles.icon)} />
      </Button>
      <Button size='icon-sm' variant='outline' aria-label='Accio'>
        <Plus {...stylex.props(styles.icon)} />
      </Button>
      <Button size='icon-md' variant='outline' aria-label='Accio'>
        <Plus {...stylex.props(styles.icon)} />
      </Button>
      <Button size='icon-lg' variant='outline' aria-label='Accio'>
        <Plus {...stylex.props(styles.icon)} />
      </Button>
    </div>
  )
}

export const Loading: Story = {
  args: { onClick: fn() },
  render: (args) => (
    <Button {...args} loading>
      Apparating…
    </Button>
  ),
  play: async ({ args, canvas }) => {
    const button = canvas.getByRole('button', { name: 'Apparating…' })
    // Busy but not disabled: it keeps its name and stays in the tab order.
    await expect(button).toHaveAttribute('aria-busy', 'true')
    await userEvent.tab()
    await expect(button).toHaveFocus()
    await userEvent.click(button)
    await expect(args.onClick).not.toHaveBeenCalled()
    // The spinner is hidden from assistive technology: one name, no second live region.
    await expect(canvas.queryByRole('status')).toBeNull()
  }
}

/** The label holds the width, so a button does not change size when it starts loading. */
export const LoadingKeepsWidth: Story = {
  name: 'Loading keeps its width',
  render: () => {
    const [loading, setLoading] = React.useState(false)
    return (
      <Button loading={loading} onClick={() => setLoading(true)}>
        Cast the spell
      </Button>
    )
  },
  play: async ({ canvas }) => {
    const button = canvas.getByRole('button', { name: 'Cast the spell' })
    const width = button.getBoundingClientRect().width
    await userEvent.click(button)
    await expect(button).toHaveAttribute('aria-busy', 'true')
    await expect(button.getBoundingClientRect().width).toBe(width)
  }
}

export const Disabled: Story = {
  name: 'disabled',
  render: () => (
    <Button disabled variant='primary'>
      Petrified
    </Button>
  ),
  play: async ({ canvas }) => {
    const el = canvas.getAllByRole('button')[0]
    await expect(el).toBeDisabled()
  }
}

export const Rounded: Story = {
  render: () => <Button style={styles.rounded}>Golden Snitch</Button>
}

export const AsLink: Story = {
  name: 'as link',
  render: () => (
    <LinkButton variant='outline' render={<a href='#docs' />}>
      Read the Daily Prophet
    </LinkButton>
  ),
  play: async ({ canvas }) => {
    // Base UI gives a non-native button role="button"; a link button is announced as a link.
    const link = canvas.getByRole('link', { name: 'Read the Daily Prophet' })
    await expect(link).toHaveAttribute('href', '#docs')
    await expect(canvas.queryByRole('button', { name: 'Read the Daily Prophet' })).toBeNull()
  }
}

export const CurrentLink: Story = {
  name: 'as current link',
  render: () => (
    <LinkButton variant='ghost' size='sm' current render={<a href='#overview' />}>
      Overview
    </LinkButton>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('link', { name: 'Overview' })).toHaveAttribute(
      'aria-current',
      'page'
    )
  }
}

export const StyleOverride: Story = {
  name: 'style override',
  render: () => (
    <div {...stylex.props(styles.row)}>
      <Button style={styles.pill}>Time-Turner</Button>
      <Button variant='outline' style={[styles.pill, styles.wide]}>
        Time-Turner, extra wide
      </Button>
    </div>
  )
}

export const OnClick: StoryObj<{ handleClick: ReturnType<typeof fn> }> = {
  name: 'onClick',
  args: { handleClick: fn() },
  render: (args) => <Button onClick={args.handleClick}>Open the cryptex</Button>,
  play: async ({ canvas, args }) => {
    const { handleClick } = args
    const buttons = canvas.getAllByRole('button')
    const el = buttons[0]
    if (el) {
      await userEvent.click(el)
      await expect(el).toHaveAttribute('type', 'button')
      await expect(handleClick).toHaveBeenCalledTimes(1)
    }
  }
}
