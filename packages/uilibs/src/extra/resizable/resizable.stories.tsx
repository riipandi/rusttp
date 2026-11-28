import type { Meta, StoryObj } from '@storybook/tanstack-react'
import atoms from '@stylexjs/atoms'
import * as stylex from '@stylexjs/stylex'
import * as React from 'react'
import type { GroupImperativeHandle } from 'react-resizable-panels'
import { expect, userEvent, waitFor } from 'storybook/test'
import { Button } from '../../base/button'
import { pressUntil } from '../../contracts/keyboard'
import { Axis } from '../../contracts/story-axes'
import { colors } from '../../styles/colors.stylex'
import { container, radius, stroke, unit } from '../../styles/tokens.stylex'
import { fontLineHeight, fontSize, fontWeight } from '../../styles/tokens.stylex'
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from './resizable.component'

const meta = {
  title: 'Extra Components/Resizable',
  component: ResizablePanelGroup,
  parameters: { layout: 'fullscreen' },
  // `canvas: 'auto'` lets a story that draws several groups size its own cells.
  decorators: [
    (Story, { parameters }) => (
      <div {...stylex.props(atoms.width['100%'], parameters.canvas !== 'auto' && styles.canvas)}>
        <Story />
      </div>
    )
  ]
} satisfies Meta<typeof ResizablePanelGroup>

export default meta

type Story = StoryObj<typeof meta>

const styles = stylex.create({
  canvas: {
    height: container.medium,
    padding: unit.x6
  },
  frame: {
    backgroundColor: colors.backgroundPage,
    borderColor: colors.borderNeutralFaded,
    borderRadius: radius.xlarge,
    borderStyle: 'solid',
    borderWidth: stroke.ring1,
    overflow: 'hidden'
  },
  content: {
    alignItems: 'center',
    backgroundColor: colors.backgroundNeutralFaded,
    display: 'flex',
    fontSize: fontSize.body2,
    fontWeight: fontWeight.semibold,
    height: '100%',
    justifyContent: 'center',
    lineHeight: fontLineHeight.body2,
    overflow: 'auto',
    padding: unit.x6
  },
  nested: {
    height: '100%'
  },
  box: {
    height: container.xxsmall
  },
  outer: {
    display: 'flex',
    flexDirection: 'column',
    gap: unit.x4,
    height: '100%'
  },
  fill: {
    flexGrow: 1,
    minHeight: 0
  },
  toolbar: {
    display: 'flex',
    gap: unit.x2,
    justifyContent: 'center'
  }
})

// The bar's look is a `ResizableHandle` prop; the flow direction is the group's.
type PlaygroundArgs = React.ComponentProps<typeof ResizablePanelGroup> &
  Pick<React.ComponentProps<typeof ResizableHandle>, 'variant' | 'withHandle'>

export const Playground: StoryObj<PlaygroundArgs> = {
  parameters: { controls: { disable: false, include: ['orientation', 'variant', 'withHandle'] } },
  argTypes: {
    orientation: { control: 'radio', options: ['horizontal', 'vertical'] },
    variant: { control: 'radio', options: ['line', 'pill', 'spring', 'capsule'] },
    withHandle: { control: 'boolean' }
  },
  args: { orientation: 'horizontal', variant: 'pill', withHandle: false },
  render: ({ variant, withHandle, ...args }) => (
    <ResizablePanelGroup {...args} style={styles.frame}>
      <ResizablePanel id='sidebar' defaultSize='25%' minSize='15%' style={styles.content}>
        Sidebar
      </ResizablePanel>
      <ResizableHandle aria-label='Resize sidebar' variant={variant} withHandle={withHandle} />
      <ResizablePanel defaultSize='75%' style={styles.content}>
        Content
      </ResizablePanel>
    </ResizablePanelGroup>
  ),
  play: async ({ canvas }) => {
    const handle = canvas.getByRole('separator', { name: 'Resize sidebar' })
    const panel = document.body.querySelector<HTMLElement>('[data-testid="sidebar"]')
    await expect(panel).not.toBeNull()
    // Keyboard focus shows the glow hugging the bar and resizes the panel.
    // (Hover styles rely on CSS :hover, which synthetic test events cannot
    // trigger — verified separately against a real browser session.)
    const before = panel?.getBoundingClientRect().width ?? 0
    handle.focus()
    await userEvent.keyboard('{ArrowRight}')
    // The glow fades in with a transition, so wait for it.
    await waitFor(() => expect(getComputedStyle(handle).boxShadow).not.toBe('none'))
    await expect(panel?.getBoundingClientRect().width ?? 0).toBeGreaterThan(before)
  }
}

