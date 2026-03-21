
export const getSaavnImageUrl = (url: string | undefined | null, size: 50 | 150 | 500 = 150): string => {
  if (!url) return '';
  return url.replace(/\d+x\d+/, `${size}x${size}`);
};
