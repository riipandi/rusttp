import type { Meta, StoryObj } from '@storybook/tanstack-react'
import * as stylex from '@stylexjs/stylex'
import { expect, screen, userEvent, waitFor } from 'storybook/test'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '../../base/dropdown-menu'
import { pressUntil } from '../../contracts/keyboard'
import { Axis } from '../../contracts/story-axes'
import {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from './breadcrumb.component'

const meta = {
  title: 'Extra Components/Breadcrumb',
  component: Breadcrumb,
  tags: [] // ['autodocs']
} satisfies Meta<typeof Breadcrumb>

type Story = StoryObj<typeof meta>

const styles = stylex.create({
  trigger: {
    alignItems: 'center',
    backgroundColor: 'transparent',
    borderStyle: 'none',
    color: 'inherit',
    cursor: 'pointer',
    display: 'inline-flex',
    padding: 0
  }
})

export default meta

export const Playground: Story = {
  parameters: { controls: { disable: false, include: ['color'] } },
  argTypes: {
    color: { control: 'radio', options: ['neutral', 'primary'] }
  },
  args: { color: 'neutral' },
  render: (args) => (
    <Breadcrumb {...args}>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href='/'>Louvre</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbEllipsis />
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbLink href='/docs/components'>Sistine Chapel</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage>Vatican Archives</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  ),
  // The current page is plain text with aria-current; only the ancestors are links.
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('link', { name: 'Louvre' })).toBeInTheDocument()
    await expect(canvas.queryByRole('link', { name: 'Vatican Archives' })).toBeNull()
    const current = canvas.getByText('Vatican Archives')
    await expect(current).toHaveAttribute('aria-current', 'page')
    await expect(current).not.toHaveAttribute('role')
    await expect(current).not.toHaveAttribute('aria-disabled')
  }
}

export const Ellipsis: Story = {
  parameters: {
    docs: {
      source: {
        code: `<Breadcrumb>
  <BreadcrumbList>
    <BreadcrumbItem>
      <BreadcrumbLink href='/'>Great Hall</BreadcrumbLink>
    </BreadcrumbItem>
    <BreadcrumbSeparator />
    <BreadcrumbItem>
      <BreadcrumbEllipsis />
    </BreadcrumbItem>
    <BreadcrumbSeparator />
    <BreadcrumbItem>
      <BreadcrumbPage>Potions classroom</BreadcrumbPage>
    </BreadcrumbItem>
  </BreadcrumbList>
</Breadcrumb>`
      }
    }
  },
  render: () => (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href='/'>Great Hall</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbEllipsis />
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage>Potions classroom</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  )
}

export const Dropdown: Story = {
  parameters: {
    docs: {
      source: {
        code: `<BreadcrumbItem>
  <DropdownMenu>
    <DropdownMenuTrigger aria-label='Collapsed breadcrumb levels'>
      <BreadcrumbEllipsis />
    </DropdownMenuTrigger>
    <DropdownMenuContent align='start'>
      <DropdownMenuItem>Marauder's Map</DropdownMenuItem>
      <DropdownMenuItem>Daily Prophet</DropdownMenuItem>
      <DropdownMenuItem>Gringotts</DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
</BreadcrumbItem>`
      }
    }
  },
  render: () => (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href='/'>Hogwarts</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <DropdownMenu>
            <DropdownMenuTrigger
              aria-label='Collapsed breadcrumb levels'
              {...stylex.props(styles.trigger)}
            >
              <BreadcrumbEllipsis />
            </DropdownMenuTrigger>
            <DropdownMenuContent align='start'>
              <DropdownMenuItem>Marauder's Map</DropdownMenuItem>
              <DropdownMenuItem>Daily Prophet</DropdownMenuItem>
              <DropdownMenuItem>Gringotts</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbLink href='/docs/components'>Diagon Alley</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage>Honeydukes</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  ),
  play: async ({ canvas }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Collapsed breadcrumb levels' }))
    await screen.findByRole('menu')
    await expect(screen.getByRole('menuitem', { name: "Marauder's Map" })).toBeInTheDocument()

    await userEvent.click(screen.getByRole('menuitem', { name: 'Gringotts' }))
    await waitFor(() => expect(screen.queryByRole('menu')).toBeNull())
  }
}

export const CustomSeparator: Story = {
  parameters: {
    docs: {
      source: {
        code: `<Breadcrumb>
  <BreadcrumbList>
    <BreadcrumbItem>
      <BreadcrumbLink href='/'>Hogsmeade</BreadcrumbLink>
    </BreadcrumbItem>
    <BreadcrumbSeparator>/</BreadcrumbSeparator>
    <BreadcrumbItem>
      <BreadcrumbPage>Honeydukes</BreadcrumbPage>
    </BreadcrumbItem>
  </BreadcrumbList>
</Breadcrumb>`
      }
    }
  },
  name: 'Custom separator',
  render: () => (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href='/'>Hogsmeade</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator>/</BreadcrumbSeparator>
        <BreadcrumbItem>
          <BreadcrumbLink href='/docs'>Zonko's Joke Shop</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator>/</BreadcrumbSeparator>
        <BreadcrumbItem>
          <BreadcrumbPage>Honeydukes</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  )
}

