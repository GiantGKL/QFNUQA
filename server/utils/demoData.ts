export interface DemoTag {
  id: number
  name: string
}

export interface DemoQA {
  id: number
  question: string
  answer: string
  view_count: number
  created_at: string
  updated_at: string
  category_id: number
  category_name: string
  tags: DemoTag[]
  relevance?: number
}

const createdAt = '2026-08-08T08:00:00.000Z'
const updatedAt = '2026-08-28T08:00:00.000Z'

const tag = (id: number, name: string): DemoTag => ({ id, name })

const demoQAs: DemoQA[] = [
  { id: 1, question: '新生报到需要带什么？', answer: '新生报到需携带录取通知书、身份证、高考准考证、党团关系转接材料和一寸照片若干；如需迁户口，还要带户口迁移证。建议提前激活学校随通知书发放的银行卡。', category_id: 1, category_name: '新生入学', tags: [tag(1, '新生必看'), tag(2, '常见问题')], view_count: 1500, created_at: createdAt, updated_at: updatedAt },
  { id: 2, question: '学校有哪几个校区？', answer: '曲阜师范大学目前有曲阜和日照两个校区。曲阜校区位于山东省曲阜市，日照校区位于山东省日照市，具体就读校区以录取通知书和学校安排为准。', category_id: 1, category_name: '新生入学', tags: [tag(1, '新生必看')], view_count: 1200, created_at: createdAt, updated_at: updatedAt },
  { id: 17, question: '如何登录教务系统？', answer: '教务系统地址为 http://zhjw.qfnu.edu.cn。通常使用学号登录，首次登录后请及时修改密码；如无法登录，请联系学院教务老师或学校教务处。', category_id: 3, category_name: '教务相关', tags: [tag(3, '教务系统'), tag(2, '常见问题')], view_count: 1400, created_at: createdAt, updated_at: updatedAt },
  { id: 10, question: '宿舍是什么样的？住宿费多少？', answer: '宿舍床铺常见尺寸约为 200cm×90cm，不同楼栋的房型、独立卫生间和收费标准有所不同。最终住宿安排及费用请以当年学校通知和缴费页面为准。', category_id: 2, category_name: '校园生活', tags: [tag(5, '宿舍'), tag(2, '常见问题')], view_count: 950, created_at: createdAt, updated_at: updatedAt },
  { id: 4, question: '军训什么时候开始？可以不参加吗？', answer: '军训通常在新生开学后开始，是人才培养方案中的实践课程。因疾病等特殊情况无法正常参训时，应准备相关证明并及时向辅导员申请。', category_id: 1, category_name: '新生入学', tags: [tag(6, '军训'), tag(1, '新生必看')], view_count: 900, created_at: createdAt, updated_at: updatedAt },
  { id: 18, question: '选课时间是什么时候？怎么选课？', answer: '每学期选课时间以教务处通知为准，通常包含预选和补退选阶段。请通过教务系统操作，并提前查看本专业培养方案及课程要求。', category_id: 3, category_name: '教务相关', tags: [tag(3, '教务系统')], view_count: 900, created_at: createdAt, updated_at: updatedAt },
  { id: 7, question: '校园卡必须办理吗？', answer: '校园卡及相关通信服务是否办理可根据个人需要决定。部分校园网络和校内服务可能需要完成统一身份认证，具体套餐和办理规则请以迎新现场通知为准。', category_id: 2, category_name: '校园生活', tags: [tag(8, '校园卡'), tag(4, '校园网')], view_count: 850, created_at: createdAt, updated_at: updatedAt },
  { id: 16, question: '怎么辨别新生群里的诈骗信息？', answer: '不要轻信非官方群聊中的收费、兼职和推销信息，不点击可疑链接，不向陌生人提供验证码。学校通知应通过官网、官方应用或辅导员核实。', category_id: 1, category_name: '新生入学', tags: [tag(9, '反诈'), tag(1, '新生必看')], view_count: 800, created_at: createdAt, updated_at: updatedAt },
  { id: 19, question: '如何查询成绩？', answer: '登录教务系统后进入成绩查询页面即可查看各学期成绩，也可留意学校官方移动应用提供的查询入口。如对成绩有疑问，请按教务处规定申请复核。', category_id: 3, category_name: '教务相关', tags: [tag(3, '教务系统'), tag(11, '智慧曲园')], view_count: 750, created_at: createdAt, updated_at: updatedAt },
  { id: 15, question: '怎么从火车站或高铁站到学校？', answer: '前往曲阜校区可从曲阜站或曲阜东站换乘公交、出租车或网约车。公交线路可能调整，出发前请通过地图软件和当地公交平台核对实时路线。', category_id: 2, category_name: '校园生活', tags: [tag(10, '交通'), tag(1, '新生必看')], view_count: 750, created_at: createdAt, updated_at: updatedAt },
  { id: 13, question: '快递地址怎么填？快递站有哪些？', answer: '快递地址应填写所在校区、宿舍区和本人手机号。校内外驿站分布及营业时间可能变化，下单前可向宿管、辅导员或对应快递公司确认。', category_id: 2, category_name: '校园生活', tags: [tag(7, '快递'), tag(2, '常见问题')], view_count: 700, created_at: createdAt, updated_at: updatedAt },
  { id: 14, question: '学校食堂有哪些？', answer: '曲阜校区有齐风、鲁颂、二餐、三餐、博雅等餐饮区域，不同校区和生活区也有多种餐饮选择。开放窗口和营业时间以现场公示为准。', category_id: 2, category_name: '校园生活', tags: [tag(12, '食堂')], view_count: 600, created_at: createdAt, updated_at: updatedAt },
]

