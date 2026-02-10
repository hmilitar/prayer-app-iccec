import React, { useState, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { formatDateToISO, parseISODate, getLiturgicalColor } from '../../utils/dateUtils';
import { useTheme } from '../../hooks/useTheme';
import { getScaledFontSize } from '../../utils/fontScaling';

interface CalendarViewProps {
  visible: boolean;
  onClose: () => void;
  selectedDate: string;
  availableDates: string[];
  onDateSelect: (date: string) => void;
}

export const CalendarView = ({
  visible,
  onClose,
  selectedDate,
  availableDates,
  onDateSelect
}: CalendarViewProps) => {
  const theme = useTheme();
  
  // Initialize to selected date's month
  const [currentMonth, setCurrentMonth] = useState(() => {
    const date = parseISODate(selectedDate);
    console.log('Initializing calendar to:', date.getFullYear(), date.getMonth() + 1);
    return new Date(date.getFullYear(), date.getMonth(), 1);
  });
  
  // Update current month when selected date changes
  useEffect(() => {
    const date = parseISODate(selectedDate);
    console.log('Selected date changed to:', date.getFullYear(), date.getMonth() + 1);
    setCurrentMonth(new Date(date.getFullYear(), date.getMonth(), 1));
  }, [selectedDate]);
  
  // Debug log
  console.log('CalendarView received availableDates:', availableDates);

  const { daysInMonth, firstDayOfMonth, monthYearString } = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    
    // Get number of days in month
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    // Get first day of month (0 = Sunday, 1 = Monday, ..., 6 = Saturday)
    const firstDay = new Date(year, month, 1).getDay();
    
    // Generate month year string
    const monthYearString = currentMonth.toLocaleDateString('en', { 
      month: 'long', 
      year: 'numeric' 
    });

    return {
      daysInMonth,
      firstDayOfMonth: firstDay,
      monthYearString
    };
  }, [currentMonth]);

  const navigateMonth = (direction: 'next' | 'previous') => {
    setCurrentMonth(prev => {
      const newMonth = new Date(prev);
      if (direction === 'next') {
        newMonth.setMonth(newMonth.getMonth() + 1);
      } else {
        newMonth.setMonth(newMonth.getMonth() - 1);
      }
      return newMonth;
    });
  };

  const handleDatePress = (day: number) => {
    const selectedDateObj = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    const dateISO = formatDateToISO(selectedDateObj);
    onDateSelect(dateISO);
    onClose();
  };

  const renderCalendarDays = () => {
    const days = [];
    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    // Render week day headers
    weekDays.forEach((day) => {
      days.push(
        <View key={`day-header-${day}`} style={styles.dayHeader}>
          <Text style={[styles.dayHeaderText, { color: theme.colors.text.secondary }]}>
            {day}
          </Text>
        </View>
      );
    });

    // Empty cells for days before first day of month
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<View key={`empty-${i}`} style={styles.emptyDay} />);
    }

    // Render days of month
    for (let day = 1; day <= daysInMonth; day++) {
      const isSelected = selectedDate === formatDateToISO(
        new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
      );
      
      // Check if this date has any reading
      const dateISO = formatDateToISO(
        new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
      );
      const hasReading = availableDates && availableDates.includes(dateISO);
      
      const liturgicalColor = hasReading ? getLiturgicalColor(
        new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
      ) : '#CCCCCC';

      days.push(
        <TouchableOpacity
          key={`day-${day}`}
          style={[
            styles.dayCell,
            isSelected && styles.selectedDay,
            !hasReading && styles.noReadingDay
          ]}
          onPress={() => handleDatePress(day)}
          disabled={!hasReading}
          accessibilityLabel={`Select date ${day}`}
        >
          <Text style={[
            styles.dayText,
            isSelected && styles.selectedDayText,
            !hasReading && styles.noReadingDayText,
            hasReading && !isSelected && { color: theme.colors.text.primary }
          ]}>
            {day}
          </Text>
          {hasReading && !isSelected && (
            <View style={[styles.readingIndicator, { backgroundColor: liturgicalColor }]} />
          )}
          {isSelected && (
            <View style={[styles.selectedIndicator, { backgroundColor: liturgicalColor }]} />
          )}
        </TouchableOpacity>
      );
    }

    return days;
  };

  const styles = createStyles(theme);

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        {/* Background overlay */}
        <TouchableOpacity
          style={styles.overlay}
          onPress={onClose}
          activeOpacity={1}
        />
        
        {/* Calendar content */}
        <View style={styles.calendarContainer}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={[styles.title, { color: theme.colors.text.primary }]}>
              Select Date
            </Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={onClose}
              accessibilityLabel="Close calendar"
            >
              <Ionicons 
                name="close" 
                size={24} 
                color={theme.colors.text.secondary} 
              />
            </TouchableOpacity>
          </View>

          {/* Month navigation */}
          <View style={styles.monthNavigation}>
            <TouchableOpacity
              style={styles.navButton}
              onPress={() => navigateMonth('previous')}
              accessibilityLabel="Previous month"
            >
              <Ionicons 
                name="chevron-back" 
                size={24} 
                color={theme.colors.primary[500]} 
              />
            </TouchableOpacity>
            <Text style={[styles.monthTitle, { color: theme.colors.text.primary }]}>
              {monthYearString}
            </Text>
            <TouchableOpacity
              style={styles.navButton}
              onPress={() => navigateMonth('next')}
              accessibilityLabel="Next month"
            >
              <Ionicons 
                name="chevron-forward" 
                size={24} 
                color={theme.colors.primary[500]} 
              />
            </TouchableOpacity>
          </View>

          {/* Calendar grid */}
          <ScrollView style={styles.calendarGrid}>
            <View style={styles.calendarDays}>
              {renderCalendarDays()}
            </View>
          </ScrollView>

          {/* Legend */}
          <View style={styles.legend}>
            <Text style={[styles.legendTitle, { color: theme.colors.text.primary }]}>
              Legend:
            </Text>
            <View style={styles.legendItems}>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: theme.colors.primary[500] }]} />
                <Text style={[styles.legendText, { color: theme.colors.text.secondary }]}>
                  Has Reading
                </Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: '#CCCCCC' }]} />
                <Text style={[styles.legendText, { color: theme.colors.text.secondary }]}>
                  No Reading
                </Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { 
                  backgroundColor: theme.colors.primary[500],
                  borderWidth: 2,
                  borderColor: theme.colors.primary[700]
                }]} />
                <Text style={[styles.legendText, { color: theme.colors.text.secondary }]}>
                  Selected
                </Text>
              </View>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};

