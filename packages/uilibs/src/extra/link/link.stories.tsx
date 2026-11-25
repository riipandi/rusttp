import { ArrowRight, Book } from '@keyline-icons/react'
import type { Meta, StoryObj } from '@storybook/tanstack-react'
import * as stylex from '@stylexjs/stylex'
import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  RouterProvider,
  useLinkProps,
  useRouterState
} from '@tanstack/react-router'
import * as React from 'react'
import { expect, fn, userEvent, waitFor } from 'storybook/test'
import { cellOf } from '../../contracts/control-sizes'
import { Axis } from '../../contracts/story-axes'
import { Link } from './link.component'
import { linkColors, linkVariants } from './link.stylex'

const meta = {
  title: 'Extra Components/Link',
  component: Link,
  tags: [] // ['autodocs']
} satisfies Meta<typeof Link>

type Story = StoryObj<typeof meta>

const styles = stylex.create({
  row: { alignItems: 'center', display: 'flex', flexWrap: 'wrap', gap: 16 },
  paragraph: { margin: 0, maxWidth: '40ch' }
})

export default meta

export const Playground: Story = {
  parameters: { controls: { disable: false, include: ['children', 'color', 'variant'] } },
  argTypes: {
    children: { control: 'text' },
    color: { control: 'radio', options: Object.keys(linkColors) },
    variant: { control: 'radio', options: Object.keys(linkVariants) }
  },
  args: { children: 'Read the Daily Prophet', color: 'primary', variant: 'underline' },
  render: (args) => <Link href='#daily-prophet' {...args} />
}

const colorNames = ['primary', 'neutral', 'critical', 'positive', 'warning', 'inherit'] as const

export const Colors: Story = {
  parameters: {
    docs: {
      source: { code: `<Link href='#critical' color='critical'>Visit Hogsmeade (critical)</Link>` }
    }
  },
  render: () => (
    <Axis axis='color' rows={colorNames}>
      {(color) => (
        <Link href={`#${color}`} color={color}>
          Visit Hogsmeade ({color})
        </Link>
      )}
    </Axis>
  ),
  // `inherit` is the text color around the link; the five roles differ from each other.
  play: async ({ canvasElement }) => {
    const colorOf = (color: string) =>
      getComputedStyle(cellOf(canvasElement, 'color', color).firstElementChild ?? canvasElement)
        .color
    const roles = colorNames.filter((color) => color !== 'inherit')
    await expect(new Set(roles.map(colorOf)).size).toBe(roles.length)
    await expect(colorOf('inherit')).toBe(
      getComputedStyle(cellOf(canvasElement, 'color', 'inherit')).color
    )
  }
}

export const Variants: Story = {
  parameters: {
    docs: {
      source: {
        code: `<Link href='#plain' variant='plain'>Platform nine and three quarters (plain)</Link>`
      }
    }
  },
  render: () => (
    <Axis axis='variant' rows={['underline', 'plain'] as const}>
      {(variant) => (
        <Link href={`#${variant}`} variant={variant}>
          Platform nine and three quarters ({variant})
        </Link>
      )}
    </Axis>
  ),
  // `underline` is drawn at rest; `plain` draws it on hover and on the open page only.
  play: async ({ canvasElement }) => {
    const link = (variant: string) => {
      const anchor = cellOf(canvasElement, 'variant', variant).querySelector('a')
      if (!anchor) throw new Error(`No link rendered for variant ${variant}`)
      return anchor
    }
    await expect(getComputedStyle(link('underline')).textDecorationLine).toBe('underline')
    await expect(getComputedStyle(link('plain')).textDecorationLine).toBe('none')
    // The open page draws the underline too, whichever variant.
    link('plain').setAttribute('aria-current', 'page')
    await waitFor(() =>
      expect(getComputedStyle(link('plain')).textDecorationLine).toBe('underline')
    )
  }
}

export const Glyphs: Story = {
  parameters: {
    docs: {
      source: {
        code: `<Link href='#map' endIcon={ArrowRight}>Open the Marauder's Map</Link>

<Link href='#owlery' icon={Book}>Visit the Owlery</Link>`
      }
    }
  },
  name: 'icon and end icon',
  render: () => (
    <div {...stylex.props(styles.row)}>
      <Link href='#map' endIcon={ArrowRight}>
        Open the Marauder&apos;s Map
      </Link>
      <Link href='#owlery' icon={Book}>
        Visit the Owlery
      </Link>
    </div>
  ),
  // The glyphs are decoration: the link's name is its text.
  play: async ({ canvas }) => {
    const link = canvas.getByRole('link', { name: "Open the Marauder's Map" })
    await expect(link.querySelector('svg')).toHaveAttribute('aria-hidden', 'true')
    // A flex parent blockifies `inline-flex` to `flex`: either way the link is a row, not inline text.
    await expect(getComputedStyle(link).display).toContain('flex')
  }
}

export const InText: Story = {
  parameters: {
    docs: {
      source: {
        code: `<p>
  Owls deliver the post at breakfast; read the <Link href='#rules'>school rules</Link> before
  you send one, and check the <Link href='#timetable'>timetable</Link> for the first lesson.
</p>`
      }
    }
  },
  name: 'in text',
  render: () => (
    <p {...stylex.props(styles.paragraph)}>
      Owls deliver the post at breakfast; read the <Link href='#rules'>school rules</Link> before
      you send one, and check the <Link href='#timetable'>timetable</Link> for the first lesson.
    </p>
  ),
  // A link with no glyph stays inline so it wraps with the sentence, and it is underlined: color
  // alone does not mark a link in running text.
  play: async ({ canvas }) => {
    const link = canvas.getByRole('link', { name: 'school rules' })
    await expect(getComputedStyle(link).display).toBe('inline')
    await expect(getComputedStyle(link).textDecorationLine).toBe('underline')
  }
}

