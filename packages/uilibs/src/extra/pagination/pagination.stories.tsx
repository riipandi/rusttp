import type { Meta, StoryObj } from '@storybook/tanstack-react'
import * as stylex from '@stylexjs/stylex'
import type { ComponentProps } from 'react'
import { expect, fn, userEvent, waitFor, within } from 'storybook/test'
import { buttonSizes } from '../../base/button/button.stylex'
import { denseControlSizeNames, expectBoxSizes } from '../../contracts/control-sizes'
import { Axis } from '../../contracts/story-axes'
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious
} from './pagination.component'

const meta = {
  title: 'Extra Components/Pagination',
  component: Pagination,
  tags: [] // ['autodocs']
} satisfies Meta<typeof Pagination>

type Story = StoryObj<typeof meta>

const styles = stylex.create({
  iconOnly: {
    paddingInline: 8,
    width: 36
  }
})

export default meta

// The page buttons take `size`; `page` is the story's current page, set as `current`.
type PlaygroundArgs = Pick<ComponentProps<typeof PaginationLink>, 'size'> & { page: number }

export const Playground: StoryObj<PlaygroundArgs> = {
  parameters: {
    docs: {
      source: {
        code: `<Pagination>
  <PaginationContent>
    <PaginationItem>
      <PaginationPrevious href='#' />
    </PaginationItem>
    <PaginationItem>
      <PaginationLink href='#' current>2</PaginationLink>
    </PaginationItem>
    <PaginationItem>
      <PaginationEllipsis />
    </PaginationItem>
    <PaginationItem>
      <PaginationNext href='#' />
    </PaginationItem>
  </PaginationContent>
</Pagination>`
      }
    },
    controls: { disable: false, include: ['size', 'page'] }
  },
  argTypes: {
    size: { control: 'select', options: Object.keys(buttonSizes) },
    page: { control: 'radio', options: [1, 2, 3] }
  },
  args: { size: 'medium', page: 2 },
  render: ({ size, page }) => (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious href='#' />
        </PaginationItem>
        {[1, 2, 3].map((number) => (
          <PaginationItem key={number}>
            <PaginationLink href='#' size={size} current={number === page}>
              {number}
            </PaginationLink>
          </PaginationItem>
        ))}
        <PaginationItem>
          <PaginationEllipsis />
        </PaginationItem>
        <PaginationItem>
          <PaginationNext href='#' />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  ),
  play: async ({ canvas }) => {
    // Links are links, not buttons; the active page carries aria-current.
    await expect(canvas.getByRole('link', { name: '2' })).toHaveAttribute('aria-current', 'page')
    await expect(canvas.getByRole('link', { name: '1' }).getAttribute('aria-current')).toBeNull()
    await expect(canvas.getByRole('link', { name: 'Go to previous page' })).toBeInTheDocument()
    await expect(canvas.getByRole('link', { name: 'Go to next page' })).toBeInTheDocument()
    await expect(within(canvas.getByRole('navigation')).queryAllByRole('button')).toHaveLength(0)
  }
}

