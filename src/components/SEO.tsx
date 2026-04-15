import React, { useEffect } from 'react';

type SEOProps = {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  keywords?: string;
};

// Defaults
const DEFAULT_TITLE = '숙명창학120주년 전야제';
const DEFAULT_DESCRIPTION = '숙명여자대학교 개교 120주년을 맞이하여 동문 여러분을 초대합니다.';
const DEFAULT_IMAGE = '/og-image.jpg';
const DEFAULT_CANONICAL_BASE = 'https://120th.sookmyung.ac.kr';

export const SEO: React.FC<SEOProps> = ({
  title, // eslint-disable-line
  description,
  image,
  url,
  keywords,
}) => {
  const fullTitle = DEFAULT_TITLE;
  const fullDescription = description || DEFAULT_DESCRIPTION;
  const imageUrl = image || DEFAULT_IMAGE;
  const canonical = url || DEFAULT_CANONICAL_BASE;
  const keywordsContent = keywords || '숙명여자대학교, 120주년, 동문회, 기념식, Sookmyung, alumni';

  useEffect(() => {
    document.title = fullTitle;

    const updateMeta = (name: string, content: string) => {
      let meta = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement;
      if (!meta) {
        meta = document.createElement('meta');
        meta.name = name;
        document.head.appendChild(meta);
      }
      meta.content = content;
    };

    const updateProperty = (property: string, content: string) => {
      let meta = document.querySelector(`meta[property="${property}"]`) as HTMLMetaElement;
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute('property', property);
        document.head.appendChild(meta);
      }
      meta.content = content;
    };

    updateMeta('description', fullDescription);
    updateMeta('keywords', keywordsContent);
    updateProperty('og:title', fullTitle);
    updateProperty('og:description', fullDescription);
    updateProperty('og:image', imageUrl);
    updateProperty('og:url', canonical);
    updateProperty('og:type', 'website');
    updateMeta('twitter:card', 'summary_large_image');
    updateMeta('twitter:title', fullTitle);
    updateMeta('twitter:description', fullDescription);
    updateMeta('twitter:image', imageUrl);
    updateMeta('google', 'notranslate');

    let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (!link) {
      link = document.createElement('link');
      link.rel = 'canonical';
      document.head.appendChild(link);
    }
    link.href = canonical;
  }, [fullTitle, fullDescription, imageUrl, canonical, keywordsContent]);

  return null;
};

export default SEO;
