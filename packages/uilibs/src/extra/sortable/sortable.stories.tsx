import { Image, MusicNote, Film } from '@keyline-icons/react'
import { ChevronRight, FileText, GripVertical } from '@keyline-icons/react'
import type { Meta, StoryObj } from '@storybook/tanstack-react'
import * as stylex from '@stylexjs/stylex'
import { useRef, useState } from 'react'
import { expect, fn, userEvent, waitFor } from 'storybook/test'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../../base/collapsible'
import { Switch } from '../../base/switch'
import { toast } from '../../base/toast'
import { cellOf } from '../../contracts/control-sizes'
import { pressUntil } from '../../contracts/keyboard'
import { lifted, live, untilOpaque } from '../../contracts/overlay'
import { Axis } from '../../contracts/story-axes'
import { colors, shadow } from '../../styles/colors.stylex'
import {
  breakpoints,
  stroke,
  unit,
  duration,
  easing,
  radius,
  zIndex
} from '../../styles/tokens.stylex'
import { fontFamily, fontSize, fontLineHeight, fontWeight } from '../../styles/tokens.stylex'
import type { StyleProp } from '../../styles/types'
import { Badge } from '../badge'
import { Card, CardDescription, CardHeader, CardTitle } from '../card'
import { Sortable, SortableItem, SortableItemHandle, SortableOverlay } from './'
import type { SortableCommitMeta, SortableRootProps } from './'

const meta = {
  title: 'Extra Components/Sortable',
  tags: [] // ['autodocs']
} satisfies Meta

export default meta

type Story = StoryObj<typeof meta>

// Shared layout helpers for the stories.
const styles = stylex.create({
  page: {
    display: 'flex',
    flexDirection: 'column',
    gap: unit.x6,
    marginInline: 'auto',
    maxWidth: '48rem',
    paddingBlock: unit.x6,
    paddingInline: unit.x5,
    width: '100%'
  },
  card: {
    width: '100%'
  },
  cardBody: {
    display: 'flex',
    flexDirection: 'column',
    gap: unit.x2,
    paddingInline: unit.x5,
    paddingBlockEnd: unit.x5
  },
  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: unit.x2
  },
  listTight: {
    display: 'flex',
    flexDirection: 'column',
    gap: unit.x1
  },
  grid: {
    display: 'grid',
    gap: unit.x3,
    gridAutoFlow: 'dense',
    gridAutoRows: '1fr',
    gridTemplateColumns: 'repeat(3, minmax(0, 1fr))'
  },
  row: {
    alignItems: 'center',
    backgroundColor: colors.backgroundElevationBase,
    borderColor: colors.borderNeutralFaded,
    borderRadius: radius.medium,
    borderStyle: 'solid',
    borderWidth: stroke.ring1,
    boxSizing: 'border-box',
    display: 'flex',
    fontFamily: fontFamily.body,
    fontSize: fontSize.body2,
    gap: unit.x3,
    height: '100%',
    lineHeight: fontLineHeight.body2,
    paddingBlock: unit.x3,
    paddingInline: unit.x3,
    width: '100%',
    transitionDuration: duration.medium,
    transitionProperty: 'background-color, border-color, box-shadow, transform',
    transitionTimingFunction: easing.decelerate,
    transform: 'translateY(0)',
    ':hover': {
      backgroundColor: colors.backgroundNeutralHighlightedFaded,
      borderColor: colors.borderNeutral,
      boxShadow: shadow.outline,
      transform: 'translateY(-1px)'
    },
    ':active': {
      transform: 'translateY(0)',
      backgroundColor: colors.backgroundNeutralFaded
    }
  },
  rowMuted: {
    backgroundColor: colors.backgroundNeutralFaded
  },
  rowBody: {
    display: 'flex',
    flex: 1,
    flexDirection: 'column',
    gap: unit.x0_5,
    minWidth: 0
  },
  rowTitle: {
    fontWeight: fontWeight.medium
  },
  rowMeta: {
    color: colors.foregroundNeutralFaded,
    fontSize: fontSize.caption1,
    lineHeight: fontLineHeight.caption1
  },
  metaRow: {
    alignItems: 'center',
    display: 'flex',
    gap: unit.x2
  },
  iconTile: {
    alignItems: 'center',
    backgroundColor: colors.backgroundPrimaryFaded,
    borderRadius: radius.small,
    color: colors.foregroundPrimary,
    display: 'flex',
    flexShrink: 0,
    height: unit.x8,
    justifyContent: 'center',
    width: unit.x8
  },
  featuredCell: {
    gridColumn: {
      default: 'span 2',
      [breakpoints.medium]: 'span 2'
    },
    gridRow: 'span 2'
  },
  gridCell: {
    alignItems: 'flex-start',
    flexDirection: 'column',
    gap: unit.x2,
    justifyContent: 'space-between',
    minHeight: unit.x20,
    width: '100%'
  },
  gridHandle: {
    height: 'fit-content',
    opacity: {
      default: 0,
      ':hover': 1,
      ':focus-visible': 1,
      ':active': 1,
      [stylex.when.ancestor(':hover')]: 1,
      '@media (pointer: coarse)': 1
    },
    position: 'absolute',
    right: unit.x3,
    top: unit.x3,
    width: 'fit-content'
  },
  gridFooter: {
    alignItems: 'center',
    display: 'flex',
    gap: unit.x2,
    justifyContent: 'space-between',
    width: '100%'
  },
  // Media library: fixed 3×2 image grid.
  mediaGrid: {
    display: 'grid',
    gap: unit.x3,
    gridTemplateColumns: 'repeat(3, minmax(0, 1fr))'
  },
  orderNumber: {
    alignItems: 'center',
    backgroundColor: colors.backgroundNeutral,
    borderRadius: radius.full,
    color: colors.foregroundNeutral,
    display: 'flex',
    flexShrink: 0,
    fontSize: fontSize.caption1,
    fontWeight: fontWeight.semibold,
    height: unit.x6,
    justifyContent: 'center',
    width: unit.x6
  },
  // Nested groups (collapsible)
  listCompact: {
    display: 'flex',
    flexDirection: 'column',
    gap: unit.x2
  },
  groupContainer: {
    width: '100%'
  },
  groupRow: {
    alignItems: 'center',
    display: 'flex',
    gap: unit.x2
  },
  groupHeader: {
    alignItems: 'center',
    backgroundColor: colors.backgroundElevationBase,
    borderColor: colors.borderNeutralFaded,
    borderRadius: radius.medium,
    borderStyle: 'solid',
    borderWidth: stroke.ring1,
    boxSizing: 'border-box',
    cursor: 'pointer',
    display: 'flex',
    fontFamily: fontFamily.body,
    fontSize: fontSize.body2,
    gap: unit.x2,
    justifyContent: 'space-between',
    lineHeight: fontLineHeight.body2,
    paddingBlock: unit.x2,
    paddingInline: unit.x2,
    userSelect: 'none',
    width: '100%',
    transitionDuration: duration.medium,
    transitionProperty: 'background-color, border-color, box-shadow, transform',
    transitionTimingFunction: easing.decelerate,
    transform: 'translateY(0)',
    ':hover': {
      backgroundColor: colors.backgroundNeutralHighlightedFaded,
      borderColor: colors.borderNeutral,
      boxShadow: shadow.outline,
      transform: 'translateY(-1px)'
    },
    ':active': {
      transform: 'translateY(0)',
      backgroundColor: colors.backgroundNeutralFaded
    }
  },
  groupHeaderOpen: {
    backgroundColor: colors.backgroundNeutralHighlightedFaded,
    borderColor: colors.borderNeutral,
    boxShadow: shadow.outline
  },
  groupTitle: {
    fontSize: fontSize.body2,
    fontWeight: fontWeight.medium,
    lineHeight: fontLineHeight.body2
  },
  groupHeaderRight: {
    alignItems: 'center',
    display: 'flex',
    gap: unit.x1
  },
  groupBadge: {
    fontSize: fontSize.caption1,
    fontWeight: fontWeight.medium
  },
  groupChevron: {
    color: colors.foregroundNeutral,
    transitionDuration: duration.medium,
    transitionProperty: 'transform',
    transitionTimingFunction: easing.decelerate,
    transform: 'rotate(0deg)'
  },
  groupChevronOpen: {
    transform: 'rotate(90deg)'
  },
  groupPanel: {
    display: 'flex',
    flexDirection: 'column',
    gap: unit.x1,
    paddingBlockStart: unit.x2,
    paddingInline: unit.x1
  },
  rowCompact: {
    paddingBlock: unit.x2,
    paddingInline: unit.x2
  },
  textCaption: {
    color: colors.foregroundNeutralFaded,
    fontSize: fontSize.caption1,
    lineHeight: fontLineHeight.caption1
  }
})

