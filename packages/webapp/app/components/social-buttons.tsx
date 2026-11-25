import * as stylex from '@stylexjs/stylex'
import { Button } from 'uilibs/base/button'
import { Separator } from 'uilibs/base/separator'
import { Stack } from 'uilibs/extra/stack'
import { GitHubIcon, GoogleIcon } from 'uilibs/icons'
import { colors } from 'uilibs/styles/colors.stylex'
import { fontSize, unit } from 'uilibs/styles/tokens.stylex'
import { useMessages } from '#/libraries/messages'
import { notWired } from '#/libraries/not-wired'

const styles = stylex.create({
  group: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: unit.x3
  },
  divider: {
    color: colors.foregroundNeutralFaded,
    fontSize: fontSize.body2
  },
  line: {
    flex: 1
  }
})

// Placeholders for the OAuth providers: the buttons do nothing until the backend has a provider flow.
export function SocialButtons() {
  const m = useMessages()
  return (
    <>
      <div {...stylex.props(styles.group)}>
        <Button
          type='button'
          variant='outline'
          size='large'
          onClick={notWired('Sign in with Google')}
        >
          <GoogleIcon size={18} aria-hidden='true' />
          Google
        </Button>
        <Button
          type='button'
          variant='outline'
          size='large'
          onClick={notWired('Sign in with GitHub')}
        >
          <GitHubIcon size={18} aria-hidden='true' />
          GitHub
        </Button>
      </div>
      <Stack direction='row' align='center' gap={3} style={styles.divider}>
        <Separator style={styles.line} />
        {m.social_divider()}
        <Separator style={styles.line} />
      </Stack>
    </>
  )
}
