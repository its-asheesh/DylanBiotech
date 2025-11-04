export type CarouselItem = {
  type: 'image' | 'banner' | 'video' | 'text';
  src?: string; // for image/video
  alt?: string; // for image
  text?: string; // for text/banner
  title?: string; // optional title
  id: string | number;
};