import React from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TouchableOpacity, 
  ScrollView 
} from 'react-native';
import { colors } from '@/constants/colors';
import { interests } from '@/mocks/interests';
import { 
  Music, 
  Dumbbell, 
  BookOpen, 
  Film, 
  Map, 
  Utensils, 
  Cpu, 
  Palette, 
  Gamepad2, 
  Activity, 
  Camera, 
  CookingPot 
} from 'lucide-react-native';

interface InterestSelectorProps {
  selectedInterests: string[];
  onSelectInterest: (id: string) => void;
  label?: string;
}

export const InterestSelector: React.FC<InterestSelectorProps> = ({
  selectedInterests,
  onSelectInterest,
  label,
}) => {
  const getIcon = (iconName: string) => {
    const iconProps = { size: 16, color: colors.text };
    
    switch (iconName) {
      case 'music':
        return <Music {...iconProps} />;
      case 'dumbbell':
        return <Dumbbell {...iconProps} />;
      case 'book-open':
        return <BookOpen {...iconProps} />;
      case 'film':
        return <Film {...iconProps} />;
      case 'map':
        return <Map {...iconProps} />;
      case 'utensils':
        return <Utensils {...iconProps} />;
      case 'cpu':
        return <Cpu {...iconProps} />;
      case 'palette':
        return <Palette {...iconProps} />;
      case 'gamepad-2':
        return <Gamepad2 {...iconProps} />;
      case 'activity':
        return <Activity {...iconProps} />;
      case 'camera':
        return <Camera {...iconProps} />;
      case 'cooking-pot':
        return <CookingPot {...iconProps} />;
      default:
        return null;
    }
  };
  
  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {interests.map((interest) => {
          const isSelected = selectedInterests.includes(interest.id);
          
          return (
            <TouchableOpacity
              key={interest.id}
              style={[
                styles.interestChip,
                isSelected && styles.selectedChip,
              ]}
              onPress={() => onSelectInterest(interest.id)}
              activeOpacity={0.7}
            >
              <View style={styles.iconContainer}>
                {getIcon(interest.icon)}
              </View>
              <Text
                style={[
                  styles.interestText,
                  isSelected && styles.selectedText,
                ]}
              >
                {interest.name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
    marginBottom: 8,
  },
  scrollContent: {
    paddingVertical: 4,
    paddingHorizontal: 4,
  },
  interestChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.borderLight,
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginRight: 8,
  },
  selectedChip: {
    backgroundColor: colors.primaryLight,
  },
  iconContainer: {
    marginRight: 6,
  },
  interestText: {
    fontSize: 14,
    color: colors.text,
  },
  selectedText: {
    color: colors.primary,
    fontWeight: '500',
  },
});

export default InterestSelector;