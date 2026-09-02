import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import QaCard from './QaCard.vue'

const qa = {
  id: 7,
  question: '如何查询课表？',
  answer: '打开智慧曲园应用即可查询。',
  view_count: 18,
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-02T00:00:00Z',
  category_id: 1,
  category_name: '教务服务',
  tags: [{ id: 2, name: '课表' }],
}

describe('QaCard', () => {
  it('renders knowledge metadata and emits selection', async () => {
    const wrapper = mount(QaCard, { props: { qa } })
    expect(wrapper.text()).toContain('如何查询课表？')
    expect(wrapper.text()).toContain('教务服务')
    await wrapper.trigger('click')
    expect(wrapper.emitted('select')).toEqual([[7]])
  })
})