function Handle({ style }: StyleProp) {
  return (
    <SortableItemHandle style={style}>
      <GripVertical size={16} />
    </SortableItemHandle>
  )
}

// -- c-sortable-1: list of file items ---------------------------------------

interface FileEntry {
  id: string
  title: string
  description: string
  type: 'image' | 'document' | 'audio' | 'video'
  size: string
}

const defaultFiles: FileEntry[] = [
  {
    id: '1',
    title: 'Product Demo',
    description: 'Main product image',
    type: 'image',
    size: '2.4 MB'
  },
  {
    id: '2',
    title: 'Product Specification',
    description: 'Technical details document',
    type: 'document',
    size: '1.2 MB'
  },
  {
    id: '3',
    title: 'Product Demo Video',
    description: 'How to use the product',
    type: 'video',
    size: '15.7 MB'
  },
  {
    id: '4',
    title: 'Product Audio Guide',
    description: 'Audio instructions',
    type: 'audio',
    size: '8.3 MB'
  },
  {
    id: '5',
    title: 'Product Gallery',
    description: 'Additional product view',
    type: 'image',
    size: '3.1 MB'
  }
]

function FileTypeIcon({ type }: { type: FileEntry['type'] }) {
  const Icon =
    type === 'image' ? Image : type === 'document' ? FileText : type === 'audio' ? MusicNote : Film
  return (
    <span {...stylex.props(styles.iconTile)}>
      <Icon size={16} />
    </span>
  )
}

