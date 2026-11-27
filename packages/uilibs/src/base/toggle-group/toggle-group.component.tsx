/**
 * A group of toggle buttons.
 *
 * @see: https://base-ui.com/react/components/toggle-group
 *
 * BaseUI Anatomy:
 * <ToggleGroup.Root />
 */

import { ToggleGroup as BaseToggleGroup } from '@base-ui/react/toggle-group'
import * as stylex from '@stylexjs/stylex'
import * as React from 'react'
import type { PartProps } from '../../styles/types'
import { Toggle } from '../toggle'
import type { ToggleColor, ToggleSize, ToggleVariant, ToggleProps } from '../toggle'
import { toggleGroupStyles as s } from './toggle-group.stylex'
import { toggleGroupOrientations as orientations } from './toggle-group.stylex'
import { toggleGroupJoinedItems as joinedItems } from './toggle-group.stylex'
import { toggleGroupJoinedOutline as joinedOutline } from './toggle-group.stylex'

interface ToggleGroupContextValue {
  variant: ToggleVariant
  selectedVariant?: ToggleVariant
  selectedColor: ToggleColor
  size: ToggleSize
  joined: boolean
  orientation: 'horizontal' | 'vertical'
}

const ToggleGroupContext = React.createContext<ToggleGroupContextValue>({
  variant: 'ghost',
  selectedColor: 'neutral',
  size: 'medium',
  joined: false,
  orientation: 'horizontal'
})

export interface ToggleGroupProps extends PartProps<React.ComponentProps<typeof BaseToggleGroup>> {
  variant?: ToggleVariant
  /** The fill of an item's pressed state; follows `variant` when unset (see `Toggle`). */
  selectedVariant?: ToggleVariant
  /** The color of an item's pressed state; `neutral` by default. */
  selectedColor?: ToggleColor
  size?: ToggleSize
  /** Item gap. `joined` fuses the items into one segmented control. */
  spacing?: 'gap' | 'joined'
}

export function ToggleGroup({
  variant = 'ghost',
  selectedVariant,
  selectedColor = 'neutral',
  size = 'medium',
  spacing = 'gap',
  orientation = 'horizontal',
  style,
  children,
  ...props
}: ToggleGroupProps) {
  const joined = spacing === 'joined'
  return (
    <BaseToggleGroup
      orientation={orientation}
      {...props}
      {...stylex.props(s.root, orientations[orientation], !joined && s.gap, style)}
    >
      <ToggleGroupContext.Provider
        value={{ variant, selectedVariant, selectedColor, size, joined, orientation }}
      >
        {children}
      </ToggleGroupContext.Provider>
    </BaseToggleGroup>
  )
}

export function ToggleGroupItem({ style, ...props }: ToggleProps) {
  const { variant, selectedVariant, selectedColor, size, joined, orientation } =
    React.useContext(ToggleGroupContext)
  return (
    <Toggle
      variant={props.variant ?? variant}
      selectedVariant={props.selectedVariant ?? selectedVariant}
      selectedColor={props.selectedColor ?? selectedColor}
      size={props.size ?? size}
      {...props}
      style={[
        s.item,
        joined && joinedItems[orientation],
        joined && variant === 'outline' && joinedOutline[orientation],
        style
      ]}
    />
  )
}
