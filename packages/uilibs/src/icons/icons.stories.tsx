import { CircleMinus, CirclePlus } from '@keyline-icons/react'
import type { Meta, StoryObj } from '@storybook/tanstack-react'
import atoms from '@stylexjs/atoms'
import * as stylex from '@stylexjs/stylex'
import { expect } from 'storybook/test'
import { Button } from '../base/button'
import { colors } from '../styles/colors.stylex'
import { fontSize, fontWeight } from '../styles/tokens.stylex'
import { FacebookIcon, GitHubIcon, GoogleIcon, InstagramIcon } from './index'
import { LinkedInIcon, TelegramIcon, WhatsAppIcon, XIcon } from './index'

const icons = [
  { name: 'GitHub', component: GitHubIcon },
  { name: 'Google', component: GoogleIcon },
  { name: 'Facebook', component: FacebookIcon },
  { name: 'X (Twitter)', component: XIcon },
  { name: 'Instagram', component: InstagramIcon },
  { name: 'LinkedIn', component: LinkedInIcon },
  { name: 'Telegram', component: TelegramIcon },
  { name: 'WhatsApp', component: WhatsAppIcon }
] as const

const meta = {
  title: 'Extra Components/Icons',
  tags: []
} satisfies Meta

export default meta
type Story = StoryObj<PlaygroundArgs>

interface PlaygroundArgs {
  size?: number
  color?: string
}

function PlaygroundComponent({ size = 24, color }: PlaygroundArgs) {
  return (
    <div {...stylex.props(atoms.display.flex, atoms.alignItems.center, atoms.gap['1rem'])}>
      <GitHubIcon size={size} color={color} />
      <XIcon size={size} color={color} />
      <GoogleIcon size={size} />
      <WhatsAppIcon size={size} />
    </div>
  )
}

export const Playground: Story = {
  parameters: { controls: { disable: false, include: ['size', 'color'] } },
  argTypes: {
    size: { control: { type: 'range', min: 12, max: 64, step: 4 } },
    color: { control: 'color' }
  },
  args: { size: 24, color: undefined },
  render: (args) => <PlaygroundComponent {...args} />
}

export const Gallery: Story = {
  parameters: {
    controls: { disable: true },
    docs: {
      source: {
        code: `<GitHubIcon size={20} />
<GoogleIcon size={20} />
<XIcon size={20} />`
      }
    }
  },
  render: () => (
    <div
      {...stylex.props(
        atoms.display.flex,
        atoms.flexWrap.wrap,
        atoms.justifyContent.center,
        atoms.alignItems.center,
        atoms.gap['1.5rem']
      )}
    >
      {icons.map(({ name, component: Icon }) => (
        <div
          key={name}
          {...stylex.props(
            atoms.display.flex,
            atoms.flexDirection.column,
            atoms.alignItems.center,
            atoms.gap['0.5rem']
          )}
        >
          <Icon size={20} />
          <span
            {...stylex.props(
              atoms.fontSize[fontSize.caption1],
              atoms.color[colors.foregroundNeutralFaded]
            )}
          >
            {name}
          </span>
        </div>
      ))}
    </div>
  ),
  // Each brand icon is an image named for the brand, so a bare icon is never silent.
  play: async ({ canvas }) => {
    for (const { name } of icons) {
      const label = name === 'X (Twitter)' ? 'X' : name
      await expect(canvas.getByRole('img', { name: label })).toBeInTheDocument()
    }
  }
}

const sizeSteps = [16, 20, 24, 32, 48] as const

export const Sizes: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div {...stylex.props(atoms.display.flex, atoms.flexDirection.column, atoms.gap['1.5rem'])}>
      {icons.slice(0, 4).map(({ name, component: Icon }) => (
        <div
          key={name}
          {...stylex.props(atoms.display.flex, atoms.alignItems.center, atoms.gap['0.75rem'])}
        >
          <span
            {...stylex.props(
              atoms.minWidth['4rem'],
              atoms.fontSize[fontSize.caption1],
              atoms.fontWeight[fontWeight.semibold],
              atoms.color[colors.foregroundNeutralFaded]
            )}
          >
            {name}
          </span>
          <CircleMinus {...stylex.props(atoms.margin['0 1rem'])} />
          {sizeSteps.map((s) => (
            <Icon key={s} size={s} />
          ))}
          <CirclePlus {...stylex.props(atoms.margin['0 1rem'])} />
        </div>
      ))}
    </div>
  )
}

export const Raw: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div
      {...stylex.props(
        atoms.display.flex,
        atoms.flexWrap.wrap,
        atoms.alignItems.center,
        atoms.justifyContent.center,
        atoms.gap['1rem']
      )}
    >
      {icons.map(({ name, component: Icon }) => (
        <Icon key={name} size={32} />
      ))}
    </div>
  )
}

export const InContext: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div {...stylex.props(atoms.display.flex, atoms.alignItems.center, atoms.gap['0.75rem'])}>
      <GitHubIcon size={16} color={colors.foregroundNeutralFaded} />
      <GoogleIcon size={16} color={colors.foregroundNeutralFaded} />
      <FacebookIcon size={16} color={colors.foregroundNeutralFaded} />
      <XIcon size={16} color={colors.foregroundNeutralFaded} />
      <InstagramIcon size={16} color={colors.foregroundNeutralFaded} />
      <LinkedInIcon size={16} color={colors.foregroundNeutralFaded} />
      <TelegramIcon size={16} color={colors.foregroundNeutralFaded} />
      <WhatsAppIcon size={16} color={colors.foregroundNeutralFaded} />
    </div>
  )
}

/** Beside a visible label an icon is decoration: hide it, and the button's name is its text. */
export const InButton: Story = {
  name: 'In a button',
  parameters: {
    controls: { disable: true },
    docs: {
      source: {
        code: `<Button variant='outline'>
  <GitHubIcon size={18} aria-hidden='true' />
  Continue with GitHub
</Button>`
      }
    }
  },
  render: () => (
    <Button variant='outline'>
      <GitHubIcon size={18} aria-hidden='true' />
      Continue with GitHub
    </Button>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('button', { name: 'Continue with GitHub' })).toBeInTheDocument()
    // `aria-hidden` removes the icon's own `GitHub` name, so the button is not read twice.
    await expect(canvas.queryByRole('img', { name: 'GitHub' })).toBeNull()
  }
}