function ListOfItems() {
  const [items, setItems] = useState(defaultFiles)

  return (
    <div {...stylex.props(styles.page)}>
      <Sortable
        value={items}
        onValueChange={setItems}
        getItemValue={(item) => item.id}
        style={styles.list}
      >
        {items.map((item) => (
          <SortableItem key={item.id} value={item.id}>
            <div {...stylex.props(styles.row)}>
              <Handle />
              <FileTypeIcon type={item.type} />
              <div {...stylex.props(styles.rowBody)}>
                <span {...stylex.props(styles.rowTitle)}>{item.title}</span>
                <span {...stylex.props(styles.rowMeta)}>{item.description}</span>
              </div>
              <div {...stylex.props(styles.metaRow)}>
                <Badge variant='faded'>{item.type}</Badge>
                <span {...stylex.props(styles.rowMeta)}>{item.size}</span>
              </div>
            </div>
          </SortableItem>
        ))}
      </Sortable>
    </div>
  )
}

const playgroundFiles: FileEntry[] = [
  {
    id: '1',
    title: 'Marauder’s Map',
    description: 'Every corridor of Hogwarts',
    type: 'document',
    size: '1.2 MB'
  },
  {
    id: '2',
    title: 'Pensieve Memory',
    description: 'Dumbledore’s memory of Tom Riddle',
    type: 'video',
    size: '15.7 MB'
  },
  {
    id: '3',
    title: 'Cryptex Blueprint',
    description: 'Da Vinci’s five-dial design',
    type: 'image',
    size: '3.1 MB'
  },
  {
    id: '4',
    title: 'Hedwig’s Song',
    description: 'Recorded in the Owlery',
    type: 'audio',
    size: '8.3 MB'
  },
  {
    id: '5',
    title: 'Mona Lisa Scan',
    description: 'Louvre, Salle des États',
    type: 'image',
    size: '2.4 MB'
  },
  {
    id: '6',
    title: 'Hogwarts Letter',
    description: 'Addressed to the cupboard under the stairs',
    type: 'document',
    size: '0.4 MB'
  }
]

// `strategy` is the root's; the other three choose what the story composes around it.
type PlaygroundArgs = Pick<SortableRootProps<FileEntry>, 'strategy' | 'onValueCommit'> & {
  layout: 'list' | 'grid'
  handle: boolean
  overlay: boolean
}

const strategies: NonNullable<SortableRootProps<FileEntry>['strategy']>[] = [
  'vertical',
  'horizontal',
  'grid'
]

function SortablePlayground({ strategy, onValueCommit, layout, handle, overlay }: PlaygroundArgs) {
  const [items, setItems] = useState(playgroundFiles)
  const grid = layout === 'grid'

  return (
    <div {...stylex.props(styles.page)}>
      <Sortable
        value={items}
        onValueChange={setItems}
        onValueCommit={onValueCommit}
        getItemValue={(item) => item.id}
        strategy={strategy}
        style={grid ? styles.grid : styles.list}
      >
        {items.map((item) => (
          <SortableItem key={item.id} value={item.id}>
            <div {...stylex.props(styles.row, grid && styles.gridCell)}>
              {handle && <Handle style={grid ? styles.gridHandle : undefined} />}
              {!grid && <FileTypeIcon type={item.type} />}
              <div {...stylex.props(styles.rowBody)}>
                <span {...stylex.props(styles.rowTitle)}>{item.title}</span>
                <span {...stylex.props(styles.rowMeta)}>{item.description}</span>
              </div>
              <div {...stylex.props(grid ? styles.gridFooter : styles.metaRow)}>
                <Badge variant='faded'>{item.type}</Badge>
                <span {...stylex.props(styles.rowMeta)}>{item.size}</span>
              </div>
            </div>
          </SortableItem>
        ))}
        {overlay && (
          <SortableOverlay>
            {({ value }) => (
              <div {...stylex.props(styles.row, styles.rowMuted)}>
                {items.find((item) => item.id === value)?.title}
              </div>
            )}
          </SortableOverlay>
        )}
      </Sortable>
    </div>
  )
}

export const Playground: StoryObj<PlaygroundArgs> = {
  parameters: {
    controls: { disable: false, include: ['strategy', 'layout', 'handle', 'overlay'] }
  },
  argTypes: {
    strategy: { control: 'radio', options: strategies },
    layout: { control: 'radio', options: ['list', 'grid'] },
    handle: { control: 'boolean' },
    overlay: { control: 'boolean' }
  },
  args: {
    strategy: 'vertical',
    layout: 'list',
    handle: true,
    overlay: false,
    onValueCommit: fn()
  },
  render: (args) => <SortablePlayground {...args} />
}

// -- c-sortable-2: grid layout ----------------------------------------------

interface GridEntry {
  id: string
  title: string
  description: string
  type: 'image' | 'document' | 'audio' | 'video' | 'featured'
  size: string
}

const defaultGridItems: GridEntry[] = [
  { id: '1', title: 'Hero Image', description: 'Main banner image', type: 'image', size: '2.4 MB' },
  {
    id: '2',
    title: 'Product Specs',
    description: 'Technical documentation',
    type: 'document',
    size: '1.2 MB'
  },
  {
    id: '3',
    title: 'Demo Video',
    description: 'Product demonstration',
    type: 'video',
    size: '15.7 MB'
  },
  {
    id: '4',
    title: 'Audio Guide',
    description: 'Voice instructions',
    type: 'audio',
    size: '8.3 MB'
  },
  {
    id: '5',
    title: 'Gallery Photo 1',
    description: 'Product view 1',
    type: 'image',
    size: '3.1 MB'
  },
  {
    id: '6',
    title: 'Gallery Photo 2',
    description: 'Product view 2',
    type: 'image',
    size: '2.8 MB'
  },
  {
    id: '7',
    title: 'User Manual',
    description: 'Installation guide',
    type: 'document',
    size: '4.2 MB'
  },
  {
    id: '8',
    title: 'Background Music',
    description: 'Ambient soundtrack',
    type: 'audio',
    size: '12.1 MB'
  },
  {
    id: '9',
    title: 'Feature Highlight',
    description: 'Key product features',
    type: 'featured',
    size: 'N/A'
  }
]

