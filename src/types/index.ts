export interface StudentProject {
  id: string;
  title: string;
  subtitle: string;
  category: 'character' | 'environment' | 'game' | 'vr';
  categoryLabel: string;
  students: {
    name: string;
    role: string;
    artstation?: string;
    github?: string;
    email?: string;
  }[];
  thumbnail: string;
  previewVideo?: string;
  description: string;
  tools: string[];
  specs: {
    polyCount?: string;
    textureResolution?: string;
    engine?: string;
    platform?: string;
  };
  galleryImages: string[];
  sketchfabId?: string;
}

export interface VirtualSpace {
  id: string;
  name: string;
  koreanName: string;
  theme: 'cyberpunk' | 'fantasy' | 'scifi';
  description: string;
  atmosphere: string;
  lightingType: string;
  assetsUsed: string[];
  color: string;
  accentHex: number;
  bgHex: number;
}

export interface GuestMessage {
  id: string;
  author: string;
  message: string;
  targetStudent?: string;
  createdAt: string;
}
