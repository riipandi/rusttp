import type { Meta, StoryObj } from '@storybook/tanstack-react'
import * as stylex from '@stylexjs/stylex'
import { Fragment } from 'react'
import { expect } from 'storybook/test'
import { colors } from '../../styles/colors.stylex'
import { container, duration, stroke } from '../../styles/tokens.stylex'
import { Badge } from '../badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../card'
import { DescriptionDetails, DescriptionList, DescriptionTerm } from './description-list.component'

const meta = {
  title: 'Extra Components/DescriptionList',
  component: DescriptionList
} satisfies Meta<typeof DescriptionList>

type Story = StoryObj<typeof meta>

const styles = stylex.create({
  frame: {
    marginInline: 'auto',
    maxWidth: container.xxlarge,
    width: '100%'
  },
  link: {
    color: colors.foregroundPrimary,
    outlineOffset: stroke.ring1,
    textDecorationColor: {
      default: colors.borderPrimaryFaded,
      ':hover': colors.foregroundPrimary
    },
    textDecorationLine: 'underline',
    textDecorationThickness: stroke.ring1,
    textUnderlineOffset: stroke.ring2,
    transitionDuration: duration.fast,
    transitionProperty: 'color, text-decoration-color',
    ':focus-visible': {
      outline: `${stroke.ring2} solid ${colors.foregroundPrimary}`,
      outlineOffset: stroke.ring1
    }
  }
})

const order = {
  number: 'ORD-0071',
  date: 'September 9, 2026',
  purchasedAt: 'Vault & Quill, Diagon Alley',
  email: 'hpotter@owlpost.magic',
  vat: 'GB 000 0000 00'
}

const pairs = [
  ['Order number', order.number],
  ['Date', order.date],
  ['Purchased at', order.purchasedAt],
  ['Email', order.email],
  ['VAT', order.vat],
  ['Ship to', '4 Privet Drive, Little Whinging, Surrey'],
  ['Courier', 'Hedwig, express owl'],
  ['Tracking', 'HL-7734-GRG']
] as const

// The parts take only `render` and `style`, so the controls are story-only: how many pairs show,
// and the text of the first pair, to try long terms and wrapping details.
interface PlaygroundArgs {
  pairs: number
  term: string
  details: string
}

export const Playground: StoryObj<PlaygroundArgs> = {
  parameters: {
    docs: {
      source: {
        code: `<DescriptionList>
  <DescriptionTerm>Order number</DescriptionTerm>
  <DescriptionDetails>ORD-0071</DescriptionDetails>
  <DescriptionTerm>Date</DescriptionTerm>
  <DescriptionDetails>September 9, 2026</DescriptionDetails>
</DescriptionList>`
      }
    },
    controls: { disable: false, include: ['pairs', 'term', 'details'] }
  },
  argTypes: {
    pairs: { control: { type: 'range', min: 1, max: pairs.length, step: 1 } },
    term: { control: 'text' },
    details: { control: 'text' }
  },
  args: { pairs: 5, term: pairs[0][0], details: pairs[0][1] },
  render: ({ pairs: count, term, details }) => (
    <DescriptionList style={styles.frame}>
      <DescriptionTerm>{term}</DescriptionTerm>
      <DescriptionDetails>{details}</DescriptionDetails>
      {pairs.slice(1, count).map(([pairTerm, pairDetails]) => (
        <Fragment key={pairTerm}>
          <DescriptionTerm>{pairTerm}</DescriptionTerm>
          <DescriptionDetails>{pairDetails}</DescriptionDetails>
        </Fragment>
      ))}
    </DescriptionList>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getAllByRole('term')).toHaveLength(5)
    await expect(canvas.getAllByRole('definition')).toHaveLength(5)
    await expect(canvas.getByText('ORD-0071')).toBeInTheDocument()
  }
}

export const LongValues: Story = {
  name: 'Long values',
  render: (args) => (
    <DescriptionList {...args} style={styles.frame}>
      <DescriptionTerm>Shipping address</DescriptionTerm>
      <DescriptionDetails>
        4 Privet Drive, Little Whinging, Surrey, United Kingdom, WD17 1AA — leave the parcel with
        the owl keeper at the side gate if nobody answers the door.
      </DescriptionDetails>
      <DescriptionTerm>Billing address</DescriptionTerm>
      <DescriptionDetails>The Burrow, Ottery St Catchpole, Devon, EX22 7NB</DescriptionDetails>
      <DescriptionTerm>Delivery notes</DescriptionTerm>
      <DescriptionDetails>
        Beware of the ticklish tree by the gate. Muggle shipping partners are not permitted past the
        wardline after dusk.
      </DescriptionDetails>
    </DescriptionList>
  )
}