import type { Theme } from '../../styles/theme';

const createStyles = (theme: Theme & { userFontSize: string }) => StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  calendarContainer: {
    width: '100%',
    maxHeight: '80%',
    backgroundColor: theme.colors.background.primary,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingBottom: 30,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 20,
  },
  title: {
    fontSize: getScaledFontSize(theme.typography.fontSize.lg, theme.userFontSize),
    fontWeight: '600',
  },
  closeButton: {
    padding: 8,
  },
  monthNavigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
  },
  navButton: {
    padding: 8,
  },
  monthTitle: {
    fontSize: getScaledFontSize(theme.typography.fontSize.base, theme.userFontSize),
    fontWeight: '600',
  },
  calendarGrid: {
    flex: 1,
  },
  calendarDays: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayHeader: {
    width: '14.28%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
  },
  dayHeaderText: {
    fontSize: getScaledFontSize(theme.typography.fontSize.sm, theme.userFontSize),
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  dayCell: {
    width: '14.28%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 4,
  },
  dayText: {
    fontSize: getScaledFontSize(theme.typography.fontSize.base, theme.userFontSize),
    fontWeight: '500',
  },
  selectedDay: {
    backgroundColor: theme.colors.primary[500],
    borderRadius: 20,
  },
  selectedDayText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  noReadingDay: {
    opacity: 0.3,
  },
  noReadingDayText: {
    color: theme.colors.text.secondary,
  },
  readingIndicator: {
    position: 'absolute',
    bottom: 2,
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  selectedIndicator: {
    position: 'absolute',
    bottom: 2,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FFFFFF',
  },
  emptyDay: {
    width: '14.28%',
    aspectRatio: 1,
  },
  legend: {
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border.light,
  },
  legendTitle: {
    fontSize: getScaledFontSize(theme.typography.fontSize.sm, theme.userFontSize),
    fontWeight: '600',
    marginBottom: 10,
  },
  legendItems: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 15,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontSize: getScaledFontSize(theme.typography.fontSize.sm, theme.userFontSize),
  },
});
