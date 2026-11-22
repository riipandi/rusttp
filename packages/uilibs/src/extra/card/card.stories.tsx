import type { Meta, StoryObj } from '@storybook/tanstack-react'
import * as stylex from '@stylexjs/stylex'
import { expect, userEvent } from 'storybook/test'
import { Button } from '../../base/button'
import { Input } from '../../base/input'
import { cellOf } from '../../contracts/control-sizes'
import { Axis } from '../../contracts/story-axes'
import { container } from '../../styles/tokens.stylex'
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from './card.component'

const meta = {
  title: 'Extra Components/Card',
  component: Card,
  argTypes: {
    size: { control: 'radio', options: ['md', 'sm'] }
  },
  tags: [] // ['autodocs']
} satisfies Meta<typeof Card>

type Story = StoryObj<typeof meta>

const styles = stylex.create({
  card: {
    maxWidth: '100%',
    width: container.xlarge
  }
})

export default meta

export const Playground: Story = {
  args: { size: 'md' },
  render: (args) => (
    <Card {...args} style={styles.card}>
      <CardHeader>
        <CardTitle>Submit to the Prophet</CardTitle>
        <CardDescription>Publish your story in the Daily Prophet with one click.</CardDescription>
      </CardHeader>
      <CardContent>
        <Input placeholder='Headline' />
      </CardContent>
      <CardFooter>
        <Button>Publish</Button>
        <Button variant='ghost'>Discard</Button>
      </CardFooter>
    </Card>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('heading', { name: 'Submit to the Prophet' })).toBeInTheDocument()

    // The form inside the card accepts typing.
    const input = canvas.getByPlaceholderText('Headline')
    await userEvent.type(input, 'Snape Walks the Aisles')
    await expect(input).toHaveValue('Snape Walks the Aisles')
  }
}

export const Action: Story = {
  args: { size: 'md' },
  render: (args) => (
    <Card {...args} style={styles.card}>
      <CardHeader>
        <CardTitle>Howlers</CardTitle>
        <CardDescription>You have 3 unread howlers.</CardDescription>
        <CardAction>
          <Button size='sm' variant='ghost'>
            Burn all howlers
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent>
        <p>A red letter is smoking on the kitchen table.</p>
      </CardContent>
    </Card>
  )
}

export const Sizes: Story = {
  render: () => (
    <Axis axis='size' rows={['md', 'sm'] as const}>
      {(size) => (
        <Card size={size} style={styles.card}>
          <CardHeader>
            <CardTitle>Chocolate Frog card</CardTitle>
            <CardDescription>Padding follows the card size.</CardDescription>
          </CardHeader>
          <CardFooter>
            <Button size='sm'>Collect</Button>
          </CardFooter>
        </Card>
      )}
    </Axis>
  ),
  // `sm` tightens the padding, so the same content is shorter.
  play: async ({ canvasElement }) => {
    const height = (size: string) =>
      (
        cellOf(canvasElement, 'size', size).firstElementChild ?? canvasElement
      ).getBoundingClientRect().height
    await expect(height('sm')).toBeLessThan(height('md'))
  }
}

export const States: Story = {
  render: () => (
    <Axis axis='state' rows={['default', 'raised', 'selected'] as const}>
      {(state) => (
        <Card
          raised={state === 'raised'}
          selected={state === 'selected'}
          data-testid={state}
          style={styles.card}
        >
          <CardContent>{state}</CardContent>
        </Card>
      )}
    </Axis>
  ),
  play: async ({ canvas }) => {
    const style = (state: string) => getComputedStyle(canvas.getByTestId(state))
    await expect(style('raised').boxShadow).not.toBe(style('default').boxShadow)
    await expect(style('selected').borderTopColor).not.toBe(style('default').borderTopColor)
    // Selected also doubles the edge, so it is not told by color alone.
    await expect(style('selected').outlineWidth).toBe('1px')
    await expect(canvas.getByTestId('selected')).toHaveAttribute('data-selected')
  }
}
