// Curated premium destinations for Daily Discovery + saving.
// 30 destinations — hand-picked for visual strength + long-term relevance.
// Images are stable Unsplash CDN URLs (no API key, free).

export interface Destination {
  id: string;
  name: string;
  country: string;
  countryCode: string; // ISO-2
  tagline: string;
  image: string;
  exploreUrl: string; // routes into booking engine
}

export const DESTINATIONS: Destination[] = [
  { id: 'bali',        name: 'Bali',        country: 'Indonesia',  countryCode: 'ID', tagline: 'Where temples meet the tide.',           image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=900&q=80', exploreUrl: 'https://bookings.gobabytravel.com/search/trips?dest=Bali' },
  { id: 'kyoto',       name: 'Kyoto',       country: 'Japan',      countryCode: 'JP', tagline: 'Ancient stillness. Modern grace.',       image: 'https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=900&q=80', exploreUrl: 'https://bookings.gobabytravel.com/search/trips?dest=Kyoto' },
  { id: 'santorini',   name: 'Santorini',   country: 'Greece',     countryCode: 'GR', tagline: 'White cliffs. Blue forever.',           image: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=900&q=80', exploreUrl: 'https://bookings.gobabytravel.com/search/trips?dest=Santorini' },
  { id: 'maldives',    name: 'Maldives',    country: 'Maldives',   countryCode: 'MV', tagline: 'A slower kind of luxury.',             image: 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=900&q=80', exploreUrl: 'https://bookings.gobabytravel.com/search/trips?dest=Maldives' },
  { id: 'dubai',       name: 'Dubai',       country: 'UAE',        countryCode: 'AE', tagline: 'Skyline of ambition.',                 image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=900&q=80', exploreUrl: 'https://bookings.gobabytravel.com/search/trips?dest=Dubai' },
  { id: 'singapore',   name: 'Singapore',   country: 'Singapore',  countryCode: 'SG', tagline: 'A city engineered for wonder.',        image: 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=900&q=80', exploreUrl: 'https://bookings.gobabytravel.com/search/trips?dest=Singapore' },
  { id: 'iceland',     name: 'Iceland',     country: 'Iceland',    countryCode: 'IS', tagline: 'Fire, ice, and silence.',              image: 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=900&q=80', exploreUrl: 'https://bookings.gobabytravel.com/search/trips?dest=Iceland' },
  { id: 'switzerland', name: 'Switzerland', country: 'Switzerland',countryCode: 'CH', tagline: 'Where the air tastes of glaciers.',     image: 'https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?w=900&q=80', exploreUrl: 'https://bookings.gobabytravel.com/search/trips?dest=Switzerland' },
  { id: 'paris',       name: 'Paris',       country: 'France',     countryCode: 'FR', tagline: 'An idea, before it is a city.',         image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=900&q=80', exploreUrl: 'https://bookings.gobabytravel.com/search/trips?dest=Paris' },
  { id: 'rome',        name: 'Rome',        country: 'Italy',      countryCode: 'IT', tagline: 'Centuries written in stone.',           image: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=900&q=80', exploreUrl: 'https://bookings.gobabytravel.com/search/trips?dest=Rome' },
  { id: 'bangkok',     name: 'Bangkok',     country: 'Thailand',   countryCode: 'TH', tagline: 'Golden temples. Neon nights.',          image: 'https://images.unsplash.com/photo-1563492065599-3520f775eeed?w=900&q=80', exploreUrl: 'https://bookings.gobabytravel.com/search/trips?dest=Bangkok' },
  { id: 'queenstown',  name: 'Queenstown',  country: 'New Zealand',countryCode: 'NZ', tagline: 'Adventure has a postcode.',             image: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=900&q=80', exploreUrl: 'https://bookings.gobabytravel.com/search/trips?dest=Queenstown' },
  { id: 'capetown',    name: 'Cape Town',   country: 'South Africa',countryCode: 'ZA',tagline: 'Where two oceans whisper.',             image: 'https://images.unsplash.com/photo-1580060839134-75a5edca2e99?w=900&q=80', exploreUrl: 'https://bookings.gobabytravel.com/search/trips?dest=Cape%20Town' },
  { id: 'marrakech',   name: 'Marrakech',   country: 'Morocco',    countryCode: 'MA', tagline: 'A city in shades of saffron.',          image: 'https://images.unsplash.com/photo-1597211833712-5e41faa202ea?w=900&q=80', exploreUrl: 'https://bookings.gobabytravel.com/search/trips?dest=Marrakech' },
  { id: 'istanbul',    name: 'Istanbul',    country: 'Türkiye',    countryCode: 'TR', tagline: 'Where continents lean on each other.',  image: 'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=900&q=80', exploreUrl: 'https://bookings.gobabytravel.com/search/trips?dest=Istanbul' },
  { id: 'bhutan',      name: 'Bhutan',      country: 'Bhutan',     countryCode: 'BT', tagline: 'A kingdom that measures happiness.',     image: 'https://images.unsplash.com/photo-1583395145871-2e57d9b9a25c?w=900&q=80', exploreUrl: 'https://bookings.gobabytravel.com/search/trips?dest=Bhutan' },
  { id: 'patagonia',   name: 'Patagonia',   country: 'Argentina',  countryCode: 'AR', tagline: 'The end of the world. The start of awe.',image: 'https://images.unsplash.com/photo-1483683804023-6ccdb62f86ef?w=900&q=80', exploreUrl: 'https://bookings.gobabytravel.com/search/trips?dest=Patagonia' },
  { id: 'machu',       name: 'Machu Picchu',country: 'Peru',       countryCode: 'PE', tagline: 'Stones still keeping ancient secrets.',  image: 'https://images.unsplash.com/photo-1526392060635-9d6019884377?w=900&q=80', exploreUrl: 'https://bookings.gobabytravel.com/search/trips?dest=Machu%20Picchu' },
  { id: 'newyork',     name: 'New York',    country: 'USA',        countryCode: 'US', tagline: 'A city that argues with sleep.',         image: 'https://images.unsplash.com/photo-1485871981521-5b1fd3805eee?w=900&q=80', exploreUrl: 'https://bookings.gobabytravel.com/search/trips?dest=New%20York' },
  { id: 'lisbon',      name: 'Lisbon',      country: 'Portugal',   countryCode: 'PT', tagline: 'Pastel hills and ocean light.',         image: 'https://images.unsplash.com/photo-1555881400-74d7acaacd8b?w=900&q=80', exploreUrl: 'https://bookings.gobabytravel.com/search/trips?dest=Lisbon' },
  { id: 'seoul',       name: 'Seoul',       country: 'South Korea',countryCode: 'KR', tagline: 'A culture that travels in waves.',       image: 'https://images.unsplash.com/photo-1538485399081-7c8970d52f6e?w=900&q=80', exploreUrl: 'https://bookings.gobabytravel.com/search/trips?dest=Seoul' },
  { id: 'sydney',      name: 'Sydney',      country: 'Australia',  countryCode: 'AU', tagline: 'A harbour that learnt to be a city.',    image: 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=900&q=80', exploreUrl: 'https://bookings.gobabytravel.com/search/trips?dest=Sydney' },
  { id: 'norway',      name: 'Norway',      country: 'Norway',     countryCode: 'NO', tagline: 'Where the fjords speak softly.',         image: 'https://images.unsplash.com/photo-1601439678777-b2b3c56fa627?w=900&q=80', exploreUrl: 'https://bookings.gobabytravel.com/search/trips?dest=Norway' },
  { id: 'amalfi',      name: 'Amalfi Coast',country: 'Italy',      countryCode: 'IT', tagline: 'Lemon trees and limestone cliffs.',      image: 'https://images.unsplash.com/photo-1533104816931-20fa691ff6ca?w=900&q=80', exploreUrl: 'https://bookings.gobabytravel.com/search/trips?dest=Amalfi' },
  { id: 'banff',       name: 'Banff',       country: 'Canada',     countryCode: 'CA', tagline: 'Mountains the colour of cathedrals.',    image: 'https://images.unsplash.com/photo-1503614472-8c93d56e92ce?w=900&q=80', exploreUrl: 'https://bookings.gobabytravel.com/search/trips?dest=Banff' },
  { id: 'cairo',       name: 'Cairo',       country: 'Egypt',      countryCode: 'EG', tagline: 'A city older than memory.',              image: 'https://images.unsplash.com/photo-1568322445389-f64ac2515099?w=900&q=80', exploreUrl: 'https://bookings.gobabytravel.com/search/trips?dest=Cairo' },
  { id: 'jaipur',      name: 'Jaipur',      country: 'India',      countryCode: 'IN', tagline: 'Pink walls. Royal stories.',             image: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?w=900&q=80', exploreUrl: 'https://bookings.gobabytravel.com/search/trips?dest=Jaipur' },
  { id: 'kerala',      name: 'Kerala',      country: 'India',      countryCode: 'IN', tagline: 'God’s own quiet, on water.',            image: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=900&q=80', exploreUrl: 'https://bookings.gobabytravel.com/search/trips?dest=Kerala' },
  { id: 'london',      name: 'London',      country: 'UK',         countryCode: 'GB', tagline: 'A city that holds its weather like history.', image: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=900&q=80', exploreUrl: 'https://bookings.gobabytravel.com/search/trips?dest=London' },
  { id: 'vietnam',     name: 'Hanoi',       country: 'Vietnam',    countryCode: 'VN', tagline: 'Lanterns, lakes, and lazy afternoons.',  image: 'https://images.unsplash.com/photo-1509030450996-dd1a26dda07a?w=900&q=80', exploreUrl: 'https://bookings.gobabytravel.com/search/trips?dest=Hanoi' },
];

// Deterministic daily pick — stable for the same date, rotates by day-of-year.
export function getDailyDestination(date: Date = new Date()): Destination {
  const start = Date.UTC(date.getUTCFullYear(), 0, 0);
  const today = Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
  const dayOfYear = Math.floor((today - start) / 86400000);
  return DESTINATIONS[dayOfYear % DESTINATIONS.length];
}

export function getDestinationById(id: string): Destination | undefined {
  return DESTINATIONS.find((d) => d.id === id);
}

// Top 50 most-traveled countries (for the Countries Visited picker)
// Each: ISO-2 + display name. Used in the "Add Countries" modal.
export const POPULAR_COUNTRIES: Array<{ code: string; name: string }> = [
  { code: 'IN', name: 'India' },         { code: 'US', name: 'United States' },
  { code: 'GB', name: 'United Kingdom' },{ code: 'JP', name: 'Japan' },
  { code: 'FR', name: 'France' },        { code: 'IT', name: 'Italy' },
  { code: 'ES', name: 'Spain' },         { code: 'DE', name: 'Germany' },
  { code: 'AE', name: 'UAE' },           { code: 'SG', name: 'Singapore' },
  { code: 'TH', name: 'Thailand' },      { code: 'ID', name: 'Indonesia' },
  { code: 'MY', name: 'Malaysia' },      { code: 'VN', name: 'Vietnam' },
  { code: 'PH', name: 'Philippines' },   { code: 'AU', name: 'Australia' },
  { code: 'NZ', name: 'New Zealand' },   { code: 'CA', name: 'Canada' },
  { code: 'MX', name: 'Mexico' },        { code: 'BR', name: 'Brazil' },
  { code: 'AR', name: 'Argentina' },     { code: 'PE', name: 'Peru' },
  { code: 'EG', name: 'Egypt' },         { code: 'ZA', name: 'South Africa' },
  { code: 'KE', name: 'Kenya' },         { code: 'TR', name: 'Türkiye' },
  { code: 'GR', name: 'Greece' },        { code: 'PT', name: 'Portugal' },
  { code: 'NL', name: 'Netherlands' },   { code: 'BE', name: 'Belgium' },
  { code: 'CH', name: 'Switzerland' },   { code: 'AT', name: 'Austria' },
  { code: 'NO', name: 'Norway' },        { code: 'SE', name: 'Sweden' },
  { code: 'DK', name: 'Denmark' },       { code: 'FI', name: 'Finland' },
  { code: 'IS', name: 'Iceland' },       { code: 'IE', name: 'Ireland' },
  { code: 'PL', name: 'Poland' },        { code: 'CZ', name: 'Czechia' },
  { code: 'HU', name: 'Hungary' },       { code: 'RU', name: 'Russia' },
  { code: 'CN', name: 'China' },         { code: 'KR', name: 'South Korea' },
  { code: 'TW', name: 'Taiwan' },        { code: 'HK', name: 'Hong Kong' },
  { code: 'LK', name: 'Sri Lanka' },     { code: 'NP', name: 'Nepal' },
  { code: 'BT', name: 'Bhutan' },        { code: 'MV', name: 'Maldives' },
];