export const demoQuickLinks = [
  { id: 1, name: '校历', icon: 'calendar', url: 'https://jwc.qfnu.edu.cn/', description: '教务处校历与通知', sort_order: 1 },
  { id: 2, name: '教务系统', icon: 'school', url: 'http://zhjw.qfnu.edu.cn/', description: '教务管理系统', sort_order: 2 },
  { id: 3, name: '图书馆', icon: 'link', url: 'https://lib.qfnu.edu.cn/', description: '图书馆官网', sort_order: 3 },
  { id: 4, name: '一网通办', icon: 'link', url: 'https://ids.qfnu.edu.cn/', description: '校园一网通办', sort_order: 4 },
  { id: 5, name: '教务处', icon: 'school', url: 'https://jwc.qfnu.edu.cn/', description: '教务处官网', sort_order: 5 },
]

const searchCounts = new Map<string, number>([['教务系统', 18], ['宿舍', 15], ['校园卡', 12], ['军训', 10], ['成绩查询', 8], ['食堂', 6]])

export function useDemoData(): boolean {
  const configured = process.env.DEMO_MODE?.trim().toLowerCase()
  if (configured === 'true') return true
  if (configured === 'false') return false
  return process.env.NODE_ENV !== 'production' && !process.env.DATABASE_URL
}

export function getDemoQAList(options: { page: number; pageSize: number; category?: number; tag?: number; sortBy?: string; order?: string }) {
  let items = demoQAs.filter(item => (!options.category || item.category_id === options.category) && (!options.tag || item.tags.some(itemTag => itemTag.id === options.tag)))
  const direction = options.order === 'ASC' ? 1 : -1
  const field = options.sortBy === 'created_at' || options.sortBy === 'updated_at' ? options.sortBy : 'view_count'
  items = [...items].sort((left, right) => {
    const leftValue = field === 'view_count' ? left[field] : Date.parse(left[field])
    const rightValue = field === 'view_count' ? right[field] : Date.parse(right[field])
    return (leftValue - rightValue) * direction
  })
  const start = (options.page - 1) * options.pageSize
  return { items: items.slice(start, start + options.pageSize), pagination: { page: options.page, pageSize: options.pageSize, total: items.length } }
}

export function getDemoQA(id: number): DemoQA | undefined {
  const item = demoQAs.find(candidate => candidate.id === id)
  if (item) item.view_count += 1
  return item
}

export function searchDemoQAs(keyword: string, limit = 10, category = 0): DemoQA[] {
  const terms = keyword.toLocaleLowerCase().split(/\s+/).filter(Boolean)
  return demoQAs
    .filter(item => !category || item.category_id === category)
    .map((item) => {
      const question = item.question.toLocaleLowerCase()
      const searchable = `${question} ${item.answer} ${item.category_name} ${item.tags.map(itemTag => itemTag.name).join(' ')}`.toLocaleLowerCase()
      const relevance = terms.reduce((score, term) => score + (question.includes(term) ? 3 : searchable.includes(term) ? 1 : 0), 0)
      return { ...item, relevance }
    })
    .filter(item => item.relevance > 0)
    .sort((left, right) => right.relevance! - left.relevance! || right.view_count - left.view_count)
    .slice(0, limit)
}

export function getDemoCategories() {
  const definitions = [
    { id: 1, name: '新生入学', description: '报到、军训与入学安全', sort_order: 1 },
    { id: 2, name: '校园生活', description: '宿舍、食堂、快递与交通', sort_order: 2 },
    { id: 3, name: '教务相关', description: '选课、成绩与教务系统', sort_order: 3 },
  ]
  return definitions.map(category => ({ ...category, icon: null, parent_id: null, children: [], qa_count: String(demoQAs.filter(item => item.category_id === category.id).length) }))
}

export function getDemoTags() {
  const counts = new Map<number, DemoTag & { qa_count: number }>()
  for (const item of demoQAs) for (const itemTag of item.tags) {
    const current = counts.get(itemTag.id)
    counts.set(itemTag.id, { ...itemTag, qa_count: (current?.qa_count || 0) + 1 })
  }
  return [...counts.values()].sort((left, right) => right.qa_count - left.qa_count || left.name.localeCompare(right.name)).map(item => ({ ...item, qa_count: String(item.qa_count) }))
}

export function logDemoSearch(keyword: string): void {
  searchCounts.set(keyword, (searchCounts.get(keyword) || 0) + 1)
}

export function getDemoHotSearches(limit: number) {
  return [...searchCounts.entries()].sort((left, right) => right[1] - left[1]).slice(0, limit).map(([keyword, count]) => ({ keyword, count: String(count) }))
}

export function buildDemoAnswer(keyword: string, items: DemoQA[]): string {
  if (!items.length) return `演示知识库暂未找到与“${keyword}”直接相关的内容。建议换一个更具体的关键词，或通过学校官网和对应部门核实。`
  const [bestMatch] = items
  return `根据校园知识库，${bestMatch!.answer}\n\n当前为本地演示回答，重要信息请以学校最新官方通知为准。`
}
