import type { Meta, StoryObj } from '@storybook/tanstack-react'
import * as stylex from '@stylexjs/stylex'
import { expect, userEvent, waitFor, within } from 'storybook/test'
import { pressUntil } from '../../contracts/keyboard'
import { colors } from '../../styles/colors.stylex'
import { container, fontSize, fontWeight, unit } from '../../styles/tokens.stylex'
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger
} from './navigation-menu.component'

const meta = {
  title: 'Base Components/NavigationMenu',
  component: NavigationMenu,
  tags: [] // ['autodocs']
} satisfies Meta<typeof NavigationMenu>

type Story = StoryObj<typeof meta>

const styles = stylex.create({
  panel: {
    display: 'flex',
    flexDirection: 'column',
    gap: unit.x1,
    width: container.medium
  },
  linkBody: {
    display: 'flex',
    flexDirection: 'column',
    gap: unit.x1
  },
  linkTitle: {
    fontSize: fontSize.body2,
    fontWeight: fontWeight.medium
  },
  linkText: {
    color: colors.foregroundNeutralFaded,
    fontSize: fontSize.caption1
  }
})

export default meta

export const Playground: Story = {
  parameters: {
    controls: { disable: false, include: ['align', 'delay', 'closeDelay'] },
    docs: {
      source: {
        code: `<NavigationMenu align='start'>
  <NavigationMenuList>
    <NavigationMenuItem>
      <NavigationMenuTrigger>First year at Hogwarts</NavigationMenuTrigger>
      <NavigationMenuContent>
        <NavigationMenuLink href='#'>Platform Nine and Three-Quarters</NavigationMenuLink>
        <NavigationMenuLink href='#'>Diagon Alley</NavigationMenuLink>
      </NavigationMenuContent>
    </NavigationMenuItem>
    <NavigationMenuItem>
      <NavigationMenuTrigger>Codebreaking</NavigationMenuTrigger>
      <NavigationMenuContent>
        <NavigationMenuLink href='#'>Cryptex</NavigationMenuLink>
        <NavigationMenuLink href='#'>Keystone</NavigationMenuLink>
      </NavigationMenuContent>
    </NavigationMenuItem>
    <NavigationMenuItem>
      <NavigationMenuLink href='#'>Library</NavigationMenuLink>
    </NavigationMenuItem>
  </NavigationMenuList>
</NavigationMenu>`
      }
    }
  },
  argTypes: {
    align: { control: 'radio', options: ['start', 'center', 'end'] },
    delay: { control: 'number' },
    closeDelay: { control: 'number' }
  },
  args: { align: 'start' },
  render: (args) => (
    <NavigationMenu {...args}>
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuTrigger>First year at Hogwarts</NavigationMenuTrigger>
          <NavigationMenuContent>
            <div {...stylex.props(styles.panel)}>
              <NavigationMenuLink href='#'>
                <div {...stylex.props(styles.linkBody)}>
                  <span {...stylex.props(styles.linkTitle)}>Platform Nine and Three-Quarters</span>
                  <span {...stylex.props(styles.linkText)}>
                    Run straight at the barrier between platforms nine and ten.
                  </span>
                </div>
              </NavigationMenuLink>
              <NavigationMenuLink href='#'>
                <div {...stylex.props(styles.linkBody)}>
                  <span {...stylex.props(styles.linkTitle)}>Diagon Alley</span>
                  <span {...stylex.props(styles.linkText)}>
                    Tap the third brick from the left above the dustbin.
                  </span>
                </div>
              </NavigationMenuLink>
            </div>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuTrigger>Codebreaking</NavigationMenuTrigger>
          <NavigationMenuContent>
            <div {...stylex.props(styles.panel)}>
              <NavigationMenuLink href='#'>
                <div {...stylex.props(styles.linkBody)}>
                  <span {...stylex.props(styles.linkTitle)}>Cryptex</span>
                  <span {...stylex.props(styles.linkText)}>
                    A medieval lock with twenty-six rotating dials.
                  </span>
                </div>
              </NavigationMenuLink>
              <NavigationMenuLink href='#'>
                <div {...stylex.props(styles.linkBody)}>
                  <span {...stylex.props(styles.linkTitle)}>Keystone</span>
                  <span {...stylex.props(styles.linkText)}>
                    The only key to the vault hidden beneath the Louvre.
                  </span>
                </div>
              </NavigationMenuLink>
            </div>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuLink href='#'>Library</NavigationMenuLink>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  ),
  play: async ({ canvas }) => {
    const body = within(document.body)
    const firstTrigger = canvas.getByRole('button', { name: 'First year at Hogwarts' })
    const secondTrigger = canvas.getByRole('button', { name: 'Codebreaking' })

    // Hovering a trigger reveals its panel of links.
    await userEvent.hover(firstTrigger)
    await body.findByRole('link', { name: /platform nine/i })

    // Leave the first trigger so the next one becomes hoverable again.
    await userEvent.unhover(firstTrigger)
    await waitFor(() => expect(body.queryByRole('link', { name: /platform nine/i })).toBeNull())

    // Base UI restores pointer-events on the bar after the panel closes.
    await waitFor(async () => {
      await expect(getComputedStyle(secondTrigger).pointerEvents).not.toBe('none')
    })

    // Hovering the second trigger opens its own panel.
    await userEvent.hover(secondTrigger)
    await waitFor(() => expect(body.getByRole('link', { name: /cryptex/i })).toBeInTheDocument())
    await expect(body.queryByRole('link', { name: /platform nine/i })).toBeNull()
  }
}

