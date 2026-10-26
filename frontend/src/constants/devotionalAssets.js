import { Image } from 'react-native';

export const APP_LOGO = require('../../assets/icon.png');

export const DEVOTIONAL_IMAGES = {
  pooja_kit: APP_LOGO,
  havan_samagri: APP_LOGO,
  brass_thali: APP_LOGO,
  desi_ghee: APP_LOGO,
  rudraksha_mala: APP_LOGO,
  mata_ki_chowki: APP_LOGO,
  bhajan_mandali: APP_LOGO,
  bhajan_lead: APP_LOGO,
  vedic_pandit: APP_LOGO,
  jyotish_acharya: APP_LOGO,
  astro_vidushi: APP_LOGO,
  astro_kashi: APP_LOGO,
  astro_ananya: APP_LOGO,
};

/**
 * Universal resolver for image sources across all screens.
 * Accepts:
 *  - number (require(...) asset)
 *  - registered asset key string ('pooja_kit', 'bhajan_mandali', etc.)
 *  - uri string ('https://...', 'file://...', etc.)
 *  - object ({ uri: '...' })
 */
export function resolveDevotionalSource(source, fallbackKey = 'pooja_kit') {
  if (!source) {
    return APP_LOGO;
  }
  if (typeof source === 'number') {
    return source;
  }
  if (typeof source === 'object' && source.uri) {
    return source;
  }
  if (typeof source === 'string') {
    if (
      source.startsWith('http://') ||
      source.startsWith('https://') ||
      source.startsWith('data:') ||
      source.startsWith('file://')
    ) {
      return { uri: source };
    }
  }
  return APP_LOGO;
}

export function DevotionalImage({
  source,
  fallbackKey = 'pooja_kit',
  style,
  resizeMode = 'cover',
  ...props
}) {
  const resolved = resolveDevotionalSource(source, fallbackKey);
  return (
    <Image
      source={resolved}
      style={style}
      resizeMode={resizeMode}
      defaultSource={APP_LOGO}
      {...props}
    />
  );
}

export default {
  IMAGES: DEVOTIONAL_IMAGES,
  resolve: resolveDevotionalSource,
  Component: DevotionalImage,
};