export const Translated: Story = {
  render: () => {
    const labels = { breadcrumb: 'Jejak halaman', more: 'Lainnya' }
    return (
      <Breadcrumb labels={labels}>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href='#'>Hogwarts</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbEllipsis labels={labels} />
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    )
  },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('navigation', { name: 'Jejak halaman' })).toBeInTheDocument()
    await expect(canvas.getByText('Lainnya')).toBeInTheDocument()
  }
}

export const Colors: Story = {
  parameters: {
    docs: {
      source: {
        code: `<Breadcrumb color='primary'>
  <BreadcrumbList>
    <BreadcrumbItem>
      <BreadcrumbLink href='#hogwarts'>Hogwarts primary</BreadcrumbLink>
    </BreadcrumbItem>
    <BreadcrumbSeparator />
    <BreadcrumbItem>
      <BreadcrumbPage>Great Hall</BreadcrumbPage>
    </BreadcrumbItem>
  </BreadcrumbList>
</Breadcrumb>`
      }
    }
  },
  render: () => (
    <Axis axis='color' rows={['neutral', 'primary'] as const}>
      {(color) => (
        <Breadcrumb color={color} labels={{ breadcrumb: `Trail ${color}` }}>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href='#hogwarts'>{`Hogwarts ${color}`}</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Great Hall</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      )}
    </Axis>
  ),
  play: async ({ canvas }) => {
    const link = (color: string) => getComputedStyle(canvas.getByText(`Hogwarts ${color}`)).color
    await expect(link('primary')).not.toBe(link('neutral'))
    // The current page keeps the text color in both.
    for (const page of canvas.getAllByText('Great Hall')) {
      await expect(getComputedStyle(page).color).toBe(
        getComputedStyle(canvas.getAllByText('Great Hall')[0]!).color
      )
    }
  }
}

const menu = () => screen.queryByRole('menu')
const item = (name: string) => screen.getByRole('menuitem', { name })

/** Tab visits the links and the collapsed-levels button in order; the current page is not a stop. */
export const Keyboard: Story = {
  render: () => (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href='#hogwarts'>Hogwarts</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <DropdownMenu>
            <DropdownMenuTrigger
              aria-label='Collapsed breadcrumb levels'
              {...stylex.props(styles.trigger)}
            >
              <BreadcrumbEllipsis />
            </DropdownMenuTrigger>
            <DropdownMenuContent align='start'>
              <DropdownMenuItem>Marauder&apos;s Map</DropdownMenuItem>
              <DropdownMenuItem>Daily Prophet</DropdownMenuItem>
              <DropdownMenuItem>Gringotts</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbLink href='#diagon-alley'>Diagon Alley</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage>Honeydukes</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  ),
  play: async ({ canvas }) => {
    const first = canvas.getByRole('link', { name: 'Hogwarts' })
    const trigger = canvas.getByRole('button', { name: 'Collapsed breadcrumb levels' })
    const last = canvas.getByRole('link', { name: 'Diagon Alley' })

    // Tab order: link, the collapsed levels, link. The current page is text, not a stop.
    first.focus()
    await userEvent.tab()
    await waitFor(() => expect(trigger).toHaveFocus())
    await userEvent.tab()
    await waitFor(() => expect(last).toHaveFocus())
    await expect(canvas.getByText('Honeydukes')).toHaveAttribute('aria-current', 'page')
    await userEvent.tab({ shift: true })
    await waitFor(() => expect(trigger).toHaveFocus())

    // Enter opens the levels; arrows move through them; Escape closes and returns to the button.
    await pressUntil('{Enter}', () => expect(menu()).not.toBeNull(), { when: () => !menu() })
    await pressUntil('{Home}', () => expect(item("Marauder's Map")).toHaveFocus())
    await pressUntil('{ArrowDown}', () => expect(item('Daily Prophet')).toHaveFocus(), {
      when: () => item("Marauder's Map") === document.activeElement
    })
    await pressUntil('{Escape}', () => expect(menu()).toBeNull())
    await waitFor(() => expect(trigger).toHaveFocus())

    // Enter on a level picks it, closes the menu, and returns focus to the button.
    await pressUntil('{Enter}', () => expect(menu()).not.toBeNull(), { when: () => !menu() })
    await pressUntil('{Home}', () => expect(item("Marauder's Map")).toHaveFocus())
    await pressUntil('{Enter}', () => expect(menu()).toBeNull(), { when: () => !!menu() })
    await waitFor(() => expect(trigger).toHaveFocus())
  }
}