function GridOfItems() {
  const [items, setItems] = useState(defaultGridItems)

  return (
    <div {...stylex.props(styles.page)}>
      <Sortable
        value={items}
        onValueChange={setItems}
        getItemValue={(item) => item.id}
        strategy='grid'
        style={styles.grid}
      >
        {items.map((item) => (
          <SortableItem key={item.id} value={item.id}>
            <div
              {...stylex.props(
                styles.row,
                styles.gridCell,
                item.type === 'featured' && styles.rowMuted,
                item.type === 'featured' && styles.featuredCell
              )}
            >
              <Handle style={styles.gridHandle} />
              <div {...stylex.props(styles.rowBody)}>
                <span {...stylex.props(styles.rowTitle)}>{item.title}</span>
                <span {...stylex.props(styles.rowMeta)}>{item.description}</span>
              </div>
              <div {...stylex.props(styles.gridFooter)}>
                <Badge variant='faded'>{item.type}</Badge>
                {item.type !== 'featured' && (
                  <span {...stylex.props(styles.rowMeta)}>{item.size}</span>
                )}
              </div>
            </div>
          </SortableItem>
        ))}
      </Sortable>
    </div>
  )
}

/** The `strategy` of the list: items stacked in a column, or laid out on a grid. */
export const Layouts: Story = {
  parameters: {
    docs: {
      source: {
        code: `<Sortable
  value={items}
  onValueChange={setItems}
  getItemValue={(item) => item.id}
  strategy='grid'
>
  {items.map((item) => (
    <SortableItem key={item.id} value={item.id}>
      {item.title}
    </SortableItem>
  ))}
</Sortable>`
      }
    }
  },
  render: () => (
    <Axis axis='layout' rows={['vertical', 'grid'] as const} wide>
      {(layout) => (layout === 'vertical' ? <ListOfItems /> : <GridOfItems />)}
    </Axis>
  ),
  play: async ({ canvasElement }) => {
    const items = (layout: string) =>
      Array.from(
        cellOf(canvasElement, 'layout', layout).querySelectorAll('[data-slot="sortable-item"]')
      ).map((el) => el.getBoundingClientRect())
    const [v1, v2] = items('vertical')
    const [g1, g2] = items('grid')
    if (!v1 || !v2 || !g1 || !g2) throw new Error('Sortable items not found')
    // A list stacks its items; a grid puts neighbours on one row.
    await expect(v2.top).toBeGreaterThan(v1.top)
    await expect(g2.top).toBe(g1.top)
    await expect(g2.left).toBeGreaterThan(g1.left)
  }
}

// -- c-sortable-3: nested (groups + child lists) ----------------------------

interface OptionValue {
  id: string
  value: string
}

interface OptionGroup {
  id: string
  name: string
  values: OptionValue[]
}

const defaultOptionGroups: OptionGroup[] = [
  {
    id: '1',
    name: 'Colors',
    values: [
      { id: '1-1', value: 'White' },
      { id: '1-2', value: 'Black' },
      { id: '1-3', value: 'Grey' },
      { id: '1-4', value: 'Green' }
    ]
  },
  {
    id: '2',
    name: 'Sizes',
    values: [
      { id: '2-1', value: 'Small' },
      { id: '2-2', value: 'Medium' },
      { id: '2-3', value: 'Large' }
    ]
  },
  {
    id: '3',
    name: 'Materials',
    values: [
      { id: '3-1', value: 'Cotton' },
      { id: '3-2', value: 'Polyester' },
      { id: '3-3', value: 'Wool' }
    ]
  }
]

export const NestedGroups: Story = {
  name: 'Nested groups',
  render: () => {
    const [optionGroups, setOptionGroups] = useState(defaultOptionGroups)

    const handleChildReorder = (groupId: string, newValues: OptionValue[]) => {
      setOptionGroups((prev) =>
        prev.map((group) => (group.id === groupId ? { ...group, values: newValues } : group))
      )
    }

    return (
      <div {...stylex.props(styles.page)}>
        <Sortable
          value={optionGroups}
          onValueChange={setOptionGroups}
          getItemValue={(group) => group.id}
          strategy='vertical'
          style={styles.listCompact}
        >
          {optionGroups.map((group) => (
            <SortableItem key={group.id} value={group.id}>
              <div {...stylex.props(styles.groupContainer)}>
                <Collapsible defaultOpen={group.id === '1'}>
                  {/* The handle sits beside the trigger: a button cannot hold another control. */}
                  <div {...stylex.props(styles.groupRow)}>
                    <Handle />
                    <CollapsibleTrigger
                      render={(props, state) => (
                        <button
                          type='button'
                          {...props}
                          {...stylex.props(
                            styles.groupHeader,
                            state.open && styles.groupHeaderOpen
                          )}
                        >
                          <span {...stylex.props(styles.groupTitle)}>{group.name}</span>
                          <div {...stylex.props(styles.groupHeaderRight)}>
                            <Badge variant='outline' style={styles.groupBadge}>
                              {group.values.length}
                            </Badge>
                            <ChevronRight
                              size={14}
                              {...stylex.props(
                                styles.groupChevron,
                                state.open && styles.groupChevronOpen
                              )}
                            />
                          </div>
                        </button>
                      )}
                    />
                  </div>
                  <CollapsibleContent>
                    <div {...stylex.props(styles.groupPanel)}>
                      <Sortable
                        value={group.values}
                        onValueChange={(newValues) => handleChildReorder(group.id, newValues)}
                        getItemValue={(value) => value.id}
                        strategy='vertical'
                        style={styles.listTight}
                      >
                        {group.values.map((value) => (
                          <SortableItem key={value.id} value={value.id}>
                            <div {...stylex.props(styles.row, styles.rowMuted, styles.rowCompact)}>
                              <Handle />
                              <span {...stylex.props(styles.rowTitle, styles.textCaption)}>
                                {value.value}
                              </span>
                            </div>
                          </SortableItem>
                        ))}
                      </Sortable>
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              </div>
            </SortableItem>
          ))}
        </Sortable>
      </div>
    )
  }
}

