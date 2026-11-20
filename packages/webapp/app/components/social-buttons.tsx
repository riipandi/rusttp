import * as stylex from '@stylexjs/stylex'
import { Button } from 'uilibs/base/button'
import { Separator } from 'uilibs/base/separator'
import { GitHubIcon, GoogleIcon } from 'uilibs/icons'
import { colors } from 'uilibs/styles/colors.stylex'
import { fontSize, unit } from 'uilibs/styles/tokens.stylex'

const styles = stylex.create({
  group: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: unit.x3
  },
  divider: {
    display: 'flex',
    alignItems: 'center',
    gap: unit.x3,
    color: colors.foregroundNeutralFaded,
    fontSize: fontSize.body2
  },
  line: {
    flex: 1
  }
})

// Placeholders for the OAuth providers: the buttons do nothing until the backend has a provider flow.
export function SocialButtons() {
  return (
    <>
      <div {...stylex.props(styles.group)}>
        <Button type='button' variant='outline' size='lg'>
          <GoogleIcon size={18} aria-hidden='true' />
          Google
        </Button>
        <Button type='button' variant='outline' size='lg'>
          <GitHubIcon size={18} aria-hidden='true' />
          GitHub
        </Button>
      </div>
      <div {...stylex.props(styles.divider)}>
        <Separator style={styles.line} />
        or continue with email
        <Separator style={styles.line} />
      </div>
    </>
  )
}