export const Link: Story = {
  parameters: {
    docs: {
      source: {
        code: `<NavigationMenu>
  <NavigationMenuList>
    <NavigationMenuItem>
      <NavigationMenuLink href='#' active>Headmaster's tower</NavigationMenuLink>
    </NavigationMenuItem>
    <NavigationMenuItem>
      <NavigationMenuLink href='#'>Illuminati archives</NavigationMenuLink>
    </NavigationMenuItem>
  </NavigationMenuList>
</NavigationMenu>`
      }
    }
  },
  render: () => (
    <NavigationMenu>
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuLink href='#' active>
            Headmaster&apos;s tower
          </NavigationMenuLink>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuLink href='#'>Illuminati archives</NavigationMenuLink>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuLink href='#'>Gringotts exchange rates</NavigationMenuLink>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  )
}

function Gates({ defaultValue }: { defaultValue?: string }) {
  return (
    <NavigationMenu defaultValue={defaultValue}>
      <NavigationMenuList>
        <NavigationMenuItem value='school'>
          <NavigationMenuTrigger>First year at Hogwarts</NavigationMenuTrigger>
          <NavigationMenuContent>
            <NavigationMenuLink href='#platform'>
              Platform Nine and Three-Quarters
            </NavigationMenuLink>
            <NavigationMenuLink href='#alley'>Diagon Alley</NavigationMenuLink>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem value='codes'>
          <NavigationMenuTrigger>Codebreaking</NavigationMenuTrigger>
          <NavigationMenuContent>
            <NavigationMenuLink href='#cryptex'>Cryptex</NavigationMenuLink>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuLink href='#library'>Library</NavigationMenuLink>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  )
}

// The a11y gate runs after `play`, when a panel a play opened has closed again: this story keeps
// the first panel open so the gate checks it.
export const Open: Story = {
  render: () => <Gates defaultValue='school' />,
  play: async () => {
    const link = await within(document.body).findByRole('link', {
      name: 'Platform Nine and Three-Quarters'
    })
    await waitFor(() => expect(link).toBeVisible())
  }
}

/** Enter or Space opens a panel from its trigger, Tab moves into its links, and Escape closes it and returns focus. */
export const Keyboard: Story = {
  render: () => <Gates />,
  play: async ({ canvas }) => {
    const body = within(document.body)
    const trigger = canvas.getByRole('button', { name: 'First year at Hogwarts' })
    const platform = () => body.queryByRole('link', { name: 'Platform Nine and Three-Quarters' })

    await userEvent.tab()
    await expect(trigger).toHaveFocus()

    // Enter opens the panel only while it is closed.
    await pressUntil('{Enter}', () => expect(platform()).toBeVisible(), {
      when: () => !platform()
    })
    await expect(trigger).toHaveAttribute('aria-expanded', 'true')

    // Escape closes it and focus stays on the trigger.
    await pressUntil('{Escape}', () => expect(platform()).toBeNull())
    await waitFor(() => expect(trigger).toHaveFocus())
    await expect(trigger).toHaveAttribute('aria-expanded', 'false')

    // Space opens it too.
    await pressUntil(' ', () => expect(platform()).toBeVisible(), { when: () => !platform() })
    await pressUntil('{Escape}', () => expect(platform()).toBeNull())
    await waitFor(() => expect(trigger).toHaveFocus())
  }
}