// -- c-sortable-4: playlist with frame --------------------------------------

interface Track {
  id: string
  title: string
  artist: string
  album: string
  duration: string
  plays: string
  active?: boolean
}

const defaultTracks: Track[] = [
  {
    id: '1',
    title: 'Midnight City',
    artist: 'M83',
    album: "Hurry Up, We're Dreaming",
    duration: '4:03',
    plays: '1.2B',
    active: true
  },
  {
    id: '2',
    title: 'Digital Love',
    artist: 'Daft Punk',
    album: 'Discovery',
    duration: '4:58',
    plays: '845M'
  },
  {
    id: '3',
    title: 'Starlight',
    artist: 'Muse',
    album: 'Black Holes',
    duration: '3:59',
    plays: '720M'
  },
  {
    id: '4',
    title: 'Take On Me',
    artist: 'a-ha',
    album: 'Hunting High and Low',
    duration: '3:48',
    plays: '1.8B'
  },
  {
    id: '5',
    title: 'Blue Monday',
    artist: 'New Order',
    album: 'Power, Corruption',
    duration: '7:29',
    plays: '530M'
  }
]

export const Playlist: Story = {
  name: 'Playlist',
  render: () => {
    const [tracks, setTracks] = useState(defaultTracks)

    return (
      <div {...stylex.props(styles.page)}>
        <Card style={styles.card}>
          <CardHeader>
            <div>
              <CardTitle>Queue</CardTitle>
              <CardDescription>{tracks.length} tracks</CardDescription>
            </div>
            <Badge variant='solid'>Playlist</Badge>
          </CardHeader>
          <div {...stylex.props(styles.cardBody)}>
            <Sortable
              value={tracks}
              onValueChange={setTracks}
              getItemValue={(item) => item.id}
              strategy='vertical'
              style={styles.listTight}
            >
              {tracks.map((track) => (
                <SortableItem key={track.id} value={track.id}>
                  <div {...stylex.props(styles.row, track.active && styles.rowMuted)}>
                    <Handle />
                    <div {...stylex.props(styles.rowBody)}>
                      <div {...stylex.props(styles.metaRow)}>
                        <span {...stylex.props(styles.rowTitle)}>{track.title}</span>
                        {track.active && <Badge variant='solid'>Playing</Badge>}
                      </div>
                      <span {...stylex.props(styles.rowMeta)}>
                        {track.artist} · {track.album}
                      </span>
                    </div>
                    <span {...stylex.props(styles.rowMeta)}>{track.plays}</span>
                    <span {...stylex.props(styles.rowMeta)}>{track.duration}</span>
                  </div>
                </SortableItem>
              ))}
            </Sortable>
          </div>
        </Card>
      </div>
    )
  }
}

// -- c-sortable-5: settings priority with switches --------------------------

interface NotificationChannel {
  id: string
  name: string
  description: string
  enabled: boolean
}

const defaultChannels: NotificationChannel[] = [
  { id: '1', name: 'Email', description: 'Send notifications via email', enabled: true },
  { id: '2', name: 'Push Notifications', description: 'Browser and mobile push', enabled: true },
  { id: '3', name: 'SMS', description: 'Text message alerts', enabled: false },
  { id: '4', name: 'Slack', description: 'Post to Slack channels', enabled: true },
  { id: '5', name: 'Webhook', description: 'Send to custom endpoint', enabled: false }
]

