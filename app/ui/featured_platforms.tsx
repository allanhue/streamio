'use client';

type Platform = {
  name: string;
  image: string;
  color: string;
  svg: string;
};

type FeaturedPlatformsProps = {
  platforms: Platform[];
};

export default function FeaturedPlatforms({ platforms }: FeaturedPlatformsProps) {
  return (
    <section className="mx-auto max-w-[1500px] px-4 pb-6 sm:px-6 lg:px-8">
      <div className="mb-4">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-500">Featured</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {platforms.map((platform) => (
          <div
            key={platform.name}
            className="group relative overflow-hidden rounded-2xl border border-white/10 bg-neutral-950 shadow-xl shadow-black/30 transition hover:border-white/40 hover:shadow-2xl hover:shadow-white/10"
          >
            <img
              src={platform.image}
              alt={platform.name}
              className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105"
            />
            <div className={`absolute inset-0 bg-gradient-to-br ${platform.color} opacity-55 mix-blend-multiply`} />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/45 to-black/10" />

            <div className="relative flex h-36 flex-col justify-between p-4 sm:h-44">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-black/55 backdrop-blur-sm group-hover:bg-black/75">
                <svg aria-hidden="true" viewBox="0 0 24 24" className="h-6 w-6 fill-white">
                  <path d={platform.svg} />
                </svg>
              </div>

              <div>
                <p className="text-base font-black text-white sm:text-lg">{platform.name}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
