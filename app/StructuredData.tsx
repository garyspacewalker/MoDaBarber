'use client';

export default function StructuredData() {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'Barbershop',
    name: 'ModeBarber',
    url: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
    telephone: '+27 67 279 1851',
    address: {
      '@type': 'PostalAddress',
      streetAddress: '—', // add if you want it shown in Google
      addressLocality: 'Johannesburg',
      postalCode: '2000',
      addressCountry: 'ZA',
    },
    priceRange: 'R',
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        opens: '09:00',
        closes: '18:00',
      },
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Saturday'],
        opens: '09:00',
        closes: '16:00',
      },
    ],
    sameAs: [
      // Add social profiles if/when you have them:
      // 'https://www.instagram.com/yourhandle',
      // 'https://www.facebook.com/yourpage'
    ],
  };

  return (
    <script
      type="application/ld+json"
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
