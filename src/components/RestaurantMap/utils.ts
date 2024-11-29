import { TAG_COLORS } from './constants';

export const getTagColor = (cuisine?: string): string => {
  return TAG_COLORS[cuisine?.toLowerCase() || 'default'] || TAG_COLORS.default;
};
