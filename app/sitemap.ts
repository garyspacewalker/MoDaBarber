
// app/sitemap.ts
export default function sitemap() {
  const base = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  const now = new Date();
  return [
    { url: `${base}/`,        changeFrequency: 'weekly',  priority: 1.0, lastModified: now },
    { url: `${base}/book`,    changeFrequency: 'weekly',  priority: 0.9, lastModified: now },
    { url: `${base}/shop`,    changeFrequency: 'weekly',  priority: 0.8, lastModified: now },
    { url: `${base}/prepay`,  changeFrequency: 'weekly',  priority: 0.7, lastModified: now },
    { url: `${base}/contact`, changeFrequency: 'monthly', priority: 0.6, lastModified: now },
  ];
}