export const Sizes: Story = {
  parameters: {
    docs: {
      source: {
        code: `<Pagination labels={{ pagination: 'Pages large' }}>
  <PaginationContent>
    <PaginationItem>
      <PaginationLink href='#' size='large'>1</PaginationLink>
    </PaginationItem>
    <PaginationItem>
      <PaginationLink href='#' size='large' current>2</PaginationLink>
    </PaginationItem>
  </PaginationContent>
</Pagination>`
      }
    }
  },
  render: () => (
    <Axis axis='size' rows={denseControlSizeNames}>
      {(size) => (
        <Pagination labels={{ pagination: `Pages ${size}` }}>
          <PaginationContent>
            <PaginationItem>
              <PaginationLink href='#' size={size}>
                1
              </PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationLink href='#' size={size} current>
                2
              </PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationLink href='#' size={size}>
                3
              </PaginationLink>
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </Axis>
  ),
  // The page links are squares as tall as a dense control of their size.
  play: async ({ canvasElement }) =>
    expectBoxSizes(canvasElement, 'a', {
      xsmall: [28, 28],
      small: [32, 32],
      medium: [36, 36],
      large: [40, 40]
    })
}

export const Simple: Story = {
  render: () => (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationLink href='#' current>
            1
          </PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationLink href='#'>2</PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationLink href='#'>3</PaginationLink>
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  )
}

export const IconsOnly: Story = {
  parameters: {
    docs: {
      source: {
        code: `<Pagination>
  <PaginationContent>
    <PaginationItem>
      <PaginationPrevious href='#' labels={{ previous: '' }} />
    </PaginationItem>
    <PaginationItem>
      <PaginationNext href='#' labels={{ next: '' }} />
    </PaginationItem>
  </PaginationContent>
</Pagination>`
      }
    }
  },
  name: 'Icons only',
  render: () => (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious href='#' labels={{ previous: '' }} style={styles.iconOnly} />
        </PaginationItem>
        <PaginationItem>
          <PaginationNext href='#' labels={{ next: '' }} style={styles.iconOnly} />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  )
}

/** Every built-in word comes from `labels`, so an app translates them in one place. */
export const Translated: Story = {
  parameters: {
    docs: {
      source: {
        code: `const labels = {
  pagination: 'Halaman',
  previous: 'Sebelumnya',
  previousPage: 'Ke halaman sebelumnya',
  next: 'Berikutnya',
  nextPage: 'Ke halaman berikutnya',
  morePages: 'Halaman lainnya'
}

<Pagination labels={labels}>
  <PaginationContent>
    <PaginationItem>
      <PaginationPrevious href='#' labels={labels} />
    </PaginationItem>
    <PaginationItem>
      <PaginationNext href='#' labels={labels} />
    </PaginationItem>
  </PaginationContent>
</Pagination>`
      }
    }
  },
  render: () => {
    const labels = {
      pagination: 'Halaman',
      previous: 'Sebelumnya',
      previousPage: 'Ke halaman sebelumnya',
      next: 'Berikutnya',
      nextPage: 'Ke halaman berikutnya',
      morePages: 'Halaman lainnya'
    }
    return (
      <Pagination labels={labels}>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious href='#' labels={labels} />
          </PaginationItem>
          <PaginationItem>
            <PaginationEllipsis labels={labels} />
          </PaginationItem>
          <PaginationItem>
            <PaginationNext href='#' labels={labels} />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    )
  },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('navigation', { name: 'Halaman' })).toBeInTheDocument()
    await expect(canvas.getByRole('link', { name: 'Ke halaman sebelumnya' })).toBeInTheDocument()
    await expect(canvas.getByRole('link', { name: 'Ke halaman berikutnya' })).toBeInTheDocument()
    await expect(canvas.getByText('Halaman lainnya')).toBeInTheDocument()
  }
}

const onPage = fn()

/** Tab visits every page control in order; Enter follows the focused one; the current page is marked. */
export const Keyboard: Story = {
  render: () => (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            href='#previous'
            onClick={(event) => (event.preventDefault(), onPage('previous'))}
          />
        </PaginationItem>
        {[1, 2, 3].map((number) => (
          <PaginationItem key={number}>
            <PaginationLink
              href={`#page-${number}`}
              current={number === 2}
              onClick={(event) => (event.preventDefault(), onPage(number))}
            >
              {number}
            </PaginationLink>
          </PaginationItem>
        ))}
        <PaginationItem>
          <PaginationEllipsis />
        </PaginationItem>
        <PaginationItem>
          <PaginationNext
            href='#next'
            onClick={(event) => (event.preventDefault(), onPage('next'))}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  ),
  play: async ({ canvas }) => {
    onPage.mockClear()
    const previous = canvas.getByRole('link', { name: 'Go to previous page' })
    const one = canvas.getByRole('link', { name: '1' })
    const two = canvas.getByRole('link', { name: '2' })
    const three = canvas.getByRole('link', { name: '3' })
    const next = canvas.getByRole('link', { name: 'Go to next page' })

    // The current page is marked for assistive technology, not only drawn differently.
    await expect(two).toHaveAttribute('aria-current', 'page')
    await expect(one).not.toHaveAttribute('aria-current')

    // Tab goes previous, 1, 2, 3, next. The ellipsis is not a stop.
    previous.focus()
    for (const link of [one, two, three, next]) {
      await userEvent.tab()
      await waitFor(() => expect(link).toHaveFocus())
    }
    await userEvent.tab({ shift: true })
    await waitFor(() => expect(three).toHaveFocus())

    // Enter follows the focused link.
    await userEvent.keyboard('{Enter}')
    await expect(onPage).toHaveBeenLastCalledWith(3)
    await userEvent.tab()
    await waitFor(() => expect(next).toHaveFocus())
    await userEvent.keyboard('{Enter}')
    await expect(onPage).toHaveBeenLastCalledWith('next')
  }
}
