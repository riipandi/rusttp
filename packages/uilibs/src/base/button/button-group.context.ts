import * as React from 'react'
import type { ControlSize } from '../../styles/types'
import {
  buttonGroupDividerEdges,
  buttonGroupJoined,
  buttonGroupSharedEdges
} from './button-group.stylex'
import type { ButtonVariant } from './button.component'

/** Where a member sits in its group; `null` for the only member, which has nothing to join. */
export type ButtonGroupPosition = 'first' | 'middle' | 'last'

export interface ButtonGroupContextValue {
  orientation: 'horizontal' | 'vertical'
  position: ButtonGroupPosition | null
  /** The size a member takes unless it sets its own. */
  size?: ControlSize
  /** The variant a Button takes unless it sets its own; an Input or Select has its own variants. */
  variant?: ButtonVariant
}

/**
 * One value per member of a `ButtonGroup`, provided around each of its children. A control reads it
 * through the React tree, so a Button rendered by a trigger or wrapped in a Tooltip is joined too.
 * A control that is itself a bordered group (`InputGroup`) provides `null` for what it holds.
 */
export const ButtonGroupContext = React.createContext<ButtonGroupContextValue | null>(null)

/** The group the caller is a member of, or `null`. */
export function useButtonGroup() {
  return React.useContext(ButtonGroupContext)
}

/**
 * The corners and the leading edge of a member at its position. Compose it after the member's own
 * fill and size and before the caller's `style`. A bordered member (outline Button, Input, Select)
 * shares its neighbour's edge; a `filled` member (solid or faded Button) has no border to share, so
 * it gets a divider instead.
 */
export function buttonGroupMember(group: ButtonGroupContextValue | null, filled: boolean) {
  if (!group?.position) return null
  const { orientation, position } = group
  return [
    buttonGroupJoined[`${orientation}-${position}`],
    position !== 'first' && (filled ? buttonGroupDividerEdges : buttonGroupSharedEdges)[orientation]
  ]
}
