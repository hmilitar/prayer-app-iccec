// PrayerCard component - Display individual prayer in card format

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Prayer, PrayerCategory } from '../../types/Prayer';
import { Theme } from '../../styles/theme';
import { useTheme } from '../../hooks/useTheme';
import { getScaledFontSize } from '../../utils/fontScaling';

export interface PrayerCardProps {
  prayer: Prayer;
  onPress: (prayer: Prayer) => void;
  onFavorite?: (prayerId: string) => void;
  isFavorite?: boolean;
  showCategory?: boolean;
  compact?: boolean;
  variant?: 'default' | 'elevated' | 'outlined';
}

export default function PrayerCard({
  prayer,
  onPress,
  onFavorite,
  isFavorite = false,
  showCategory = true,
  compact = false,
  variant = 'default'
}: Readonly<PrayerCardProps>) {
  const theme = useTheme();
  const styles = createStyles(theme);

  const handlePress = () => {
    onPress(prayer);
  };

  const handleFavoritePress = () => {
    if (onFavorite) {
      onFavorite(prayer.id);
    }
  };

  const getCategoryColor = (category: PrayerCategory) => {
    switch (category) {
      case PrayerCategory.LITURGICAL:
        return theme.colors.primary[500];
      case PrayerCategory.CONTEMPORARY:
        return theme.colors.semantic.info;
      case PrayerCategory.PERSONAL:
        return theme.colors.semantic.success;
      case PrayerCategory.INTERCESSION:
        return theme.colors.semantic.warning;
      case PrayerCategory.THANKSGIVING:
        return '#f59e0b';
      case PrayerCategory.CONFESSION:
        return theme.colors.semantic.error;
      default:
        return theme.colors.text.secondary;
    }
  };

  const getContainerStyle = () => {
    const baseStyles: any[] = [styles.container];
    
    if (compact) {
      baseStyles.push(styles.compactContainer);
    }
    
    if (variant === 'elevated') {
      baseStyles.push(styles.elevatedContainer);
    } else if (variant === 'outlined') {
      baseStyles.push(styles.outlinedContainer);
    }
    
    return baseStyles;
  };

  const formatCategory = (category: string) => {
    return category.replace('_', ' ').toUpperCase();
  };

  return (
    <TouchableOpacity
      style={getContainerStyle()}
      onPress={handlePress}
      accessibilityLabel={`Prayer: ${prayer.title}`}
      accessibilityRole="button"
      accessibilityHint={`${prayer.category} prayer. ${compact ? '' : 'Tap to read full prayer.'}`}
      activeOpacity={0.7}
    >
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Text style={styles.title} numberOfLines={compact ? 1 : 2}>
            {prayer.title}
          </Text>
          {showCategory && (
            <View style={[
              styles.categoryBadge,
              { backgroundColor: `${getCategoryColor(prayer.category)}15` }
            ]}>
              <Text style={[
                styles.category,
                { color: getCategoryColor(prayer.category) }
              ]}>
                {formatCategory(prayer.category)}
              </Text>
            </View>
          )}
        </View>
        
        {onFavorite && (
          <TouchableOpacity
            style={styles.favoriteButton}
            onPress={handleFavoritePress}
            accessibilityLabel={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            accessibilityRole="button"
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons
              name={isFavorite ? 'heart' : 'heart-outline'}
              size={20}
              color={isFavorite ? theme.colors.semantic.error : theme.colors.text.secondary}
            />
          </TouchableOpacity>
        )}
      </View>
      
      {!compact && prayer.content && (
        <Text style={styles.content} numberOfLines={3}>
          {prayer.content}
        </Text>
      )}
      
      {prayer.source && (
        <Text style={styles.source} numberOfLines={1}>
          {prayer.source}
        </Text>
      )}
      
      {prayer.tags.length > 0 && (
        <View style={styles.tagsContainer}>
          {prayer.tags.slice(0, compact ? 2 : 3).map((tag, index) => (
            <View key={index} style={styles.tag}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
          {prayer.tags.length > (compact ? 2 : 3) && (
            <View style={styles.tag}>
              <Text style={styles.tagText}>
                +{prayer.tags.length - (compact ? 2 : 3)}
              </Text>
            </View>
          )}
        </View>
      )}
    </TouchableOpacity>
  );
}

const createStyles = (theme: Theme) => StyleSheet.create({
  container: {
    backgroundColor: theme.colors.background.primary,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginVertical: theme.spacing.sm,
    ...theme.shadows.md,
  },
  compactContainer: {
    padding: theme.spacing.sm + theme.spacing.xs,
    marginVertical: theme.spacing.xs,
  },
  elevatedContainer: {
    ...theme.shadows.lg,
  },
  outlinedContainer: {
    borderWidth: 1,
    borderColor: theme.colors.background.tertiary,
    shadowOpacity: 0,
    elevation: 0,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.sm,
  },
  titleContainer: {
    flex: 1,
    marginRight: theme.spacing.sm,
  },
  title: {
    fontSize: getScaledFontSize(theme.typography.fontSize.lg),
    fontWeight: '600',
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
    lineHeight: getScaledFontSize(theme.typography.fontSize.lg) * theme.typography.lineHeight.tight,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    borderRadius: theme.borderRadius.full,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs / 2,
  },
  category: {
    fontSize: getScaledFontSize(theme.typography.fontSize.xs),
    fontWeight: '600',
  },
  favoriteButton: {
    padding: theme.spacing.xs,
    borderRadius: theme.borderRadius.md,
    minWidth: 32,
    minHeight: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    fontSize: getScaledFontSize(theme.typography.fontSize.sm),
    color: theme.colors.text.secondary,
    lineHeight: getScaledFontSize(theme.typography.fontSize.sm) * theme.typography.lineHeight.normal,
    marginBottom: theme.spacing.sm,
  },
  source: {
    fontSize: getScaledFontSize(theme.typography.fontSize.xs),
    color: theme.colors.text.tertiary,
    fontStyle: 'italic',
    marginBottom: theme.spacing.sm,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: theme.spacing.xs,
  },
  tag: {
    backgroundColor: theme.colors.background.tertiary,
    borderRadius: theme.borderRadius.full,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs / 2,
    marginRight: theme.spacing.xs,
    marginBottom: theme.spacing.xs,
  },
  tagText: {
    fontSize: getScaledFontSize(theme.typography.fontSize.xs),
    color: theme.colors.text.secondary,
    fontWeight: '500',
  },
});