const handleVariants = ['line', 'pill', 'spring', 'capsule'] as const

/** The handle: a bare line, or a grip drawn as a pill, a spring-loaded pill, or a capsule. */
export const Variants: Story = {
  parameters: {
    docs: {
      source: {
        code: `<ResizablePanelGroup>
  <ResizablePanel defaultSize='35%'>Panel A</ResizablePanel>
  <ResizableHandle withHandle variant='capsule' aria-label='Resize capsule' />
  <ResizablePanel defaultSize='65%'>Panel B</ResizablePanel>
</ResizablePanelGroup>`
      }
    },
    canvas: 'auto'
  },
  render: () => (
    <Axis axis='variant' rows={handleVariants}>
      {(variant) => (
        <div {...stylex.props(styles.box)}>
          <ResizablePanelGroup style={styles.frame}>
            <ResizablePanel defaultSize='35%' style={styles.content}>
              Panel A
            </ResizablePanel>
            <ResizableHandle
              withHandle={variant !== 'line'}
              variant={variant === 'line' ? undefined : variant}
              aria-label={`Resize ${variant}`}
            />
            <ResizablePanel defaultSize='65%' style={styles.content}>
              Panel B
            </ResizablePanel>
          </ResizablePanelGroup>
        </div>
      )}
    </Axis>
  ),
  play: async ({ canvas }) => {
    for (const variant of handleVariants) {
      const handle = canvas.getByRole('separator', { name: `Resize ${variant}` })
      // Every handle has a hit area; only the grips add an indicator after it.
      await expect(handle.children).toHaveLength(variant === 'line' ? 1 : 2)
    }
  }
}

/** A CSS color as sRGB over the colors behind it, the way the eye sees it: the browser does the parsing. */
function over(...layers: string[]) {
  const context = document.createElement('canvas').getContext('2d', { willReadFrequently: true })
  if (!context) throw new Error('No 2D canvas')
  for (const layer of layers) {
    context.fillStyle = layer
    context.fillRect(0, 0, 1, 1)
  }
  return Array.from(context.getImageData(0, 0, 1, 1).data.slice(0, 3))
}

