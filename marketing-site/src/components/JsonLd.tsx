import React from 'react';
import { PageFrontmatter } from '../types';

interface Props {
  frontmatter: PageFrontmatter;
  faqEntries?: { question: string; answerText: string }[];
}

export const JsonLd: React.FC<Props> = ({ frontmatter, faqEntries }) => {
  const schemas: any[] = [];

  // SoftwareApplication schema for product & root
  if (frontmatter.schemaTypes.includes('SoftwareApplication')) {
    schemas.push({
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      'name': 'Decentralized.Host',
      'applicationCategory': 'DeveloperApplication',
      'operatingSystem': 'Linux',
      'softwareRequirements': 'Docker 24.0+, Python 3.11+',
      'programmingLanguage': 'Python',
      'license': 'https://opensource.org/licenses/MIT',
      'codeRepository': 'https://github.com/CodesbyFebin/decentralized.host',
      'description': frontmatter.description,
      'offers': {
        '@type': 'Offer',
        'price': '0',
        'priceCurrency': 'USD'
      }
    });
  }

  // Organization schema
  if (frontmatter.schemaTypes.includes('Organization')) {
    schemas.push({
      '@context': 'https://schema.org',
      '@type': 'Organization',
      'name': 'Decentralized.Host',
      'url': 'https://decentralized.host',
      'logo': 'https://decentralized.host/assets/logo.svg',
      'sameAs': [
        'https://github.com/CodesbyFebin/decentralized.host'
      ]
    });
  }

  // WebSite schema
  if (frontmatter.schemaTypes.includes('WebSite')) {
    schemas.push({
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      'name': 'Decentralized.Host',
      'url': 'https://decentralized.host/',
      'inLanguage': 'en-US'
    });
  }

  // TechArticle / HowTo schema for docs, guides, and pillars
  if (frontmatter.schemaTypes.includes('TechArticle') || frontmatter.schemaTypes.includes('HowTo')) {
    schemas.push({
      '@context': 'https://schema.org',
      '@type': 'TechArticle',
      'headline': frontmatter.h1,
      'description': frontmatter.description,
      'url': frontmatter.canonical,
      'datePublished': frontmatter.publishedAt,
      'dateModified': frontmatter.updatedAt,
      'inLanguage': 'en-US',
      'mainEntityOfPage': frontmatter.canonical,
      'author': {
        '@type': 'Organization',
        'name': 'Decentralized.Host'
      },
      'publisher': {
        '@type': 'Organization',
        'name': 'Decentralized.Host'
      }
    });
  }

  // FAQPage schema -- only emitted when real Q&A content is passed in
  if (frontmatter.schemaTypes.includes('FAQPage') && faqEntries && faqEntries.length > 0) {
    schemas.push({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      'mainEntity': faqEntries.map((entry) => ({
        '@type': 'Question',
        'name': entry.question,
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': entry.answerText
        }
      }))
    });
  }

  // BreadcrumbList schema
  schemas.push({
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    'itemListElement': [
      {
        '@type': 'ListItem',
        'position': 1,
        'name': 'Home',
        'item': 'https://decentralized.host/'
      },
      ...(frontmatter.slug !== '/' ? [{
        '@type': 'ListItem',
        'position': 2,
        'name': frontmatter.h1,
        'item': frontmatter.canonical
      }] : [])
    ]
  });

  return (
    <>
      {schemas.map((schema, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}
    </>
  );
};
