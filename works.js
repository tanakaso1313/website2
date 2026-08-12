/* Single source of truth for the works shown on the landing page.
   `year` drives the chronological grouping. */
window.SOTANAKA_WORKS = [
  { name: 'Uneri',        href: '/uneri',    category: 'furniture', year: 2026, file: '10.uneri' },
  { name: 'MO Lamp',      href: '/mo-lamp',  category: 'lighting',     year: 2025, file: '9.MO Lamp' },
  { name: 'Let a Colored Paper Swim in the Clouds', href: '/let-a-colored-paper-swim-in-clouds', category: 'other', year: 2025, file: '8.Let a' },
  { name: 'Liminal Lamp', href: '/liminal-lamp',    category: 'lighting', year: 2025, file: '7.Liminal Lamp' },
  { name: 'Liminal Objects', href: '/liminal-objects', category: 'other', year: 2025, file: '6.Liminal Objects', monoSuffix: '_top_mono_result.webp' },
  { name: 'C ya',         href: '/cya',      category: 'other',     year: 2025, file: '11.cya' },
  { name: 'Memento',      href: '/memento',  category: 'other',     year: 2023, file: '5.Memento' },
  { name: 'Vnsh',         href: '/vnsh',     category: 'lighting',     year: 2023, file: '4.Vnsh' },
  { name: 'ORI',          href: '/ori',      category: 'furniture', year: 2023, file: '2.ORI' },
  { name: 'Less Than Instrument', href: '/lti', category: 'lighting',  year: 2020, file: '3.LTI' },
  { name: 'Transfer',     href: '/transfer', category: 'other',     year: 2019, file: '1.transfer' }
];

/* Resting state is the halftoned monochrome image; hover swaps to the clean colour photo. */
window.workSrc  = w => encodeURI(`images/top_2/${w.file}_top_result_result.webp`);
window.workMono = w => encodeURI(`images/mono_2/${w.file}${w.monoSuffix || '_top_mono_result_result.webp'}`);
