import { ChevronRight, File as FileIcon, Folder as FolderIcon } from '@keyline-icons/react'
import type { Meta, StoryObj } from '@storybook/tanstack-react'
import * as stylex from '@stylexjs/stylex'
import * as React from 'react'
import { expect, userEvent } from 'storybook/test'
import { cellOf } from '../../contracts/control-sizes'
import { Axis } from '../../contracts/story-axes'
import { colors } from '../../styles/colors.stylex'
import { fontFamily, fontSize, stroke, unit, container } from '../../styles/tokens.stylex'
import { fontWeight, radius } from '../../styles/tokens.stylex'
import { Button } from '../button'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './collapsible.component'

const meta = {
  title: 'Base Components/Collapsible',
  component: Collapsible,
  tags: [] // ['autodocs']
} satisfies Meta<typeof Collapsible>

type Story = StoryObj<typeof meta>

const styles = stylex.create({
  root: {
    display: 'flex',
    flexDirection: 'column',
    fontFamily: fontFamily.body,
    gap: unit.x2,
    width: container.medium
  },
  header: {
    alignItems: 'center',
    display: 'flex',
    justifyContent: 'space-between'
  },
  title: {
    fontSize: fontSize.body2,
    fontWeight: fontWeight.medium
  },
  panel: {
    display: 'flex',
    flexDirection: 'column',
    gap: unit.x2
  },
  repo: {
    borderColor: colors.borderNeutral,
    borderRadius: radius.medium,
    borderStyle: 'solid',
    borderWidth: stroke.ring1,
    fontFamily: fontFamily.monospace,
    fontSize: fontSize.body2,
    paddingBlock: unit.x2,
    paddingInline: unit.x3
  },
  icon: { height: 16, width: 16 },
  tree: {
    display: 'flex',
    flexDirection: 'column',
    fontFamily: fontFamily.monospace,
    fontSize: fontSize.body2
  },
  row: {
    alignItems: 'center',
    backgroundColor: {
      default: 'transparent',
      ':hover': colors.backgroundNeutralHighlightedFaded
    },
    borderRadius: radius.small,
    borderStyle: 'none',
    color: colors.foregroundNeutral,
    cursor: 'pointer',
    display: 'flex',
    fontFamily: fontFamily.monospace,
    fontSize: fontSize.body2,
    gap: unit.x1,
    outline: {
      default: 'none',
      ':focus-visible': `${stroke.ring2} solid ${colors.borderPrimary}`
    },
    // Read by the chevron below — StyleX has no child selectors, so the
    // trigger's [data-panel-open] state travels via a custom property.
    '--file-tree-chevron-rotation': {
      default: null,
      '[data-panel-open]': '90deg'
    },
    paddingBlock: unit.x1,
    paddingInline: unit.x1,
    textAlign: 'left',
    width: '100%'
  },
  file: {
    color: colors.foregroundNeutralFaded,
    cursor: 'default'
  },
  fileSpacer: {
    display: 'inline-block',
    width: 100
  },
  chevron: {
    transform: 'rotate(var(--file-tree-chevron-rotation, 0deg))',
    transitionDuration: '150ms',
    transitionProperty: 'transform'
  }
})

const indents = stylex.create({
  depth: (depth: number) => ({
    paddingLeft: `calc(${unit.x4} * ${depth})`
  })
})

function Folder({
  name,
  defaultOpen,
  depth = 0,
  children
}: {
  name: string
  defaultOpen?: boolean
  depth?: number
  children: React.ReactNode
}) {
  return (
    <Collapsible defaultOpen={defaultOpen}>
      <CollapsibleTrigger {...stylex.props(styles.row, indents.depth(depth))}>
        <ChevronRight {...stylex.props(styles.icon, styles.chevron)} />
        <FolderIcon {...stylex.props(styles.icon)} />
        <span>{name}</span>
      </CollapsibleTrigger>
      <CollapsibleContent>{children}</CollapsibleContent>
    </Collapsible>
  )
}

