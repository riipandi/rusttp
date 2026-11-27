/**
 * An input that suggests options as you type.
 *
 * @see: https://base-ui.com/react/components/autocomplete
 *
 * BaseUI Anatomy:
 * <Autocomplete.Root>
 *   <Autocomplete.Input />
 *   <Autocomplete.Trigger />
 *   <Autocomplete.Icon />
 *   <Autocomplete.Clear />
 *   <Autocomplete.Value />
 *   <Autocomplete.Portal>
 *     <Autocomplete.Backdrop />
 *     <Autocomplete.Positioner>
 *       <Autocomplete.Popup>
 *         <Autocomplete.Arrow />
 *         <Autocomplete.Status />
 *         <Autocomplete.Empty />
 *         <Autocomplete.List>
 *           <Autocomplete.Row>
 *             <Autocomplete.Item />
 *           </Autocomplete.Row>
 *           <Autocomplete.Separator />
 *           <Autocomplete.Group>
 *             <Autocomplete.GroupLabel />
 *           </Autocomplete.Group>
 *           <Autocomplete.Collection />
 *         </Autocomplete.List>
 *       </Autocomplete.Popup>
 *     </Autocomplete.Positioner>
 *   </Autocomplete.Portal>
 * </Autocomplete.Root>
 */

import { Autocomplete as BaseAutocomplete } from '@base-ui/react/autocomplete'
import * as stylex from '@stylexjs/stylex'
import * as React from 'react'
import {
  type ControlVariant,
  controlBase,
  controlSizes,
  controlVariants
} from '../../styles/control.stylex'
import { highlightedItem, popupList } from '../../styles/popup.stylex'
import type { ControlSize } from '../../styles/types'
import type { StyleProp } from '../../styles/types'
import { PopupShell, type PositionerProps } from '../popup-shell'
import { autocompleteStyles as s } from './autocomplete.stylex'

/**
 * Free-text input with a filtered suggestion popup — unlike Combobox, any
 * typed value is allowed; the list only suggests. Pass `items` to the root;
 * `AutocompleteList` accepts a render function over the filtered items.
 */
export const Autocomplete = BaseAutocomplete.Root
export const AutocompleteValue = BaseAutocomplete.Value
export const AutocompleteCollection = BaseAutocomplete.Collection

export function AutocompleteInput({
  size = 'medium',
  variant = 'outline',
  style,
  ...props
}: Omit<React.ComponentProps<typeof BaseAutocomplete.Input>, 'className' | 'style' | 'size'> &
  StyleProp & {
    /** Control height and type; `medium` (36px) by default. */
    size?: ControlSize
    /** The box: `outline` (default), `faded`, `ghost`, or `headless`. */
    variant?: ControlVariant
  }) {
  return (
    <BaseAutocomplete.Input
      {...props}
      {...stylex.props(
        controlBase.root,
        controlSizes[size],
        controlVariants[variant],
        s.input,
        style
      )}
    />
  )
}

export interface AutocompleteContentProps
  extends
    Omit<React.ComponentProps<typeof BaseAutocomplete.Popup>, 'className' | 'style'>,
    PositionerProps,
    StyleProp {}

export function AutocompleteContent({
  style,
  side = 'bottom',
  sideOffset = 6,
  align = 'start',
  alignOffset = 0,
  collisionAvoidance,
  collisionPadding,
  anchor,
  ...props
}: AutocompleteContentProps) {
  return (
    <PopupShell
      parts={BaseAutocomplete}
      positioner={{
        side,
        sideOffset,
        align,
        alignOffset,
        collisionAvoidance,
        collisionPadding,
        anchor
      }}
      popupStyle={s.popup}
      style={style}
      {...props}
    />
  )
}

export function AutocompleteList({
  style,
  ...props
}: Omit<React.ComponentProps<typeof BaseAutocomplete.List>, 'className' | 'style' | 'children'> &
  StyleProp & {
    /** Static items, or a render function over the filtered items. */
    children?: React.ComponentProps<typeof BaseAutocomplete.List>['children']
  }) {
  return <BaseAutocomplete.List {...props} {...stylex.props(s.list, style)} />
}

export function AutocompleteItem({
  style,
  ...props
}: Omit<React.ComponentProps<typeof BaseAutocomplete.Item>, 'className' | 'style'> & StyleProp) {
  return <BaseAutocomplete.Item {...props} {...stylex.props(highlightedItem.root, s.item, style)} />
}

export function AutocompleteGroup({
  style,
  ...props
}: Omit<React.ComponentProps<typeof BaseAutocomplete.Group>, 'className' | 'style'> & StyleProp) {
  return <BaseAutocomplete.Group {...props} {...stylex.props(style)} />
}

export function AutocompleteLabel({
  style,
  ...props
}: Omit<React.ComponentProps<typeof BaseAutocomplete.GroupLabel>, 'className' | 'style'> &
  StyleProp) {
  return <BaseAutocomplete.GroupLabel {...props} {...stylex.props(popupList.label, style)} />
}

export function AutocompleteEmpty({
  style,
  ...props
}: Omit<React.ComponentProps<typeof BaseAutocomplete.Empty>, 'className' | 'style'> & StyleProp) {
  return <BaseAutocomplete.Empty {...props} {...stylex.props(popupList.empty, style)} />
}

export function AutocompleteSeparator({
  style,
  ...props
}: Omit<React.ComponentProps<typeof BaseAutocomplete.Separator>, 'className' | 'style'> &
  StyleProp) {
  return <BaseAutocomplete.Separator {...props} {...stylex.props(popupList.separator, style)} />
}
