import { Link, type LinkProps } from '@tanstack/react-router'
import { Button, type ButtonProps } from 'uilibs/base/button'

type LinkButtonProps = Omit<ButtonProps, 'render' | 'nativeButton'> & {
  to: LinkProps['to']
  /** Marks the link of the page the user is on. */
  current?: boolean
}

// A button that navigates. Base UI gives a non-native button `role="button"`, which would announce
// a link as a button, so the role goes back to `link`.
export function LinkButton({ to, current, ...props }: LinkButtonProps) {
  return (
    <Button
      {...props}
      nativeButton={false}
      render={
        // oxlint-disable-next-line jsx-a11y/prefer-tag-over-role -- deliberate: `Link` renders the `a`
        <Link to={to} role='link' aria-current={current ? 'page' : undefined} />
      }
    />
  )
}