export const WithBadges: Story = {
  parameters: {
    docs: {
      source: {
        code: `<DescriptionList>
  <DescriptionTerm>Payment status</DescriptionTerm>
  <DescriptionDetails>
    <Badge variant='faded'>Paid</Badge>
  </DescriptionDetails>
  <DescriptionTerm>Priority</DescriptionTerm>
  <DescriptionDetails>
    <Badge color='critical'>High</Badge>
  </DescriptionDetails>
</DescriptionList>`
      }
    }
  },
  name: 'With badges',
  render: (args) => (
    <DescriptionList {...args} style={styles.frame}>
      <DescriptionTerm>Payment status</DescriptionTerm>
      <DescriptionDetails>
        <Badge variant='faded'>Paid</Badge>
      </DescriptionDetails>
      <DescriptionTerm>Priority</DescriptionTerm>
      <DescriptionDetails>
        <Badge color='critical'>High</Badge>
      </DescriptionDetails>
      <DescriptionTerm>Shipping</DescriptionTerm>
      <DescriptionDetails>
        <Badge variant='outline'>Express owl</Badge>
      </DescriptionDetails>
      <DescriptionTerm>Tracking</DescriptionTerm>
      <DescriptionDetails>HL-7734-GRG</DescriptionDetails>
    </DescriptionList>
  )
}

export const WithLinks: Story = {
  name: 'With links',
  render: (args) => (
    <DescriptionList {...args} style={styles.frame}>
      <DescriptionTerm>Order number</DescriptionTerm>
      <DescriptionDetails>
        {order.number}
        {' — '}
        <a
          {...stylex.props(styles.link)}
          href='https://example.com/invoice/ORD-0071'
          target='_blank'
          rel='noreferrer'
        >
          View invoice
        </a>
      </DescriptionDetails>
      <DescriptionTerm>Payment method</DescriptionTerm>
      <DescriptionDetails>Card ending in 4242</DescriptionDetails>
      <DescriptionTerm>Support</DescriptionTerm>
      <DescriptionDetails>
        <a {...stylex.props(styles.link)} href='mailto:support@example.com'>
          support@example.com
        </a>
      </DescriptionDetails>
    </DescriptionList>
  )
}

export const InACard: Story = {
  parameters: {
    docs: {
      source: {
        code: `<Card>
  <CardHeader>
    <CardTitle>Order details</CardTitle>
    <CardDescription>Placed by Hermione Granger on September 9, 2026</CardDescription>
  </CardHeader>
  <CardContent>
    <DescriptionList>
      <DescriptionTerm>Order number</DescriptionTerm>
      <DescriptionDetails>ORD-0071</DescriptionDetails>
      <DescriptionTerm>Email</DescriptionTerm>
      <DescriptionDetails>hpotter@owlpost.magic</DescriptionDetails>
    </DescriptionList>
  </CardContent>
</Card>`
      }
    }
  },
  name: 'In a card',
  render: (args) => (
    <Card style={styles.frame}>
      <CardHeader>
        <CardTitle>Order details</CardTitle>
        <CardDescription>Placed by Hermione Granger on {order.date}</CardDescription>
      </CardHeader>
      <CardContent>
        <DescriptionList {...args}>
          <DescriptionTerm>Order number</DescriptionTerm>
          <DescriptionDetails>{order.number}</DescriptionDetails>
          <DescriptionTerm>Purchased at</DescriptionTerm>
          <DescriptionDetails>{order.purchasedAt}</DescriptionDetails>
          <DescriptionTerm>Email</DescriptionTerm>
          <DescriptionDetails>{order.email}</DescriptionDetails>
          <DescriptionTerm>VAT</DescriptionTerm>
          <DescriptionDetails>{order.vat}</DescriptionDetails>
        </DescriptionList>
      </CardContent>
    </Card>
  )
}

export default meta
