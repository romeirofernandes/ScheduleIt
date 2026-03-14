import Link from 'next/link';
import Image from 'next/image';

const members = [
  {
    name: 'Romeiro Fernandes',
    role: 'UX Engineer',
    avatar:
      'https://images.unsplash.com/photo-1564564321837-a57b7070ac4f?q=80&w=1200&auto=format&fit=crop',
    link: '#',
  },
  {
    name: 'Aliqyaan Mahimwala',
    role: 'Sales Manager',
    avatar:
      'https://images.unsplash.com/photo-1633625763717-045645e9e739?q=80&w=1200&auto=format&fit=crop',
    link: '#',
  },
  {
    name: 'Reniyas Nadar',
    role: 'Founder - CEO',
    avatar:
      'https://images.unsplash.com/photo-1758922584983-82ffd5720c6a?q=80&w=1200&auto=format&fit=crop',
    link: '#',
  },
  {
    name: 'Chris Lopes',
    role: 'Visual Designer',
    avatar:
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=1200&auto=format&fit=crop',
    link: '#',
  },
];

export default function TeamSection() {
  return (
    <section id="team" className="py-24 pt-0">
      <div className="mx-auto max-w-6xl px-6">
        <span className="mb-4 inline-block text-xs font-semibold uppercase tracking-[0.16em] text-primary">
          Team
        </span>

        <div className="grid gap-6 sm:grid-cols-2">
          <h2 className="text-balance text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            The team building ScheduleIt
          </h2>
          <p className="text-pretty text-base leading-relaxed text-foreground/80">
            We design booking workflows that feel simple for students and powerful for campus operations teams.
          </p>
        </div>

        <div className="mt-12 grid gap-x-6 gap-y-12 sm:grid-cols-2">
          {members.map((member, index) => (
            <div key={member.name} className="group overflow-hidden">
              <Image
                className="h-96 w-full rounded-md object-cover object-top grayscale outline-1 -outline-offset-1 outline-black/10 transition-[height,border-radius,filter] duration-500 hover:grayscale-0 group-hover:h-[22.5rem] group-hover:rounded-xl"
                src={member.avatar}
                alt={member.name}
                width={826}
                height={1239}
                sizes="(max-width: 768px) 100vw, 520px"
              />
              <div className="px-2 pt-2 sm:pb-0 sm:pt-4">
                <div className="flex justify-between">
                  <h3 className="text-base font-medium tracking-normal transition-[letter-spacing] duration-500 group-hover:tracking-wider">
                    {member.name}
                  </h3>
                  <span className="text-xs text-foreground/80">_0{index + 1}</span>
                </div>
                <div className="mt-1 flex items-center justify-between">
                  <span className="text-foreground/80 inline-block translate-y-6 text-sm opacity-0 transition-[opacity,transform] duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                    {member.role}
                  </span>
                  <Link
                    href={member.link}
                    className="inline-block translate-y-8 text-sm tracking-wide opacity-0 transition-[opacity,transform,color] duration-500 hover:underline group-hover:translate-y-0 group-hover:opacity-100"
                  >
                    Profile
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
