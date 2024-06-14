import 'server-only'

export type Lang = 'en-US' | 'zh-CN'

const dictionaries = {
    'en-US': () => import('./en.json').then((module) => module.default),
    'zh-CN': () => import('./zh.json').then((module) => module.default),
}

const I18N = async (locale: Lang) => dictionaries[locale]();

export default I18N;