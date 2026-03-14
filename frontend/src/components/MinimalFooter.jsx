import {
  FacebookIcon,
  GithubIcon,
  InstagramIcon,
  LinkedinIcon,
  TwitterIcon,
  YoutubeIcon,
} from 'lucide-react';
import { Calendar01Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';

export default function MinimalFooter() {
  const year = new Date().getFullYear();

  const company = [
    { title: 'About ScheduleIt', href: '#' },
    { title: 'Campus Partnerships', href: '#' },
    { title: 'Customers', href: '#' },
    { title: 'Careers', href: '#' },
    { title: 'Privacy Policy', href: '#' },
    { title: 'Terms of Service', href: '#' },
  ];

  const resources = [
    { title: 'Product Tour', href: '#' },
    { title: 'How It Works', href: '#how-it-works' },
    { title: 'Features', href: '#features' },
    { title: 'Booking Playbooks', href: '#' },
    { title: 'Help Center', href: '#' },
    { title: 'System Status', href: '#' },
  ];

  const socialLinks = [
    { icon: <FacebookIcon className="size-4" />, link: '#' },
    { icon: <GithubIcon className="size-4" />, link: '#' },
    { icon: <InstagramIcon className="size-4" />, link: '#' },
    { icon: <LinkedinIcon className="size-4" />, link: '#' },
    { icon: <TwitterIcon className="size-4" />, link: '#' },
    { icon: <YoutubeIcon className="size-4" />, link: '#' },
  ];

  return (
    <footer className="relative py-10 pb-24 md:py-14 md:pb-28">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mx-auto max-w-6xl rounded-2xl border border-border bg-card p-7 shadow-sm md:p-10">
          <div className="grid grid-cols-6 gap-8">
            <div className="col-span-6 flex flex-col gap-5 md:col-span-4">
              <a href="/" className="flex w-max items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary shadow-sm shadow-primary/30">
                  <HugeiconsIcon icon={Calendar01Icon} size={15} strokeWidth={1.8} className="text-primary-foreground" />
                </div>
                <span className="text-base font-semibold tracking-tight text-foreground">ScheduleIt</span>
              </a>
              <p className="max-w-sm text-balance font-mono text-sm text-muted-foreground">
                ScheduleIt helps universities run booking operations across classrooms, labs, and equipment without
                spreadsheet chaos.
              </p>
              <div className="flex flex-wrap gap-2">
                {socialLinks.map((item, i) => (
                  <a key={i} className="hover:bg-accent rounded-md border border-border p-1.5" target="_blank" href={item.link}>
                    {item.icon}
                  </a>
                ))}
              </div>
            </div>

            <div className="col-span-3 md:col-span-1">
              <span className="mb-2 block text-xs text-muted-foreground">Resources</span>
              <div className="flex flex-col gap-1.5">
                {resources.map(({ href, title }, i) => (
                  <a key={i} className="w-max py-0.5 text-sm duration-200 hover:underline" href={href}>
                    {title}
                  </a>
                ))}
              </div>
            </div>

            <div className="col-span-3 md:col-span-1">
              <span className="mb-2 block text-xs text-muted-foreground">Company</span>
              <div className="flex flex-col gap-1.5">
                {company.map(({ href, title }, i) => (
                  <a key={i} className="w-max py-0.5 text-sm duration-200 hover:underline" href={href}>
                    {title}
                  </a>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-12 border-t border-border pt-7">
            <p className="text-center text-sm font-light text-muted-foreground">
              © {year} ScheduleIt. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