export const SettingsPriority: Story = {
  name: 'Settings priority',
  render: () => {
    const [channels, setChannels] = useState(defaultChannels)

    const toggleChannel = (id: string) => {
      setChannels((prev) => prev.map((ch) => (ch.id === id ? { ...ch, enabled: !ch.enabled } : ch)))
    }

    return (
      <div {...stylex.props(styles.page)}>
        <Card style={styles.card}>
          <CardHeader>
            <div>
              <CardTitle>Notification Priority</CardTitle>
              <CardDescription>
                Drag to reorder by priority. Top channels are tried first.
              </CardDescription>
            </div>
          </CardHeader>
          <div {...stylex.props(styles.cardBody)}>
            <Sortable
              value={channels}
              onValueChange={setChannels}
              getItemValue={(item) => item.id}
              strategy='vertical'
              style={styles.listTight}
            >
              {channels.map((channel) => (
                <SortableItem key={channel.id} value={channel.id}>
                  <div {...stylex.props(styles.row)}>
                    <Handle />
                    <div {...stylex.props(styles.rowBody)}>
                      <span {...stylex.props(styles.rowTitle)}>{channel.name}</span>
                      <span {...stylex.props(styles.rowMeta)}>{channel.description}</span>
                    </div>
                    <Switch
                      checked={channel.enabled}
                      onCheckedChange={() => toggleChannel(channel.id)}
                      aria-label={`Toggle ${channel.name}`}
                    />
                  </div>
                </SortableItem>
              ))}
            </Sortable>
          </div>
        </Card>
      </div>
    )
  }
}

// -- c-sortable-7: image gallery grid ---------------------------------------

interface GalleryImage {
  id: string
  name: string
  alt: string
  /** Unsplash photo id used to build the thumbnail URL. */
  photo: string
}

const defaultImages: GalleryImage[] = [
  {
    id: '1',
    name: 'hero-banner.jpg',
    alt: 'Mountain lake at dawn',
    photo: 'photo-1506905925346-21bda4d32df4'
  },
  {
    id: '2',
    name: 'product-shot.png',
    alt: 'Minimal workspace desk',
    photo: 'photo-1499951360447-b19be8fe80f5'
  },
  {
    id: '3',
    name: 'team-photo.jpg',
    alt: 'City skyline at night',
    photo: 'photo-1477959858617-67f85cf4f1df'
  },
  {
    id: '4',
    name: 'forest-walk.jpg',
    alt: 'Foggy forest path',
    photo: 'photo-1441974231531-c6227db76b6e'
  },
  {
    id: '5',
    name: 'og-image.png',
    alt: 'Desert dunes at sunset',
    photo: 'photo-1509316785289-025f5b846b35'
  },
  {
    id: '6',
    name: 'favicon.jpg',
    alt: 'Northern lights',
    photo: 'photo-1483347756197-71ef80e95f73'
  }
]

// Media cells: image fills the tile, overlay handle top-right, caption below.
const mediaStyles = stylex.create({
  cell: {
    backgroundColor: colors.backgroundNeutralFaded,
    borderRadius: radius.medium,
    display: 'flex',
    flexDirection: 'column',
    gap: unit.x2,
    height: '100%',
    overflow: 'hidden',
    paddingBlock: unit.x2,
    paddingInline: unit.x3,
    width: '100%'
  },
  thumb: {
    aspectRatio: '4 / 3',
    backgroundColor: colors.backgroundNeutral,
    borderRadius: radius.small,
    display: 'block',
    objectFit: 'cover',
    position: 'relative',
    width: '100%',
    transitionDuration: duration.medium,
    transitionProperty: 'transform, filter',
    transitionTimingFunction: easing.decelerate,
    transform: {
      default: 'scale(1)',
      ':hover': 'scale(1.02)'
    },
    filter: {
      default: 'brightness(1)',
      ':hover': 'brightness(1.05)'
    }
  },
  handleWrapper: {
    margin: 0,
    position: 'relative',
    width: '100%'
  },
  imageHandleOverlay: {
    backgroundColor: 'transparent',
    borderRadius: 0,
    bottom: 0,
    boxShadow: 'none',
    cursor: 'grab',
    left: 0,
    padding: 0,
    position: 'absolute',
    right: 0,
    top: 0,
    display: 'block',
    height: '100%',
    opacity: 1,
    width: '100%',
    touchAction: 'none',
    zIndex: zIndex.raised
  },
  imageHandleIcon: {
    position: 'absolute',
    right: unit.x2,
    top: unit.x2,
    opacity: 0,
    transform: 'translateY(-4px)',
    transitionDuration: duration.medium,
    transitionProperty: 'opacity, transform',
    transitionTimingFunction: easing.decelerate,
    [stylex.when.ancestor(':hover')]: { opacity: 0 }
  },
  caption: {
    display: 'flex',
    flexDirection: 'column',
    gap: unit.x1,
    paddingBlock: unit.x2,
    paddingInline: unit.x3
  },
  captionTitle: {
    fontSize: fontSize.body2,
    fontWeight: fontWeight.medium,
    lineHeight: fontLineHeight.body2
  },
  captionMeta: {
    color: colors.foregroundNeutralFaded,
    fontSize: fontSize.caption1,
    lineHeight: fontLineHeight.caption1
  }
})

// Compact handle for media grid — icon-only, appears on cell hover.
function MediaHandle() {
  return (
    <SortableItemHandle style={mediaStyles.imageHandleOverlay}>
      <span {...stylex.props(mediaStyles.imageHandleIcon)}>
        <GripVertical size={14} />
      </span>
    </SortableItemHandle>
  )
}

