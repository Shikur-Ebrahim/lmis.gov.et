// News items data
const newsData = [
  {
    title: "አስተያየት፣ ቅሬታ አልያም ጥቆማ ይኖርዎታል?",
    source: "Ministry of Labor and Skills",
    date: "February 14/2015 Ec.",
    description:
      "በሥራና ክህሎት ሚኒስትር መስሪያቤት በሚሰጡ አገልግሎቶች ላይ ብሎም የE-LMIS ስር...",
    image: "/images/min1.png",
  },
  {
    title: "በሥራና ክህሎት ሚኒስትር በለማው...",
    source: "Ministry of Labor and Skills",
    date: "February 7/2015 Ec.",
    description: "በሥራና ክህሎት ሚኒስትር በለማው የኢትዮጵያ...",
    image: "/images/min2.png",
  },
  {
    title: "በያዝነው በጀት አመት 4.3 ሚሊየን የሥራ...",
    source: "Ministry of Labor and Skills",
    date: "February 7/2015 Ec.",
    description: "ይህ ቁጥር ቀላል የሚባል ቁጥር አይደለም...",
    image: "/images/min3.png",
  },
  {
    title: "አዲስ የዲጂታል አገልግሎት፣ ለስኬት …",
    source: "Ministry of Labor and Skills",
    date: "February 7/2015 Ec.",
    description: "የኢትዮጵያ የሥራ ገበያ መረጃ ስርዓት አካል...",
    image: "/images/min4.png",
  },
  {
    title: "🌏✨በውጪ ሃገር ስራ ስምሪት ፕሮግራም...",
    source: "Ministry of Labor and Skills",
    date: "February 7/2015 Ec.",
    description: "🌏✨በውጪ ሃገር ስራ ስምሪት ዙሪያ...",
    image: "/images/min5.png",
  },
  {
    title: "የሥራ ስነ-ምህዳሩን የሚያሰፉ...",
    source: "Ministry of Labor and Skills",
    date: "February 7/2015 Ec.",
    description: "የኢትዮጵያ የሥራ ገበያ መረጃ ሥርዓት...",
    image: "/images/min6.png",
  },
  {
    title: "የሥራና ክህሎት ሚኒስቴር በውጭ ሀገር...",
    source: "Ministry of Labor and Skills",
    date: "የካቲት 8/2015",
    description: "የሥራና ክህሎት ሚኒስቴር በውጭ...",
    image: "/images/min7.png",
  },
  {
    title: "The ambassador of Saudi Arabia...",
    source: "Ministry of Labor and Skills",
    date: "February 7/2015 Ec.",
    description: "The ambassador of Saudi Arabia...",
    image: "/images/min8.png",
  },
];

export default function LatestNews() {
  return (
    <section className="w-full py-12 md:py-24 lg:py-32 bg-white">
      <div className="container px-4 md:px-6">
        <div className="rounded-xl shadow-md p-8 bg-white">
          {/* Header */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl md:text-6xl">
                Latest News
              </h2>
              <p className="text-sm md:text-base lg:text-base text-gray-500 max-w-3xl mx-auto leading-relaxed text-left">
                Stay updated with the latest developments from E-LMIS, labor
                market trends, and important announcements regarding employment
                in Ethiopia.
              </p>
            </div>
            <a
              href="#"
              className="shrink-0 rounded px-12 py-6 min-w-[180px] min-h-[56px] text-xl font-semibold text-white shadow-md bg-[rgba(99,149,235,0.74)] hover:bg-[rgba(66,111,185,0.9)] transition text-center"
            >
              See All
            </a>
          </div>

          {/* News Grid */}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {newsData.map((news, index) => (
              <div
                key={index}
                className="flex flex-col h-full shadow-none border border-gray-200 rounded-lg overflow-hidden"
              >
                {news.image && (
                  <img
                    src={news.image}
                    alt={news.title}
                    className="w-full h-40 object-cover"
                  />
                )}
                <div className="p-4 flex flex-col flex-grow">
                  <p className="text-sm text-gray-500 mb-1">
                    {news.source} • {news.date}
                  </p>
                  <h3 className="text-lg font-semibold leading-tight mb-2">
                    {news.title}
                  </h3>
                  <p className="text-sm text-gray-600 line-clamp-3 flex-grow">
                    {news.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
