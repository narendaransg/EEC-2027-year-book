import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        disallow: '/',
      },
      {
        userAgent: [
          'GPTBot',
          'ChatGPT-User',
          'OAI-SearchBot',
          'ClaudeBot',
          'Claude-Web',
          'PerplexityBot',
          'Google-Extended',
          'Bytespider',
          'CCBot',
          'Applebot-Extended',
          'Amazonbot',
          'meta-externalagent',
          'FacebookBot',
          'Diffbot',
          'ImagesiftBot',
          'omgili',
          'Timpibot',
          'YouBot',
        ],
        disallow: '/',
      },
    ],
  };
}