export const MediaLibrary: Story = {
  name: 'Media library',
  render: () => {
    const [images, setImages] = useState(defaultImages)

    return (
      <div {...stylex.props(styles.page)}>
        <Card style={styles.card}>
          <CardHeader>
            <div>
              <CardTitle>Media Library</CardTitle>
              <CardDescription>Drag to reorder display priority</CardDescription>
            </div>
          </CardHeader>
          <div {...stylex.props(styles.cardBody)}>
            <Sortable
              value={images}
              onValueChange={setImages}
              getItemValue={(image) => image.id}
              strategy='grid'
              style={styles.mediaGrid}
            >
              {images.map((image) => (
                <SortableItem key={image.id} value={image.id}>
                  <figure {...stylex.props(mediaStyles.cell)}>
                    <div {...stylex.props(mediaStyles.handleWrapper)}>
                      <MediaHandle />
                      <img
                        src={`https://images.unsplash.com/${image.photo}?w=600&dpr=2&q=80`}
                        alt={image.alt}
                        loading='lazy'
                        {...stylex.props(mediaStyles.thumb)}
                      />
                    </div>
                    <figcaption {...stylex.props(mediaStyles.caption)}>
                      <span {...stylex.props(mediaStyles.captionTitle)}>{image.name}</span>
                      <span {...stylex.props(mediaStyles.captionMeta)}>{image.alt}</span>
                    </figcaption>
                  </figure>
                </SortableItem>
              ))}
            </Sortable>
          </div>
        </Card>
      </div>
    )
  }
}

// -- c-sortable-8: persisted order with rollback ----------------------------

interface Task {
  id: string
  title: string
}

const defaultTasks: Task[] = [
  { id: '1', title: 'Draft the release notes' },
  { id: '2', title: 'Review open pull requests' },
  { id: '3', title: 'Update the changelog' },
  { id: '4', title: 'Cut the release tag' },
  { id: '5', title: 'Announce on the blog' }
]

/** The args of the stories that persist: the backend's latency and how often it rejects. */
interface PersistArgs {
  latency: number
  failRate: number
}

// Simulated backend. Swap for a tRPC mutation or fetch in your app. It rejects `failRate` of the
// calls, spread evenly (0.25 rejects every fourth), never at random, so a run is repeatable: set
// `failRate` to 0.5 or more to see the optimistic rollback.
function persistOrder({ latency, failRate }: PersistArgs, attempt: number): Promise<void> {
  const fails = Math.floor(attempt * failRate) > Math.floor((attempt - 1) * failRate)
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (fails) {
        reject(new Error('Network error'))
      } else {
        resolve()
      }
    }, latency)
  })
}

export const PersistedOrder: StoryObj<PersistArgs> = {
  args: { latency: 700, failRate: 0 },
  parameters: {
    docs: {
      source: {
        code: `<Sortable
  value={items}
  onValueChange={setItems}
  onValueCommit={(next, { previousValue, overIndex }) => save(next).catch(() => setItems(previousValue))}
  getItemValue={(item) => item.id}
>
  {items.map((item) => (
    <SortableItem key={item.id} value={item.id}>
      <SortableItemHandle />
      {item.title}
    </SortableItem>
  ))}
</Sortable>`
      }
    }
  },
  name: 'Persisted order',
  render: ({ latency, failRate }) => {
    const [items, setItems] = useState(defaultTasks)
    const attempts = useRef(0)

    // Sortable commits once, on drop. `onValueChange` has already applied the
    // new order optimistically; meta.previousValue is the order before the drag.
    const handleValueCommit = (next: Task[], commit: SortableCommitMeta<Task>) => {
      const previous = commit.previousValue
      const movedTitle = next[commit.overIndex]?.title ?? 'item'

      attempts.current += 1
      void toast.promise(persistOrder({ latency, failRate }, attempts.current), {
        loading: { title: 'Saving order...' },
        success: { title: `Saved "${movedTitle}" at position ${commit.overIndex + 1}` },
        // Roll back to the pre-drag order. In production prefer a refetch
        // here so a newer drag is not clobbered by this snapshot.
        error: () => {
          setItems(previous)
          return { title: 'Could not save the new order. Restored.' }
        }
      })
    }

    return (
      <div {...stylex.props(styles.page)}>
        <Sortable
          value={items}
          onValueChange={setItems}
          onValueCommit={handleValueCommit}
          getItemValue={(item) => item.id}
          strategy='vertical'
          style={styles.list}
        >
          {items.map((item, index) => (
            <SortableItem key={item.id} value={item.id}>
              <div {...stylex.props(styles.row)}>
                <Handle />
                <span {...stylex.props(styles.orderNumber)}>{index + 1}</span>
                <span {...stylex.props(styles.rowTitle)}>{item.title}</span>
              </div>
            </SortableItem>
          ))}
        </Sortable>
      </div>
    )
  }
}

