import { SiFacebook, SiInstagram, SiTiktok, SiX, SiYoutube } from 'react-icons/si';

const ICONS = { YouTube: SiYoutube, TikTok: SiTiktok, Instagram: SiInstagram, Facebook: SiFacebook, Twitter: SiX, X: SiX };

export default function PlatformIcon({ name, className = 'size-4' }) {
  const Icon = ICONS[name];
  return Icon ? <Icon className={className} aria-hidden="true" /> : null;
}
