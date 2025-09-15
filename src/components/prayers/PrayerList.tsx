// PrayerList component - Display list of prayers

import React, { useState, useMemo } from 'react';
import {
  FlatList,
  View,
  Text,
  StyleSheet,
  ListRenderItem,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Prayer, PrayerCategory } from '../../types/Prayer';
import { Theme } from '../../styles/theme';
import { useTheme } from '../../hooks/useTheme';
import { getScaledFontSize } from '../../utils/fontScaling';
import PrayerCard from './PrayerCard';

export interface PrayerListProps {
  prayers: Prayer[];
  onPrayerPress: (prayer: Prayer) => void;
  onFavoritePress?: (prayerId: string) => void;
  favoriteIds?: string[];
  loading?: boolean;
  emptyMessage?: string;
  groupByCategory?: boolean;
  searchable?: boolean;
  filterable?: boolean;
  compact?: boolean;
  refreshing?: boolean;
  onRefresh?: () => void;
}

export default function PrayerList({
  prayers,
  onPrayerPress,
  onFavoritePress,
  favoriteIds = [],
  loading = false,
  emptyMessage = 'No prayers found',
  groupByCategory = false,
  searchable = true,
  filterable = true,
  compact = false,
  refreshing = false,
  onRefresh
}: Readonly<PrayerListProps>) {
  const theme = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<PrayerCategory | 'all'>('all');
  const [showFilters, setShowFilters] = useState(false);
  
  const styles = createStyles(theme);

  // Filter and search prayers
  const filteredPrayers = useMemo(() => {
    let filtered = prayers;

    // Apply category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(prayer => prayer.category === selectedCategory);
    }

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(prayer =>
        prayer.title.toLowerCase().includes(query) ||
        prayer.content.toLowerCase().includes(query) ||
        prayer.tags.some(tag => tag.toLowerCase().includes(query)) ||
        (prayer.source && prayer.source.toLowerCase().includes(query))
      );
    }

    return filtered;
  }, [prayers, searchQuery, selectedCategory]);

  // Get available categories
  const availableCategories = useMemo(() => {
    const categories = Array.from(new Set(prayers.map(prayer => prayer.category)));
    return categories.sort();
  }, [prayers]);

  const renderPrayerItem: ListRenderItem<Prayer> = ({ item }) => (
    <PrayerCard
      prayer={item}
      onPress={onPrayerPress}
      onFavorite={onFavoritePress}
      isFavorite={favoriteIds.includes(item.id)}
      showCategory={!groupByCategory}
      compact={compact}
      
    />
  );

  const renderEmptyComponent = () => (
    <View style={styles.emptyContainer}>
      <Ionicons
        name="book-outline"
        size={48}
        color={theme.colors.text.tertiary}
        style={styles.emptyIcon}
      />
      <Text style={styles.emptyText}>{emptyMessage}</Text>
      {searchQuery && (
        <TouchableOpacity
          style={styles.clearButton}
          onPress={() => setSearchQuery('')}
        >
          <Text style={styles.clearButtonText}>Clear search</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const renderLoadingComponent = () => (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color={theme.colors.primary[500]} />
      <Text style={styles.loadingText}>Loading prayers...</Text>
    </View>
  );

  const renderSectionHeader = (category: string) => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>
        {category.replace('_', ' ').toUpperCase()}
      </Text>
      <Text style={styles.sectionCount}>
        {prayers.filter(p => p.category === category).length}
      </Text>
    </View>
  );

  const renderCategoryFilter = (category: PrayerCategory | 'all') => (
    <TouchableOpacity
      key={category}
      style={[
        styles.filterChip,
        selectedCategory === category && styles.filterChipActive
      ]}
      onPress={() => setSelectedCategory(category)}
    >
      <Text style={[
        styles.filterChipText,
        selectedCategory === category && styles.filterChipTextActive
      ]}>
        {category === 'all' ? 'All' : category.replace('_', ' ')}
      </Text>
    </TouchableOpacity>
  );

  const renderSearchAndFilters = () => (
    <View style={styles.searchContainer}>
      {searchable && (
        <View style={styles.searchInputContainer}>
          <Ionicons
            name="search"
            size={20}
            color={theme.colors.text.tertiary}
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Search prayers..."
            placeholderTextColor={theme.colors.text.tertiary}
            value={searchQuery}
            onChangeText={setSearchQuery}
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              onPress={() => setSearchQuery('')}
              style={styles.clearSearchButton}
            >
              <Ionicons
                name="close-circle"
                size={20}
                color={theme.colors.text.tertiary}
              />
            </TouchableOpacity>
          )}
        </View>
      )}

      {filterable && (
        <View style={styles.filtersContainer}>
          <TouchableOpacity
            style={styles.filterToggle}
            onPress={() => setShowFilters(!showFilters)}
          >
            <Ionicons
              name="filter"
              size={20}
              color={theme.colors.text.secondary}
            />
            <Text style={styles.filterToggleText}>Filters</Text>
            <Ionicons
              name={showFilters ? "chevron-up" : "chevron-down"}
              size={16}
              color={theme.colors.text.secondary}
            />
          </TouchableOpacity>

          {showFilters && (
            <View style={styles.filterChipsContainer}>
              {renderCategoryFilter('all')}
              {availableCategories.map(renderCategoryFilter)}
            </View>
          )}
        </View>
      )}
    </View>
  );

  if (loading) {
    return renderLoadingComponent();
  }

  if (groupByCategory) {
    // Group prayers by category
    const groupedPrayers = filteredPrayers.reduce((groups, prayer) => {
      const category = prayer.category;
      if (!groups[category]) {
        groups[category] = [];
      }
      groups[category].push(prayer);
      return groups;
    }, {} as Record<string, Prayer[]>);

    return (
      <View style={styles.container}>
        {renderSearchAndFilters()}
        <FlatList
          data={Object.entries(groupedPrayers)}
          keyExtractor={([category]) => category}
          renderItem={({ item: [category, categoryPrayers] }) => (
            <View>
              {renderSectionHeader(category)}
              {categoryPrayers.map((prayer) => (
                <PrayerCard
                  key={prayer.id}
                  prayer={prayer}
                  onPress={onPrayerPress}
                  onFavorite={onFavoritePress}
                  isFavorite={favoriteIds.includes(prayer.id)}
                  showCategory={false}
                  compact={compact}
                  
                />
              ))}
            </View>
          )}
          ListEmptyComponent={renderEmptyComponent}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          refreshControl={
            onRefresh ? (
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={[theme.colors.primary[500]]}
                tintColor={theme.colors.primary[500]}
              />
            ) : undefined
          }
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {renderSearchAndFilters()}
      <FlatList
        data={filteredPrayers}
        keyExtractor={(item) => item.id}
        renderItem={renderPrayerItem}
        ListEmptyComponent={renderEmptyComponent}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        windowSize={10}
        removeClippedSubviews={true}
        getItemLayout={(data, index) => ({
          length: compact ? 80 : 120,
          offset: (compact ? 80 : 120) * index,
          index,
        })}
        refreshControl={
          onRefresh ? (
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[theme.colors.primary[500]]}
              tintColor={theme.colors.primary[500]}
            />
          ) : undefined
        }
      />
    </View>
  );
}

