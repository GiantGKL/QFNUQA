import { describe, expect, it } from 'vitest'
import { renderMarkdown } from './markdown'

describe('renderMarkdown', () => {
  it('renders basic Markdown', () => {
    expect(renderMarkdown('**重点**')).toContain('<strong>重点</strong>')
  })

  it('does not render raw HTML', () => {
    const rendered = renderMarkdown('<script>alert(1)</script>')
    expect(rendered).not.toContain('<script>')
    expect(rendered).toContain('&lt;script&gt;')
  })
})
