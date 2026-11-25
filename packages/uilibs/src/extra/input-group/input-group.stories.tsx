import { Copy, Search } from '@keyline-icons/react'
import type { Meta, StoryObj } from '@storybook/tanstack-react'
import * as stylex from '@stylexjs/stylex'
import { expect, userEvent } from 'storybook/test'
import { Field } from '../../base/field'
import {
  controlSizeNames,
  controlVariantNames,
  expectControlHeights,
  expectControlVariants
} from '../../contracts/control-sizes'
import { Axis } from '../../contracts/story-axes'
import { controlSizes, controlVariants } from '../../styles/control.stylex'
import { container } from '../../styles/tokens.stylex'
import { Kbd } from '../kbd'
import { Spinner } from '../spinner'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
  InputGroupText,
  InputGroupTextarea
} from './input-group.component'

const meta = {
  title: 'Extra Components/InputGroup',
  component: InputGroup,
  tags: [] // ['autodocs']
} satisfies Meta<typeof InputGroup>

type Story = StoryObj<typeof meta>

const styles = stylex.create({
  icon: { height: 14, width: 14 },
  col: {
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
    width: container.small
  },
  group: {
    maxWidth: container.small
  }
})

export default meta

export const Playground: Story = {
  parameters: { controls: { disable: false, include: ['size', 'variant'] } },
  argTypes: {
    size: { control: 'radio', options: Object.keys(controlSizes) },
    variant: { control: 'radio', options: Object.keys(controlVariants) }
  },
  args: { size: 'md', variant: 'outline' },
  render: (args) => (
    <div {...stylex.props(styles.col)}>
      <InputGroup {...args}>
        <InputGroupAddon>
          <InputGroupText>https://</InputGroupText>
        </InputGroupAddon>
        <InputGroupInput placeholder='dailyprophet.co.uk' />
      </InputGroup>
      <InputGroup {...args}>
        <InputGroupInput placeholder='Search spells…' />
        <InputGroupAddon align='inline-end'>
          <InputGroupButton>Accio</InputGroupButton>
        </InputGroupAddon>
      </InputGroup>
    </div>
  )
}

/** Every fill of the control; each has the focus ring, only `outline` has the 3:1 edge at rest. */
export const Variants: Story = {
  render: () => (
    <Axis axis='variant' rows={controlVariantNames}>
      {(variant) => (
        <InputGroup variant={variant}>
          <InputGroupAddon>
            <InputGroupText>@</InputGroupText>
          </InputGroupAddon>
          <InputGroupInput aria-label={`Owl ${variant}`} placeholder='Owl' />
          <InputGroupAddon align='inline-end'>
            <InputGroupButton variant='outline'>Send</InputGroupButton>
          </InputGroupAddon>
        </InputGroup>
      )}
    </Axis>
  ),
  play: async ({ canvasElement }) => expectControlVariants(canvasElement)
}

export const Sizes: Story = {
  render: () => (
    <Axis axis='size' rows={controlSizeNames}>
      {(size) => (
        <InputGroup size={size}>
          <InputGroupAddon>
            <InputGroupText>@</InputGroupText>
          </InputGroupAddon>
          <InputGroupInput aria-label={`Owl ${size}`} placeholder='Owl' />
          <InputGroupAddon align='inline-end'>
            <InputGroupButton variant='outline'>Send</InputGroupButton>
          </InputGroupAddon>
        </InputGroup>
      )}
    </Axis>
  ),
  play: async ({ canvasElement }) => expectControlHeights(canvasElement)
}

export const States: Story = {
  render: () => (
    <Axis axis='state' rows={['default', 'invalid'] as const}>
      {(state) => (
        <Field invalid={state === 'invalid'}>
          <InputGroup>
            <InputGroupInput
              aria-label={`Search ${state}`}
              placeholder='Search the restricted stacks…'
            />
            <InputGroupAddon align='inline-end'>
              <InputGroupButton>Expecto</InputGroupButton>
            </InputGroupAddon>
          </InputGroup>
        </Field>
      )}
    </Axis>
  ),
  play: async ({ canvas }) => {
    // Base UI marks the inner control; the group root mirrors it via `:has()`.
    await expect(canvas.getByRole('textbox', { name: 'Search invalid' })).toHaveAttribute(
      'data-invalid'
    )
    await expect(canvas.getByRole('textbox', { name: 'Search default' })).not.toHaveAttribute(
      'data-invalid'
    )
  }
}

export const Icon: Story = {
  render: () => (
    <InputGroup style={styles.group}>
      <InputGroupAddon>
        <Search {...stylex.props(styles.icon)} />
      </InputGroupAddon>
      <InputGroupInput placeholder='Search the Restricted Section…' />
    </InputGroup>
  )
}

export const Button: Story = {
  render: () => (
    <InputGroup style={styles.group}>
      <InputGroupInput
        aria-label='Howler address'
        readOnly
        defaultValue='https://dailyprophet.co.uk/howlers'
      />
      <InputGroupAddon align='inline-end'>
        <InputGroupButton icon={Copy} aria-label='Copy howler address' />
      </InputGroupAddon>
    </InputGroup>
  )
}

export const WithKbd: Story = {
  name: 'Kbd',
  render: () => (
    <InputGroup style={styles.group}>
      <InputGroupInput placeholder='Search the restricted stacks…' />
      <InputGroupAddon align='inline-end'>
        <Kbd>⌘K</Kbd>
      </InputGroupAddon>
    </InputGroup>
  )
}

export const WithSpinner: Story = {
  name: 'Spinner',
  render: () => (
    <InputGroup style={styles.group}>
      <InputGroupInput placeholder='Enter an auror codename' defaultValue='mad-eye' />
      <InputGroupAddon align='inline-end'>
        <Spinner />
      </InputGroupAddon>
    </InputGroup>
  )
}

export const Textarea: Story = {
  render: () => (
    <InputGroup style={styles.group}>
      <InputGroupTextarea placeholder='Write to Sirius…' rows={3} />
      <InputGroupAddon align='block-end'>
        <InputGroupButton variant='outline' size='xs'>
          Send owl
        </InputGroupButton>
      </InputGroupAddon>
    </InputGroup>
  ),
  play: async ({ canvas }) => {
    const textarea = canvas.getByPlaceholderText('Write to Sirius…')
    await userEvent.type(textarea, 'Padfoot, the map is a fake.')
    await expect(textarea).toHaveValue('Padfoot, the map is a fake.')
  }
}