const createStyles = (theme: Theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.secondary,
  },
  listContainer: {
    padding: theme.spacing.md,
    flexGrow: 1,
  },
  searchContainer: {
    backgroundColor: theme.colors.background.primary,
    paddingHorizontal: theme.spacing.md,
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.sm,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.background.secondary,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
  },
  searchIcon: {
    marginRight: theme.spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: getScaledFontSize(theme.typography.fontSize.base),
    color: theme.colors.text.primary,
    paddingVertical: theme.spacing.sm,
  },
  clearSearchButton: {
    padding: theme.spacing.xs,
  },
  filtersContainer: {
    marginBottom: theme.spacing.sm,
  },
  filterToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
  },
  filterToggleText: {
    fontSize: getScaledFontSize(theme.typography.fontSize.sm),
    color: theme.colors.text.secondary,
    marginLeft: theme.spacing.sm,
    marginRight: theme.spacing.xs,
    fontWeight: '500',
  },
  filterChipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: theme.spacing.sm,
  },
  filterChip: {
    backgroundColor: theme.colors.background.tertiary,
    borderRadius: theme.borderRadius.full,
    paddingHorizontal: theme.spacing.sm + theme.spacing.xs,
    paddingVertical: theme.spacing.sm,
    marginRight: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
  },
  filterChipActive: {
    backgroundColor: theme.colors.primary[500],
  },
  filterChipText: {
    fontSize: getScaledFontSize(theme.typography.fontSize.sm),
    color: theme.colors.text.secondary,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  filterChipTextActive: {
    color: theme.colors.text.inverse,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: theme.spacing['3xl'],
  },
  emptyIcon: {
    marginBottom: theme.spacing.md,
  },
  emptyText: {
    fontSize: getScaledFontSize(theme.typography.fontSize.base),
    color: theme.colors.text.secondary,
    textAlign: 'center',
    marginBottom: theme.spacing.md,
  },
  clearButton: {
    backgroundColor: theme.colors.primary[500],
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  clearButtonText: {
    color: theme.colors.text.inverse,
    fontSize: getScaledFontSize(theme.typography.fontSize.sm),
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: theme.spacing['3xl'],
  },
  loadingText: {
    fontSize: getScaledFontSize(theme.typography.fontSize.base),
    color: theme.colors.text.secondary,
    marginTop: theme.spacing.md,
  },
  sectionHeader: {
    backgroundColor: theme.colors.background.tertiary,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    marginVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: getScaledFontSize(theme.typography.fontSize.sm),
    fontWeight: '600',
    color: theme.colors.text.primary,
  },
  sectionCount: {
    fontSize: getScaledFontSize(theme.typography.fontSize.xs),
    color: theme.colors.text.tertiary,
    fontWeight: '500',
  },
});
