
export type ProjectCategory = 'All' | 'Branding' | '3D' | '2D' | 'Motion';

export type BlockType = 'text' | 'full-image' | 'image-grid' | 'quote' | 'two-column' | 'video' | 'spacer' | 'heading' | 'code' | 'button' | 'divider';

export interface BaseBlock {
  type: BlockType;
  id: string;
  isCollapsed?: boolean;
}

export interface HeadingBlock extends BaseBlock {
  type: 'heading';
  content: string;
  headingLevel?: 'h2' | 'h3';
  align?: 'left' | 'center' | 'right';
}

export interface TextBlock extends BaseBlock {
  type: 'text';
  title?: string;
  content: string;
  align?: 'left' | 'center' | 'right';
  textStyle?: 'normal' | 'serif' | 'mono';
  textColor?: 'default' | 'muted' | 'accent';
  fontSize?: 'sm' | 'base' | 'lg';
  fontWeight?: 'normal' | 'bold';
  italic?: boolean;
  underline?: boolean;
}

export interface FullImageBlock extends BaseBlock {
  type: 'full-image';
  imageUrl: string;
  caption?: string;
  aspectRatio?: 'auto' | '16/9' | '4/3' | '1/1' | '3/4' | '9/16';
  radius?: 'none' | 'sm' | 'md' | 'lg' | 'full';
  shadow?: boolean;
}

export interface VideoBlock extends BaseBlock {
  type: 'video';
  videoUrl: string;
  caption?: string;
  aspectRatio?: '16/9' | '4/3' | '1/1' | '9/16';
  autoPlay?: boolean;
  loop?: boolean;
}

export interface CodeBlock extends BaseBlock {
  type: 'code';
  code: string;
  language: 'javascript' | 'typescript' | 'html' | 'css' | 'python' | 'json';
}

export interface ButtonBlock extends BaseBlock {
  type: 'button';
  buttonText: string;
  buttonUrl: string;
  buttonStyle: 'solid' | 'outline' | 'ghost';
}

export interface SpacerBlock extends BaseBlock {
  type: 'spacer';
  height: string;
}

export interface DividerBlock extends BaseBlock {
  type: 'divider';
}

export interface ImageGridBlock extends BaseBlock {
  type: 'image-grid';
  images: string[];
  layout: string;
}

export interface QuoteBlock extends BaseBlock {
  type: 'quote';
  text: string;
  author?: string;
}

export interface TwoColumnBlock extends BaseBlock {
  type: 'two-column';
  leftContent: string;
  leftTitle?: string;
  rightContent?: string;
  rightImage?: string;
}

export type ProjectBlock = 
  | HeadingBlock 
  | TextBlock 
  | FullImageBlock 
  | ImageGridBlock 
  | QuoteBlock 
  | TwoColumnBlock 
  | VideoBlock 
  | CodeBlock 
  | ButtonBlock 
  | SpacerBlock 
  | DividerBlock;

export interface Project {
  id: string;
  title: string;
  category: ProjectCategory;
  year: string;
  description: string;
  imageUrl: string;
  videoUrl?: string;
  tools?: string[];
  displayOrder?: number;
  star?: number;
  challenge?: string;
  solution?: string;
  gallery?: string[];
  blocks?: ProjectBlock[];
  client?: string;
  role?: string;
  liveUrl?: string;
  featured?: boolean;
  seoDescription?: string;
}

export type SocialIconName = 
  | 'Instagram' | 'Twitter' | 'Linkedin' | 'Mail' | 'Github' | 'Facebook' | 'Telegram' 
  | 'Behance' | 'Dribbble' | 'ArtStation' | 'Youtube' | 'Vimeo' | 'TikTok' | 'Globe';

export interface SocialLink {
  id: string;
  platform: string;
  url: string;
  iconName: SocialIconName;
}

export interface Profile {
  name: string;
  role: string;
  tagline: string;
  bio: string;
  email: string;
  cvUrl: string;
  musicUrl: string;
  socials: SocialLink[];
}

export interface HeroConfig {
  desktopUrl: string;
  mobileUrl: string;
  overlayOpacity: number; // 0 to 1
}

export interface HomeContent {
  profile: Profile;
  uiText: Record<string, string>;
  faviconUrl?: string;
  siteTitle?: string;
  ogImageUrl?: string; // New: Open Graph Image URL for social sharing
  heroConfig?: HeroConfig;
}

export interface GalleryImage {
  src: string;
  width?: number;
  height?: number;
  id?: string;
  title?: string;
  // New properties for manual grid control
  desktopSpan?: number; // 1 to 12
  mobileSpan?: number;  // 1 to 6
}

export interface GalleryCollection {
  id: string;
  title: string;
  location: string;
  date: string;
  images: GalleryImage[];
}

export interface PlaygroundItem {
    id: string;
    title: string;
    src: string;
    width: number;
    height: number;
    tag: string;
    // New properties for manual grid control
    desktopSpan?: number; // 1 to 12
    mobileSpan?: number;  // 1 to 6
}

export interface PlaygroundSection {
    id: string;
    title: string;
    description: string;
    items: PlaygroundItem[];
}
