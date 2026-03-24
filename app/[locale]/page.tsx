import Link from 'next/link'

export default function HomePage({
  params: { locale },
}: {
  params: { locale: string }
}) {
  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-500 to-primary-700 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            {locale === 'ru'
              ? 'Арендуйте настольные игры рядом'
              : 'Rent Board Games Near You'}
          </h1>
          <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
            {locale === 'ru'
              ? 'Найдите владельцев игр в вашем городе. Больше игр — меньше затрат. Бесплатно.'
              : 'Connect with local game owners. Play more, spend less. Always free.'}
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link
              href={`/${locale}/search`}
              className="bg-white text-primary-600 hover:bg-primary-50 font-semibold px-8 py-3 rounded-xl transition-colors"
            >
              {locale === 'ru' ? 'Найти игры' : 'Browse Games'}
            </Link>
            <Link
              href={`/${locale}/listings/new`}
              className="bg-primary-600 hover:bg-primary-700 border border-primary-400 text-white font-semibold px-8 py-3 rounded-xl transition-colors"
            >
              {locale === 'ru' ? 'Разместить игру' : 'List a Game'}
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-3 gap-8 text-center">
            {[
              { value: '0', label: locale === 'ru' ? 'Игр доступно' : 'Games Available' },
              { value: '0', label: locale === 'ru' ? 'Городов' : 'Cities' },
              { value: '0', label: locale === 'ru' ? 'Игроков' : 'Players' },
            ].map((stat) => (
              <div key={stat.label}>
                <div className="text-4xl font-bold text-primary-500">{stat.value}</div>
                <div className="text-gray-500 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">
            {locale === 'ru' ? 'Как это работает' : 'How It Works'}
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: '1',
                title: locale === 'ru' ? 'Найдите игру' : 'Find a Game',
                desc:
                  locale === 'ru'
                    ? 'Ищите по карте или каталогу рядом с вами'
                    : 'Search the map or browse games near you',
              },
              {
                step: '2',
                title: locale === 'ru' ? 'Свяжитесь с владельцем' : 'Contact Owner',
                desc:
                  locale === 'ru'
                    ? 'Договоритесь о встрече через контакт в профиле'
                    : "Arrange pickup via the owner's contact details",
              },
              {
                step: '3',
                title: locale === 'ru' ? 'Играйте' : 'Play!',
                desc:
                  locale === 'ru'
                    ? 'Наслаждайтесь игрой и оставьте отзыв'
                    : 'Enjoy the game and leave a review',
              },
            ].map((item) => (
              <div key={item.step} className="card p-6 text-center">
                <div className="w-12 h-12 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                  {item.step}
                </div>
                <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
                <p className="text-gray-500 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
