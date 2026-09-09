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
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-500">
          Featured
        </p>
        <h2 className="mt-1 text-2xl font-black tracking-tight">Supported Platforms</h2>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {platforms.map((platform) => (
          <div
            key={platform.name}
            className={`group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br ${platform.color} shadow-xl shadow-black/30 transition hover:border-white/40 hover:shadow-2xl hover:shadow-white/10`}
          >
            {/* Background image */}
            <div className="absolute inset-0 opacity-30 group-hover:opacity-50 transition">
              <div className="h-full w-full bg-cover bg-center" style={{ backgroundImage: `url('${platform.image}')` }} />
            </div>

            {/* Overlay gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

            {/* Content */}
            <div className="relative flex h-32 flex-col justify-between p-4 sm:h-40">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-black/60 group-hover:bg-black/80">
                <svg aria-hidden="true" viewBox="0 0 24 24" className="h-6 w-6 fill-white">
                  <path d={platform.svg} />
                </svg>
              </div>

              <div>
                <p className="text-sm font-black text-white sm:text-base">{platform.name}</p>
                <p className="text-xs text-white/70">Stream your favorites</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