function luminance(rgb: number[]) {
  const [r = 0, g = 0, b = 0] = rgb.map((channel) => {
    const value = channel / 255
    return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4
  })
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

function contrast(a: number[], b: number[]) {
  const [light = 0, dark = 0] = [luminance(a), luminance(b)].toSorted((x, y) => y - x)
  return (light + 0.05) / (dark + 0.05)
}

/**
 * At rest the rail behind a grip is a hairline in the panel edges' register, and the part that says
 * "drag me" meets 3:1 against the panels: the grip, or the line when there is no grip. Hover and
 * drag are CSS states that synthetic events cannot raise; the screenshots cover them.
 */
export const RestingContrast: Story = {
  name: 'Handle contrast at rest',
  parameters: { canvas: 'auto' },
  render: () => (
    <Axis axis='variant' rows={handleVariants}>
      {(variant) => (
        <div {...stylex.props(styles.box)}>
          <ResizablePanelGroup style={styles.frame}>
            <ResizablePanel defaultSize='50%' style={styles.content}>
              Panel A
            </ResizablePanel>
            <ResizableHandle
              withHandle={variant !== 'line'}
              variant={variant === 'line' ? undefined : variant}
              aria-label={`Resize ${variant}`}
            />
            <ResizablePanel defaultSize='50%' style={styles.content}>
              Panel B
            </ResizablePanel>
          </ResizablePanelGroup>
        </div>
      )}
    </Axis>
  ),
  play: async ({ canvas }) => {
    for (const variant of handleVariants) {
      const handle = canvas.getByRole('separator', { name: `Resize ${variant}` })
      const frame = handle.parentElement
      const panel = handle.previousElementSibling?.firstElementChild
      if (!frame || !panel) throw new Error('Handle is not between two panels')
      const behind = [
        getComputedStyle(frame).backgroundColor,
        getComputedStyle(panel).backgroundColor
      ]
      const against = (part: Element) =>
        contrast(over(...behind, getComputedStyle(part).backgroundColor), over(...behind))
      if (variant === 'line') {
        // The line is its own affordance: it has no grip to carry the 3:1.
        await expect(against(handle)).toBeGreaterThanOrEqual(3)
      } else {
        const grip = handle.lastElementChild
        if (!grip) throw new Error('Grip not found')
        await expect(against(grip)).toBeGreaterThanOrEqual(3)
        await expect(against(handle)).toBeLessThan(2)
      }
    }
  }
}

/** Each group flows along its own axis, and the arrow keys grow the first panel along it. */
export const Orientations: Story = {
  parameters: {
    docs: {
      source: {
        code: `<ResizablePanelGroup orientation='vertical'>
  <ResizablePanel id='first' defaultSize='30%'>First</ResizablePanel>
  <ResizableHandle aria-label='Resize vertical' />
  <ResizablePanel defaultSize='70%'>Second</ResizablePanel>
</ResizablePanelGroup>`
      }
    },
    canvas: 'auto'
  },
  render: () => (
    <Axis axis='orientation' rows={['horizontal', 'vertical'] as const}>
      {(orientation) => (
        <div {...stylex.props(styles.box)}>
          <ResizablePanelGroup orientation={orientation} style={styles.frame}>
            <ResizablePanel id={`first-${orientation}`} defaultSize='30%' style={styles.content}>
              First
            </ResizablePanel>
            <ResizableHandle aria-label={`Resize ${orientation}`} />
            <ResizablePanel defaultSize='70%' style={styles.content}>
              Second
            </ResizablePanel>
          </ResizablePanelGroup>
        </div>
      )}
    </Axis>
  ),
  play: async ({ canvas }) => {
    for (const [orientation, key, side] of [
      ['horizontal', 'ArrowRight', 'width'],
      ['vertical', 'ArrowDown', 'height']
    ] as const) {
      const panel = document.body.querySelector<HTMLElement>(`[data-testid="first-${orientation}"]`)
      if (!panel) throw new Error(`No ${orientation} panel`)
      const before = panel.getBoundingClientRect()[side]
      canvas.getByRole('separator', { name: `Resize ${orientation}` }).focus()
      await userEvent.keyboard(`{${key}}`)
      await waitFor(() => expect(panel.getBoundingClientRect()[side]).toBeGreaterThan(before))
    }
  }
}

export const NestedMixed: Story = {
  parameters: {
    docs: {
      source: {
        code: `<ResizablePanelGroup>
  <ResizablePanel defaultSize='40%'>Side</ResizablePanel>
  <ResizableHandle aria-label='Resize side panel' />
  <ResizablePanel defaultSize='60%'>
    <ResizablePanelGroup orientation='vertical'>
      <ResizablePanel defaultSize='30%'>Top</ResizablePanel>
      <ResizableHandle aria-label='Resize top panel' />
      <ResizablePanel defaultSize='70%'>Bottom</ResizablePanel>
    </ResizablePanelGroup>
  </ResizablePanel>
</ResizablePanelGroup>`
      }
    }
  },
  render: () => (
    <ResizablePanelGroup style={styles.frame}>
      <ResizablePanel defaultSize='40%' style={styles.content}>
        Side
      </ResizablePanel>
      <ResizableHandle aria-label='Resize side panel' />
      <ResizablePanel defaultSize='60%'>
        <ResizablePanelGroup orientation='vertical' style={styles.nested}>
          <ResizablePanel defaultSize='30%' style={styles.content}>
            Top
          </ResizablePanel>
          <ResizableHandle aria-label='Resize top panel' />
          <ResizablePanel defaultSize='70%' style={styles.content}>
            Bottom
          </ResizablePanel>
        </ResizablePanelGroup>
      </ResizablePanel>
    </ResizablePanelGroup>
  )
}

export const Nested: Story = {
  render: () => (
    <ResizablePanelGroup style={styles.frame}>
      <ResizablePanel defaultSize='50%' style={styles.content}>
        One
      </ResizablePanel>
      <ResizableHandle withHandle aria-label='Resize one' />
      <ResizablePanel defaultSize='50%'>
        <ResizablePanelGroup orientation='vertical' style={styles.nested}>
          <ResizablePanel defaultSize='25%' style={styles.content}>
            Two
          </ResizablePanel>
          <ResizableHandle withHandle aria-label='Resize two' />
          <ResizablePanel defaultSize='75%' style={styles.content}>
            Three
          </ResizablePanel>
        </ResizablePanelGroup>
      </ResizablePanel>
    </ResizablePanelGroup>
  )
}

export const NestedPills: Story = {
  render: () => (
    <ResizablePanelGroup style={styles.frame}>
      <ResizablePanel defaultSize='30%' minSize='15%' style={styles.content}>
        Nav
      </ResizablePanel>
      <ResizableHandle withHandle aria-label='Resize nav panel' />
      <ResizablePanel defaultSize='70%'>
        <ResizablePanelGroup orientation='vertical' style={styles.nested}>
          <ResizablePanel defaultSize='25%' style={styles.content}>
            Toolbar
          </ResizablePanel>
          <ResizableHandle withHandle aria-label='Resize toolbar' />
          <ResizablePanel defaultSize='75%' style={styles.content}>
            Editor
          </ResizablePanel>
        </ResizablePanelGroup>
      </ResizablePanel>
    </ResizablePanelGroup>
  )
}

export const ThreePanels: Story = {
  parameters: {
    docs: {
      source: {
        code: `<ResizablePanelGroup>
  <ResizablePanel defaultSize='25%' minSize='15%'>Files</ResizablePanel>
  <ResizableHandle withHandle aria-label='Resize files panel' />
  <ResizablePanel defaultSize='50%' minSize='25%'>Editor</ResizablePanel>
  <ResizableHandle withHandle aria-label='Resize editor panel' />
  <ResizablePanel defaultSize='25%' minSize='15%'>Preview</ResizablePanel>
</ResizablePanelGroup>`
      }
    }
  },
  render: () => (
    <ResizablePanelGroup style={styles.frame}>
      <ResizablePanel defaultSize='25%' minSize='15%' style={styles.content}>
        Files
      </ResizablePanel>
      <ResizableHandle withHandle aria-label='Resize files panel' />
      <ResizablePanel defaultSize='50%' minSize='25%' style={styles.content}>
        Editor
      </ResizablePanel>
      <ResizableHandle withHandle aria-label='Resize editor panel' />
      <ResizablePanel defaultSize='25%' minSize='15%' style={styles.content}>
        Preview
      </ResizablePanel>
    </ResizablePanelGroup>
  )
}

export const StateTracked: Story = {
  render: () => {
    const [sizes, setSizes] = React.useState<Record<string, number>>({
      left: 30,
      right: 70
    })

    return (
      <ResizablePanelGroup
        style={styles.frame}
        onLayoutChange={(layout) => {
          setSizes(layout)
        }}
      >
        <ResizablePanel id='left' defaultSize='30%' minSize='20%' style={styles.content}>
          {Math.round(sizes.left ?? 30)}%
        </ResizablePanel>
        <ResizableHandle withHandle aria-label='Resize left panel' />
        <ResizablePanel id='right' defaultSize='70%' minSize='30%' style={styles.content}>
          {Math.round(sizes.right ?? 70)}%
        </ResizablePanel>
      </ResizablePanelGroup>
    )
  }
}

// Controlled layout: state drives the panel size labels, presets apply a new
// layout through the group's imperative `setLayout` API.
export const Controlled: Story = {
  render: () => {
    const groupRef = React.useRef<GroupImperativeHandle | null>(null)
    const [sizes, setSizes] = React.useState<Record<string, number>>({
      left: 30,
      right: 70
    })

    const applyLayout = (left: number) => {
      groupRef.current?.setLayout({ left, right: 100 - left })
    }

    return (
      <div {...stylex.props(styles.outer)}>
        <div {...stylex.props(styles.toolbar)}>
          <Button variant='outline' onClick={() => applyLayout(25)}>
            25 / 75
          </Button>
          <Button variant='outline' onClick={() => applyLayout(50)}>
            50 / 50
          </Button>
          <Button variant='outline' onClick={() => applyLayout(75)}>
            75 / 25
          </Button>
        </div>
        <ResizablePanelGroup
          groupRef={groupRef}
          style={[styles.frame, styles.fill]}
          onLayoutChange={(layout) => {
            setSizes(layout)
          }}
        >
          <ResizablePanel id='left' defaultSize='30%' minSize='20%' style={styles.content}>
            {Math.round(sizes.left ?? 30)}%
          </ResizablePanel>
          <ResizableHandle withHandle aria-label='Resize left panel' />
          <ResizablePanel id='right' defaultSize='70%' minSize='30%' style={styles.content}>
            {Math.round(sizes.right ?? 70)}%
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    )
  },
  play: async ({ canvas }) => {
    const panel = document.body.querySelector<HTMLElement>('[data-testid="left"]')
    await expect(panel).not.toBeNull()

    // Applying a preset updates the layout programmatically.
    const before = panel?.getBoundingClientRect().width ?? 0
    await userEvent.click(canvas.getByRole('button', { name: '50 / 50' }))
    await waitFor(() => expect(canvas.getAllByText('50%')).toHaveLength(2))
    await expect(panel?.getBoundingClientRect().width ?? 0).toBeGreaterThan(before)
  }
}

/** A handle is one Tab stop; the arrows move the bar, and Home and End send it to a panel's limit. */
export const Keyboard: Story = {
  render: () => (
    <ResizablePanelGroup style={styles.frame}>
      <ResizablePanel
        id='files'
        defaultSize='40%'
        minSize='20%'
        maxSize='70%'
        style={styles.content}
      >
        Files
      </ResizablePanel>
      <ResizableHandle aria-label='Resize files panel' />
      <ResizablePanel defaultSize='60%' style={styles.content}>
        Editor
      </ResizablePanel>
    </ResizablePanelGroup>
  ),
  play: async ({ canvas }) => {
    const panel = document.body.querySelector<HTMLElement>('[data-testid="files"]')
    if (!panel) throw new Error('No files panel')
    const handle = canvas.getByRole('separator', { name: 'Resize files panel' })
    const width = () => panel.getBoundingClientRect().width
    await userEvent.tab()
    await waitFor(() => expect(handle).toHaveFocus())
    await expect(handle).toHaveAttribute('aria-valuenow', '40')

    // Arrow keys step the bar by the library's keyboard step, one way and back.
    const start = width()
    await pressUntil('{ArrowRight}', () => expect(width()).toBeGreaterThan(start), {
      when: () => width() <= start
    })
    const grown = width()
    await pressUntil('{ArrowLeft}', () => expect(width()).toBeLessThan(grown), {
      when: () => width() >= grown
    })

    // End and Home send the bar to the largest and smallest size the panel allows.
    await pressUntil('{End}', () => expect(handle).toHaveAttribute('aria-valuenow', '70'))
    await pressUntil('{Home}', () => expect(handle).toHaveAttribute('aria-valuenow', '20'))
    await expect(handle).toHaveFocus()
  }
}
