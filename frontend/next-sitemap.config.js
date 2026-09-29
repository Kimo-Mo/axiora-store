/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: process.env.SITE_URL || 'https://axiora-store.com',
  generateRobotsTxt: true, // (optional) Generate a robots.txt file
  robotsTxtOptions: {
    policies: [
      {
        userAgent: '*',
        allow: '/',
      },
    ],
  },
  // exclude: ['/server-sitemap.xml'], // <= exclude here if you have dynamic sitemaps
  // generateIndexSitemap: false, // set this to false if you don't want an index sitemap
};
