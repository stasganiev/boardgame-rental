export default function SearchPage({ params: { locale } }: { params: { locale: string } }) {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        {locale === 'ru' ? 'Найти игры' : 'Browse Games'}
      </h1>
      <p className="text-gray-500">
        {locale === 'ru' ? 'Поиск будет реализован в Phase 5' : 'Search coming in Phase 5'}
      </p>
    </div>
  )
}
