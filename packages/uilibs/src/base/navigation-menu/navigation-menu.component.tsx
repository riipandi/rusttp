/**
 * A collection of links and menus for website navigation.
 *
 * @see: https://base-ui.com/react/components/navigation-menu
 *
 * BaseUI Anatomy:
 * <NavigationMenu.Root>
 *   <NavigationMenu.List>
 *     <NavigationMenu.Item>
 *       <NavigationMenu.Trigger>
 *         <NavigationMenu.Icon />
 *       </NavigationMenu.Trigger>
 *       <NavigationMenu.Content>
 *         <NavigationMenu.Link />
 *       </NavigationMenu.Content>
 *     </NavigationMenu.Item>
 *   </NavigationMenu.List>
 *   <NavigationMenu.Portal>
 *     <NavigationMenu.Backdrop />
 *     <NavigationMenu.Positioner>
 *       <NavigationMenu.Popup>
 *         <NavigationMenu.Arrow />
 *         <NavigationMenu.Viewport />
 *       </NavigationMenu.Popup>
 *     </NavigationMenu.Positioner>
 *   </NavigationMenu.Portal>
 * </NavigationMenu.Root>
 */

import { NavigationMenu as BaseNavigationMenu } from '@base-ui/react/navigation-menu'
import { ChevronDown } from '@keyline-icons/react'
import * as stylex from '@stylexjs/stylex'
import * as React from 'react'
import { shadow } from '../../styles/colors.stylex'
import type { StyleProp } from '../../styles/types'
import { focusRing } from '../../styles/utils.stylex'
import { ring } from '../../styles/utils.stylex'
import { navigationMenuStyles as s } from './navigation-menu.stylex'

export interface NavigationMenuLabels {
  /** Name of the menu's `nav` landmark. Defaults to `Main`. */
  menu: string
  /** Name of the popup's `nav` landmark, which is a second landmark while it is open. Defaults to `Main details`. */
  popup: string
}

const defaultLabels: NavigationMenuLabels = { menu: 'Main', popup: 'Main details' }

const NavigationMenuLabelsContext = React.createContext(defaultLabels)

/** Two `nav` landmarks exist while a popup is open, so each needs its own name. */
export function NavigationMenu({
  style,
  children,
  align = 'start',
  labels,
  ...props
}: Omit<React.ComponentProps<typeof BaseNavigationMenu.Root>, 'className' | 'style'> &
  Pick<React.ComponentProps<typeof BaseNavigationMenu.Positioner>, 'align'> &
  StyleProp & {
    /** Accessible names of the landmarks; English by default. */
    labels?: Partial<NavigationMenuLabels>
  }) {
  const merged = React.useMemo(() => ({ ...defaultLabels, ...labels }), [labels])
  return (
    <NavigationMenuLabelsContext.Provider value={merged}>
      <BaseNavigationMenu.Root aria-label={merged.menu} {...props} {...stylex.props(s.root, style)}>
        {children}
        <NavigationMenuPositioner align={align} />
      </BaseNavigationMenu.Root>
    </NavigationMenuLabelsContext.Provider>
  )
}

export function NavigationMenuList({
  style,
  ...props
}: Omit<React.ComponentProps<typeof BaseNavigationMenu.List>, 'className' | 'style'> & StyleProp) {
  return <BaseNavigationMenu.List {...props} {...stylex.props(s.list, style)} />
}

export function NavigationMenuItem({
  style,
  ...props
}: Omit<React.ComponentProps<typeof BaseNavigationMenu.Item>, 'className' | 'style'> & StyleProp) {
  return <BaseNavigationMenu.Item {...props} {...stylex.props(s.item, style)} />
}

export function NavigationMenuTrigger({
  style,
  children,
  ...props
}: Omit<React.ComponentProps<typeof BaseNavigationMenu.Trigger>, 'className' | 'style'> &
  StyleProp) {
  return (
    <BaseNavigationMenu.Trigger {...props} {...stylex.props(focusRing.root, s.trigger, style)}>
      {children}
      <ChevronDown size={12} strokeWidth={2} aria-hidden {...stylex.props(s.triggerChevron)} />
    </BaseNavigationMenu.Trigger>
  )
}

export function NavigationMenuContent({
  style,
  ...props
}: Omit<React.ComponentProps<typeof BaseNavigationMenu.Content>, 'className' | 'style'> &
  StyleProp) {
  return <BaseNavigationMenu.Content {...props} {...stylex.props(s.content, style)} />
}

export function NavigationMenuLink({
  style,
  ...props
}: Omit<React.ComponentProps<typeof BaseNavigationMenu.Link>, 'className' | 'style'> & StyleProp) {
  return <BaseNavigationMenu.Link {...props} {...stylex.props(focusRing.root, s.link, style)} />
}

export function NavigationMenuPositioner({
  style,
  side = 'bottom',
  sideOffset = 8,
  align = 'start',
  alignOffset = 0,
  ...props
}: Omit<React.ComponentProps<typeof BaseNavigationMenu.Positioner>, 'className' | 'style'> &
  StyleProp) {
  const labels = React.useContext(NavigationMenuLabelsContext)
  return (
    <BaseNavigationMenu.Portal>
      <BaseNavigationMenu.Positioner
        side={side}
        sideOffset={sideOffset}
        align={align}
        alignOffset={alignOffset}
        {...props}
        {...stylex.props(s.positioner, style)}
      >
        <BaseNavigationMenu.Popup
          aria-label={labels.popup}
          {...stylex.props(s.popup, ring({ shadow: shadow.raised }))}
        >
          <BaseNavigationMenu.Viewport {...stylex.props(s.viewport)} />
        </BaseNavigationMenu.Popup>
      </BaseNavigationMenu.Positioner>
    </BaseNavigationMenu.Portal>
  )
}
