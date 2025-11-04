// Generate consistent gradient per slide ID
export const getGradientColor = (id: string | number): string => {
  const hues = [260, 280, 300, 320]; // Purple/magenta range (biotech aesthetic)
  const hue = hues[Number(id) % hues.length];
  return `hsl(${hue}, 70%, 50%), hsl(${(hue + 40) % 360}, 80%, 60%)`;
};