/**
 * Organizes content into separate panels.
 *
 * @see: https://base-ui.com/react/components/tabs
 *
 * BaseUI Anatomy:
 * <Tabs.Root>
 *   <Tabs.List>
 *     <Tabs.Tab />
 *     <Tabs.Indicator />
 *   </Tabs.List>
 *   <Tabs.Panel />
 * </Tabs.Root>
 */

import { Tabs as BaseTabs } from '@base-ui/react/tabs'
import * as stylex from '@stylexjs/stylex'
import * as React from 'react'
import { controlPress } from '../../styles/control.stylex'
import type { DenseControlSize } from '../../styles/types'
import type { StyleProp } from '../../styles/types'
import { focusRing } from '../../styles/utils.stylex'
import { tabsSizes, tabsStyles as s, tabsUnderlineSizes } from './tabs.stylex'

/**
 * `pills` a tinted list with a raised active pill; `pills-raised` the same list lifted off the page
 * on the raised surface; `bordered` an underline on a border rail; `borderless` the underline alone.
 */
export type TabsVariant = 'pills' | 'pills-raised' | 'bordered' | 'borderless'

export type TabsSize = DenseControlSize

/** `equal`: the list spans its parent and every trigger takes an equal share; unset sizes each trigger to its label. */
export type TabsItemWidth = 'equal'

const TabsListContext = React.createContext<{
  variant: TabsVariant
  size: TabsSize
  itemWidth?: TabsItemWidth
}>({
  variant: 'pills',
  size: 'md'
})

export function Tabs({
  style,
  orientation = 'horizontal',
  ...props
}: Omit<React.ComponentProps<typeof BaseTabs.Root>, 'className' | 'style'> & StyleProp) {
  return (
    <BaseTabs.Root
      orientation={orientation}
      {...props}
      {...stylex.props(s.root, orientation === 'vertical' && s.rootVertical, style)}
    />
  )
}

export function TabsList({
  style,
  variant = 'pills',
  size = 'md',
  itemWidth,
  ...props
}: Omit<React.ComponentProps<typeof BaseTabs.List>, 'className' | 'style'> &
  StyleProp & {
    variant?: TabsVariant
    /** List height, as the control scale: `md` is 36px. */
    size?: TabsSize
    itemWidth?: TabsItemWidth
  }) {
  const context = React.useMemo(() => ({ variant, size, itemWidth }), [variant, size, itemWidth])
  return (
    <TabsListContext.Provider value={context}>
      <BaseTabs.List
        {...props}
        {...stylex.props(
          s.list,
          variant === 'bordered' && s.listBordered,
          variant === 'borderless' && s.listBorderless,
          variant === 'pills-raised' && s.listRaised,
          itemWidth === 'equal' && s.listEqual,
          style
        )}
      />
    </TabsListContext.Provider>
  )
}

export function TabsTrigger({
  style,
  ...props
}: Omit<React.ComponentProps<typeof BaseTabs.Tab>, 'className' | 'style'> & StyleProp) {
  const { variant, size, itemWidth } = React.useContext(TabsListContext)
  const underline = variant === 'bordered' || variant === 'borderless'
  return (
    <BaseTabs.Tab
      {...props}
      {...stylex.props(
        controlPress.root,
        s.trigger,
        underline && s.triggerUnderline,
        variant === 'borderless' && s.triggerBorderless,
        variant === 'pills-raised' && s.triggerRaised,
        itemWidth === 'equal' && s.triggerEqual,
        underline ? tabsUnderlineSizes[size] : tabsSizes[size],
        style
      )}
    />
  )
}

export function TabsContent({
  style,
  ...props
}: Omit<React.ComponentProps<typeof BaseTabs.Panel>, 'className' | 'style'> & StyleProp) {
  return <BaseTabs.Panel {...props} {...stylex.props(focusRing.root, s.content, style)} />
}
