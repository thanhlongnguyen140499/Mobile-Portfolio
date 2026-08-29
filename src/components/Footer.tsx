import { profile } from "@/data/profile";

export function Footer() {
  return (
    <footer className="border-line border-t px-6 py-10 md:px-10">
      <div className="text-faint mx-auto flex max-w-[88rem] flex-col gap-4 font-mono text-[0.68rem] tracking-wide sm:flex-row sm:items-center sm:justify-between">
        <p>
          {profile.name}
          <span className="mx-2 opacity-40">·</span>
          {profile.alternateName}
        </p>
        <p className="text-pretty">
          Built with Next.js, React Three Fiber and three.js. App Store artwork belongs to its
          respective owners.
        </p>
      </div>
    </footer>
  );
}
