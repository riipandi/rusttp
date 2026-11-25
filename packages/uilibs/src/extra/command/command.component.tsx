import { Autocomplete as BaseAutocomplete } from '@base-ui/react/autocomplete'
import { Search } from '@keyline-icons/react'
import * as stylex from '@stylexjs/stylex'
import * as React from 'react'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '../../base/dialog'
import { ScrollArea } from '../../base/scroll-area'
import { Separator } from '../../base/separator'
import { highlightedItem } from '../../styles/popup.stylex'
import { visuallyHidden } from '../../styles/utils.stylex'
import { commandStyles as s } from './command.stylex'

interface StyleProp {
  style?: stylex.StyleXStyles
}

export interface CommandProps
  extends
    Omit<
      React.ComponentProps<typeof BaseAutocomplete.Root>,
      'className' | 'style' | 'inline' | 'open'
    >,
    StyleProp {
  children?: React.ReactNode
}

/**
 * Command palette built on Base UI Autocomplete in `inline open` mode: the
 * filtered list renders in place (no popup), like cmdk. Pass `items` to the
 * root; `CommandList` accepts a render function over the filtered items.
 */
export function Command({ style, children, ...props }: CommandProps) {
  return (
    <BaseAutocomplete.Root inline open autoHighlight keepHighlight {...props}>
      <div {...stylex.props(s.root, style)}>{children}</div>
    </BaseAutocomplete.Root>
  )
}

export interface CommandDialogLabels {
  /** Name of the dialog, read but not shown. Defaults to `Command Palette`. */
  title: string
  /** Description of the dialog, read but not shown. Defaults to `Search for a command to run…`. */
  description: string
}

const defaultLabels: CommandDialogLabels = {
  title: 'Command Palette',
  description: 'Search for a command to run…'
}

export function CommandDialog({
  labels,
  children,
  style,
  initialFocus,
  finalFocus,
  ...props
}: Omit<React.ComponentProps<typeof Dialog>, 'children'> &
  StyleProp & {
    /** Accessible name and description of the dialog; English by default. */
    labels?: Partial<CommandDialogLabels>
    children: React.ReactNode
    /**
     * Where focus goes when the dialog closes: the element that opened it by default, `false` to
     * leave it where it is (for a palette opened by a hotkey, so a trigger does not keep a ring).
     */
    finalFocus?: React.ComponentProps<typeof DialogContent>['finalFocus']
    /**
     * Where focus goes when the dialog opens: the first focusable element by default. A panel with
     * no field to type in passes its own container, so no button takes a ring on open.
     */
    initialFocus?: React.ComponentProps<typeof DialogContent>['initialFocus']
  }) {
  const names = { ...defaultLabels, ...labels }
  return (
    <Dialog {...props}>
      <DialogContent
        showCloseButton={false}
        initialFocus={initialFocus}
        finalFocus={finalFocus}
        style={[s.dialogContent, style]}
      >
        <DialogTitle style={visuallyHidden.root}>{names.title}</DialogTitle>
        <DialogDescription style={visuallyHidden.root}>{names.description}</DialogDescription>
        <div {...stylex.props(s.inner)}>{children}</div>
      </DialogContent>
    </Dialog>
  )
}

export function CommandInput({
  style,
  ...props
}: Omit<React.ComponentProps<typeof BaseAutocomplete.Input>, 'className' | 'style'> & StyleProp) {
  return (
    <>
      <div {...stylex.props(s.inputWrap, style)}>
        <Search size={16} strokeWidth={1.5} aria-hidden {...stylex.props(s.inputIcon)} />
        <BaseAutocomplete.Input {...props} {...stylex.props(s.input)} />
      </div>
      <Separator />
    </>
  )
}

/**
 * The results, in a `ScrollArea` so a long list scrolls under a fade instead of a native bar. Base
 * UI's list is the scrolling element's child: the area owns the height, the list only pads.
 */
export function CommandList({
  style,
  ...props
}: Omit<React.ComponentProps<typeof BaseAutocomplete.List>, 'className' | 'style' | 'children'> &
  StyleProp & {
    /** Static items, or a render function over the filtered items. */
    children?: React.ComponentProps<typeof BaseAutocomplete.List>['children']
  }) {
  return (
    <ScrollArea fade style={s.scroll}>
      <BaseAutocomplete.List {...props} {...stylex.props(s.list, style)} />
    </ScrollArea>
  )
}

export function CommandEmpty({
  style,
  ...props
}: Omit<React.ComponentProps<typeof BaseAutocomplete.Empty>, 'className' | 'style'> & StyleProp) {
  return <BaseAutocomplete.Empty {...props} {...stylex.props(s.empty, style)} />
}

export function CommandGroup({
  heading,
  style,
  children,
  ...props
}: Omit<React.ComponentProps<typeof BaseAutocomplete.Group>, 'className' | 'style'> &
  StyleProp & { heading?: React.ReactNode }) {
  return (
    <BaseAutocomplete.Group {...props} {...stylex.props(style)}>
      {heading && (
        <BaseAutocomplete.GroupLabel {...stylex.props(s.groupLabel)}>
          {heading}
        </BaseAutocomplete.GroupLabel>
      )}
      {children}
    </BaseAutocomplete.Group>
  )
}

export function CommandItem({
  style,
  ...props
}: Omit<React.ComponentProps<typeof BaseAutocomplete.Item>, 'className' | 'style'> & StyleProp) {
  return <BaseAutocomplete.Item {...props} {...stylex.props(highlightedItem.root, s.item, style)} />
}

export function CommandSeparator({
  style,
  ...props
}: Omit<React.ComponentProps<typeof BaseAutocomplete.Separator>, 'className' | 'style'> &
  StyleProp) {
  // Base UI's separator is a `role='presentation'` element inside the list, which allows no
  // `aria-orientation`; the shared `Separator` adds one, so it is dropped here and the line keeps
  // the library's one divider look.
  return (
    <BaseAutocomplete.Separator
      {...props}
      render={<Separator aria-orientation={undefined} style={[s.separator, style]} />}
    />
  )
}

export function CommandShortcut({
  style,
  ...props
}: Omit<React.ComponentProps<'span'>, 'className' | 'style'> & StyleProp) {
  return <span {...props} {...stylex.props(s.shortcut, style)} />
}
