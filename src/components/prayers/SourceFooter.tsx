/**
 * SourceFooter — shows the source attribution for a prayer
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { useLocalization } from '../../hooks/useLocalization';
import { getScaledFontSize } from '../../utils/fontScaling';
import type { Theme } from '../../styles/theme';

export interface SourceFooterProps {
  /** Source name (e.g., "Book of Common Prayer") */
  readonly source?: string;
  /** Specific reference within the source */
  readonly sourceReference?: string;
}

export function SourceFooter({ source, sourceReference }: SourceFooterProps) {
  const theme = useTheme();
  const { t } = useLocalization();
  const styles = createStyles(theme);

  if (!source && !sourceReference) return null;

  return (
    <View style={styles.container} accessibilityRole="text">
      {source ? (
        <Text style={styles.text}>
          {t('sourceFooter.sourceDocument') ?? 'Source'}: {source}
        </Text>
      ) : null}
      {sourceReference ? (
        <Text style={styles.reference}>
          {t('sourceFooter.page') ?? 'Page'}: {sourceReference}
        </Text>
      ) : null}
    </View>
  );
}

const createStyles = (theme: Theme & { userFontSize: string }) =>
  StyleSheet.create({
    container: {
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: theme.colors.border.light,
      backgroundColor: theme.colors.background.primary,
    },
    text: {
      fontSize: getScaledFontSize(12, theme.userFontSize),
      color: theme.colors.text.tertiary,
      fontStyle: 'italic',
    },
    reference: {
      fontSize: getScaledFontSize(11, theme.userFontSize),
      color: theme.colors.text.tertiary,
      marginTop: 2,
    },
  });
