export type View = 'dashboard' | 'merger' | 'pwa';

export interface MergerModule {
  id: string;
  name: string;
  gs: string;
  html: string;
}

export type IconType = 'url' | 'text' | 'image';

export interface PwaConfig {
  url: string;
  name: string;
  shortName: string;
  desc: string;
  themeColor: string;
  bgColor: string;
  iconType: IconType;
  iconUrl: string;
  iconText: string;
  icon192Src: string | null;
  icon512Src: string | null;
}
