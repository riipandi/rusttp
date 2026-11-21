import * as stylex from '@stylexjs/stylex'
import { Icon } from 'uilibs/extra/icon'
import { colors } from 'uilibs/styles/colors.stylex'
import { unit } from 'uilibs/styles/tokens.stylex'

const styles = stylex.create({
  circle: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: unit.x12,
    height: unit.x12,
    marginBlockEnd: unit.x2,
    borderRadius: '50%'
  },
  primary: {
    backgroundColor: colors.backgroundPrimaryFaded,
    color: colors.foregroundPrimary
  },
  positive: {
    backgroundColor: colors.backgroundPositiveFaded,
    color: colors.foregroundPositive
  },
  critical: {
    backgroundColor: colors.backgroundCriticalFaded,
    color: colors.foregroundCritical
  }
})

interface StatusIconProps {
  svg: React.ComponentType
  tone?: 'primary' | 'positive' | 'critical'
}

// The mark at the top of a page that reports a state ("check your email", "verified").
export function StatusIcon({ svg, tone = 'primary' }: StatusIconProps) {
  return (
    <span {...stylex.props(styles.circle, styles[tone])} aria-hidden='true'>
      <Icon svg={svg} size={24} />
    </span>
  )
}
