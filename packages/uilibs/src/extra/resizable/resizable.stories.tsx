import type { Meta, StoryObj } from '@storybook/tanstack-react'
import atoms from '@stylexjs/atoms'
import * as stylex from '@stylexjs/stylex'
import * as React from 'react'
import type { GroupImperativeHandle } from 'react-resizable-panels'
import { expect, userEvent, waitFor } from 'storybook/test'
import { Button } from '../../base/button'
import { Axis } from '../../contracts/story-axes'
import { colors } from '../../styles/colors.stylex'
import { container, radius, stroke, unit } from '../../styles/tokens.stylex'
import { fontLineHeight, fontSize, fontWeight } from '../../styles/tokens.stylex'
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from './resizable.component'

const meta = {
  title: 'Extra Components/Resizable',
  component: ResizablePanelGroup,
  parameters: { layout: 'fullscreen' },
  tags: [], // ['autodocs']
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

export const Playground: Story = {
  render: () => (
    <ResizablePanelGroup style={styles.frame}>
      <ResizablePanel id='sidebar' defaultSize='25%' minSize='15%' style={styles.content}>
        Sidebar
      </ResizablePanel>
      <ResizableHandle aria-label='Resize sidebar' />
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
  parameters: { canvas: 'auto' },
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

/** Each group flows along its own axis, and the arrow keys grow the first panel along it. */
export const Orientations: Story = {
  parameters: { canvas: 'auto' },
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
