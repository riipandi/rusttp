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
import { type DenseControlSize, controlPress } from '../../styles/control.stylex'
import { tabsLineSizes, tabsSizes, tabsStyles as s } from './tabs.stylex'

interface StyleProp {
  style?: stylex.StyleXStyles
}

export type TabsVariant = 'default' | 'line'

export type TabsSize = DenseControlSize

const TabsListContext = React.createContext<{ variant: TabsVariant; size: TabsSize }>({
  variant: 'default',
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
  variant = 'default',
  size = 'md',
  ...props
}: Omit<React.ComponentProps<typeof BaseTabs.List>, 'className' | 'style'> &
  StyleProp & {
    variant?: TabsVariant
    /** List height, as the control scale: `md` is 36px. */
    size?: TabsSize
  }) {
  const context = React.useMemo(() => ({ variant, size }), [variant, size])
  return (
    <TabsListContext.Provider value={context}>
      <BaseTabs.List
        {...props}
        {...stylex.props(s.list, variant === 'line' && s.listLine, style)}
      />
    </TabsListContext.Provider>
  )
}

export function TabsTrigger({
  style,
  ...props
}: Omit<React.ComponentProps<typeof BaseTabs.Tab>, 'className' | 'style'> & StyleProp) {
  const { variant, size } = React.useContext(TabsListContext)
  return (
    <BaseTabs.Tab
      {...props}
      {...stylex.props(
        controlPress.root,
        s.trigger,
        variant === 'line' && s.triggerLine,
        variant === 'line' ? tabsLineSizes[size] : tabsSizes[size],
        style
      )}
    />
  )
}

export function TabsContent({
  style,
  ...props
}: Omit<React.ComponentProps<typeof BaseTabs.Panel>, 'className' | 'style'> & StyleProp) {
  return <BaseTabs.Panel {...props} {...stylex.props(s.content, style)} />
}