/** A keyboard drag is announced by the item's name, in the language `labels` give. */
export const KeyboardAnnouncements: Story = {
  render: () => {
    const [items, setItems] = useState(defaultFiles.slice(0, 3))

    return (
      <div {...stylex.props(styles.page)}>
        <Sortable
          value={items}
          onValueChange={setItems}
          getItemValue={(item) => item.id}
          style={styles.list}
          labels={{
            pickedUp: (name) => `Diangkat: ${name}.`,
            movedOver: (name, over) => `${name} di atas ${over}.`,
            dropped: (name, over) => `${name} dilepas${over ? ` di atas ${over}` : ''}.`
          }}
        >
          {items.map((item) => (
            <SortableItem key={item.id} value={item.id}>
              <div {...stylex.props(styles.row)}>
                <span {...stylex.props(styles.rowTitle)}>{item.title}</span>
              </div>
            </SortableItem>
          ))}
        </Sortable>
      </div>
    )
  },
  play: async ({ canvas }) => {
    const first = canvas.getAllByRole('button')[0]
    if (!first) throw new Error('No sortable item')
    first.focus()
    await userEvent.keyboard(' ')
    await waitFor(() => expect(live()).toBe('Diangkat: Product Demo.'))
    await userEvent.keyboard('{ArrowDown}')
    await waitFor(() => expect(live()).toBe('Product Demo di atas Product Specification.'))
    await userEvent.keyboard(' ')
    await waitFor(() => expect(live()).toContain('Product Demo dilepas'))
    // The dropped item keeps dnd-kit's drop-animation opacity for ~250 ms and every item then fades
    // back in over `duration.medium`, so a fixed sleep is shorter than the settle on a slow runner.
    // Leave once every item is opaque, so the a11y gate does not read one mid-fade as faded text.
    await waitFor(() => expect(lifted()).toBe(false))
    await untilOpaque('[data-slot="sortable-item"]')
    await expect(live()).not.toMatch(/\b[0-9]+\b/)
  }
}

/** Each handle is named after its item, so a list of controls tells the rows apart. */
export const HandleNames: Story = {
  parameters: {
    docs: {
      source: {
        code: `<Sortable value={items} onValueChange={setItems} getItemValue={(item) => item.id}>
  {items.map((item) => (
    <SortableItem key={item.id} value={item.id} aria-label={item.title}>
      <SortableItemHandle />
      {item.title}
    </SortableItem>
  ))}
</Sortable>`
      }
    }
  },
  render: () => {
    const [items, setItems] = useState(defaultFiles.slice(0, 3))
    return (
      <div {...stylex.props(styles.page)}>
        <Sortable
          value={items}
          onValueChange={setItems}
          getItemValue={(item) => item.id}
          style={styles.list}
        >
          {items.map((item) => (
            // The row also holds a description and a size; the item's own name is its title.
            <SortableItem key={item.id} value={item.id} aria-label={item.title}>
              <div {...stylex.props(styles.row)}>
                <Handle />
                <div {...stylex.props(styles.rowBody)}>
                  <span {...stylex.props(styles.rowTitle)}>{item.title}</span>
                  <span {...stylex.props(styles.rowMeta)}>{item.description}</span>
                </div>
              </div>
            </SortableItem>
          ))}
        </Sortable>
      </div>
    )
  },
  play: async ({ canvas }) => {
    const handles = canvas.getAllByRole('button', { name: /^Reorder / })
    const names = handles.map((handle) => handle.getAttribute('aria-label'))
    await expect(names).toEqual([
      'Reorder Product Demo',
      'Reorder Product Specification',
      'Reorder Product Demo Video'
    ])
    await expect(new Set(names).size).toBe(names.length)
  }
}

/** An item is one Tab stop: Space lifts it, the arrows move it, Space drops it and Escape puts it back. */
export const Keyboard: Story = {
  render: () => {
    const [items, setItems] = useState(defaultFiles.slice(0, 3))
    return (
      <div {...stylex.props(styles.page)}>
        <Sortable
          value={items}
          onValueChange={setItems}
          getItemValue={(item) => item.id}
          style={styles.list}
        >
          {items.map((item) => (
            <SortableItem key={item.id} value={item.id}>
              <div {...stylex.props(styles.row)}>
                <span {...stylex.props(styles.rowTitle)}>{item.title}</span>
              </div>
            </SortableItem>
          ))}
        </Sortable>
      </div>
    )
  },
  play: async ({ canvas, canvasElement }) => {
    const order = () =>
      Array.from(canvasElement.querySelectorAll('[data-slot="sortable-item"]')).map(
        (item) => item.textContent
      )
    const demo = () => canvas.getByText('Product Demo').closest<HTMLElement>('[role="button"]')
    const start = ['Product Demo', 'Product Specification', 'Product Demo Video']
    await expect(order()).toEqual(start)

    // Tab reaches the first item, and only the items are stops.
    await userEvent.tab()
    await waitFor(() => expect(demo()).toHaveFocus())

    // Lift, step down, drop: the order changes and focus stays on the moved item.
    await pressUntil(' ', () => expect(lifted()).toBe(true), { when: () => !lifted() })
    await pressUntil(
      '{ArrowDown}',
      () => expect(live()).toBe('Product Demo moved over Product Specification.'),
      {
        when: () => lifted() && !live().includes('moved over')
      }
    )
    await pressUntil(' ', () => expect(lifted()).toBe(false), { when: () => lifted() })
    await waitFor(() =>
      expect(order()).toEqual(['Product Specification', 'Product Demo', 'Product Demo Video'])
    )
    await waitFor(() => expect(demo()).toHaveFocus())

    // Lift again and cancel: Escape drops nothing.
    await pressUntil(' ', () => expect(lifted()).toBe(true), { when: () => !lifted() })
    await pressUntil(
      '{ArrowDown}',
      () => expect(live()).toBe('Product Demo moved over Product Demo Video.'),
      {
        when: () => lifted() && !live().includes('Product Demo Video.')
      }
    )
    await pressUntil('{Escape}', () => expect(lifted()).toBe(false))
    await waitFor(() =>
      expect(order()).toEqual(['Product Specification', 'Product Demo', 'Product Demo Video'])
    )
    await untilOpaque('[data-slot="sortable-item"]')
  }
}