function File({ name, depth = 1 }: { name: string; depth?: number }) {
  return (
    <div {...stylex.props(styles.row, styles.file, indents.depth(depth))}>
      <span {...stylex.props(styles.fileSpacer)} />
      <FileIcon {...stylex.props(styles.icon)} />
      <span>{name}</span>
    </div>
  )
}

export default meta

export const Playground: Story = {
  // `defaultOpen` only seeds the state, so the render remounts the panel when it changes.
  parameters: { controls: { disable: false, include: ['defaultOpen', 'disabled'] } },
  argTypes: {
    defaultOpen: { control: 'boolean' },
    disabled: { control: 'boolean' }
  },
  args: { defaultOpen: true, disabled: false },
  render: ({ defaultOpen, ...args }) => (
    <Collapsible
      key={String(defaultOpen)}
      defaultOpen={defaultOpen}
      {...args}
      {...stylex.props(styles.root)}
    >
      <div {...stylex.props(styles.header)}>
        <span {...stylex.props(styles.title)}>@hermione starred 3 repositories</span>
        <CollapsibleTrigger render={<Button variant='ghost' size='small' />}>
          Alohomora
        </CollapsibleTrigger>
      </div>
      <div {...stylex.props(styles.repo)}>@marauders/map</div>
      <CollapsibleContent style={styles.panel}>
        <div {...stylex.props(styles.repo)}>@gringotts/vaults</div>
        <div {...stylex.props(styles.repo)}>@ministry/memos</div>
      </CollapsibleContent>
    </Collapsible>
  ),
  play: async ({ canvas }) => {
    const trigger = canvas.getByRole('button', { name: 'Alohomora' })
    await expect(trigger).toHaveAttribute('aria-expanded', 'true')

    const panel = document.getElementById(trigger.getAttribute('aria-controls') ?? '')
    await expect(panel).not.toBeNull()

    await userEvent.click(trigger)
    await expect(trigger).toHaveAttribute('aria-expanded', 'false')

    await userEvent.click(trigger)
    await expect(trigger).toHaveAttribute('aria-expanded', 'true')
  }
}

export const States: Story = {
  render: () => (
    <Axis axis='state' rows={['closed', 'open', 'disabled'] as const}>
      {(state) => (
        <Collapsible defaultOpen={state === 'open'} disabled={state === 'disabled'}>
          <CollapsibleTrigger render={<Button variant='outline' size='small' />}>
            Alohomora {state}
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div {...stylex.props(styles.repo)}>@gringotts/vaults</div>
          </CollapsibleContent>
        </Collapsible>
      )}
    </Axis>
  ),
  play: async ({ canvasElement }) => {
    const trigger = (state: string) => {
      const el = cellOf(canvasElement, 'state', state).querySelector('button')
      if (!el) throw new Error(`No trigger for ${state}`)
      return el
    }
    await expect(trigger('closed')).toHaveAttribute('aria-expanded', 'false')
    await expect(trigger('open')).toHaveAttribute('aria-expanded', 'true')

    const disabled = trigger('disabled')
    await expect(disabled).toHaveAttribute('data-disabled')
    await userEvent.click(disabled)
    await expect(disabled).toHaveAttribute('aria-expanded', 'false')
  }
}

export const FileTree: Story = {
  render: () => (
    <div {...stylex.props(styles.tree)}>
      <Folder name='marauders-map' defaultOpen depth={0}>
        <Folder name='spells' defaultOpen depth={1}>
          <File name='lumos.tsx' depth={2} />
          <File name='nox.tsx' depth={2} />
        </Folder>
        <File name='incantations.ts' depth={1} />
      </Folder>
      <Folder name='diagon-alley' depth={0}>
        <File name='golden-snitch.ico' depth={1} />
      </Folder>
      <File name='horcrux.json' depth={0} />
    </div>
  ),
  play: async ({ canvas }) => {
    const closed = canvas.getByRole('button', { name: /diagon-alley/i })
    await expect(closed).toHaveAttribute('aria-expanded', 'false')

    // Opening a folder reveals nested files, and nested folders compose.
    await userEvent.click(closed)
    await expect(closed).toHaveAttribute('aria-expanded', 'true')
    await expect(canvas.getByText('golden-snitch.ico')).toBeInTheDocument()
  }
}