// Storybook's TanStack framework swaps the router's `Link` component for a mock that only logs a
// `navigate` action, so a click on it never changes the route. `useLinkProps` is the router's own
// click and `aria-current` logic, so the story builds its anchor from it: a real navigation.
function RouterAnchor({ to, children, ...props }: { to: string } & React.ComponentProps<'a'>) {
  const linkProps = useLinkProps({ to })
  return (
    <a
      href={linkProps.href}
      {...linkProps}
      {...props}
      onClick={(event) => {
        props.onClick?.(event)
        linkProps.onClick?.(event)
      }}
    >
      {children}
    </a>
  )
}

// A router of two pages with the open page's path shown, so a click is seen to navigate.
function RouterPage() {
  const pathname = useRouterState({ select: (state) => state.location.pathname })
  return (
    <div {...stylex.props(styles.row)}>
      <Link render={<RouterAnchor to='/' />}>Great Hall</Link>
      <Link render={<RouterAnchor to='/dungeons' />}>Dungeons</Link>
      <output aria-label='Open page'>{pathname}</output>
    </div>
  )
}

function RouterStory() {
  const [router] = React.useState(() => {
    const root = createRootRoute({ component: RouterPage })
    const routeTree = root.addChildren([
      createRoute({ getParentRoute: () => root, path: '/' }),
      createRoute({ getParentRoute: () => root, path: '/dungeons' })
    ])
    return createRouter({ routeTree, history: createMemoryHistory({ initialEntries: ['/'] }) })
  })
  return <RouterProvider router={router} />
}

export const WithRouterLink: Story = {
  parameters: {
    docs: {
      source: {
        code: `import { Link as RouterLink } from '@tanstack/react-router'

<Link render={<RouterLink to='/dungeons' />}>Dungeons</Link>`
      }
    }
  },
  name: 'router link',
  render: () => <RouterStory />,
  // `render` keeps the router's own props (`href`, the click navigation) and adds the library's
  // look; the router marks the link of the open page with `aria-current`.
  play: async ({ canvas }) => {
    const dungeons = await canvas.findByRole('link', { name: 'Dungeons' })
    await expect(dungeons).toHaveAttribute('href', '/dungeons')
    await expect(dungeons.className).toMatch(/\S/)
    await expect(getComputedStyle(dungeons).textDecorationLine).toBe('underline')
    const hall = canvas.getByRole('link', { name: 'Great Hall' })
    await expect(hall).toHaveAttribute('aria-current', 'page')

    await userEvent.click(dungeons)
    await waitFor(() => expect(canvas.getByLabelText('Open page')).toHaveTextContent('/dungeons'))
    await expect(dungeons).toHaveAttribute('aria-current', 'page')
    await expect(hall).not.toHaveAttribute('aria-current')
  }
}

const onClick = fn()
const onRef = fn()

export const Handlers: Story = {
  parameters: {
    docs: {
      source: {
        code: `<Link
  ref={(node) => …}
  href='#owl-post'
  onClick={(event) => {
    event.preventDefault()
    …
  }}
>
  Send an owl
</Link>`
      }
    }
  },
  name: 'handlers and ref',
  render: () => (
    <Link
      ref={(node) => onRef(node?.tagName)}
      href='#owl-post'
      onClick={(event) => {
        event.preventDefault()
        onClick()
      }}
    >
      Send an owl
    </Link>
  ),
  // The handler runs, and `ref` reaches the anchor itself (`mergeProps` does not merge refs).
  play: async ({ canvas }) => {
    await userEvent.click(canvas.getByRole('link', { name: 'Send an owl' }))
    await expect(onClick).toHaveBeenCalledTimes(1)
    await expect(onRef).toHaveBeenCalledWith('A')
  }
}

const onKeyboardClick = fn()

/** Tab visits the links of a sentence in order; Enter follows the focused one. */
export const Keyboard: Story = {
  render: () => (
    <p {...stylex.props(styles.paragraph)}>
      Read the{' '}
      <Link
        href='#rules'
        onClick={(event) => {
          event.preventDefault()
          onKeyboardClick('rules')
        }}
      >
        school rules
      </Link>{' '}
      and check the{' '}
      <Link
        href='#timetable'
        onClick={(event) => {
          event.preventDefault()
          onKeyboardClick('timetable')
        }}
      >
        timetable
      </Link>
      .
    </p>
  ),
  play: async ({ canvas }) => {
    onKeyboardClick.mockClear()
    const rules = canvas.getByRole('link', { name: 'school rules' })
    const timetable = canvas.getByRole('link', { name: 'timetable' })
    rules.focus()
    await userEvent.tab()
    await waitFor(() => expect(timetable).toHaveFocus())
    await userEvent.tab({ shift: true })
    await waitFor(() => expect(rules).toHaveFocus())
    await userEvent.keyboard('{Enter}')
    await expect(onKeyboardClick).toHaveBeenLastCalledWith('rules')
    await userEvent.tab()
    await userEvent.keyboard('{Enter}')
    await expect(onKeyboardClick).toHaveBeenLastCalledWith('timetable')
  }
}
