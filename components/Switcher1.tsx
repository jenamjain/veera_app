import React from 'react';
import { View, Pressable, Animated, StyleSheet, ToastAndroid } from 'react-native';

interface Switcher1Props {
  isChecked: boolean;
  onToggle: (value: boolean) => void;
}

const Switcher1 = ({ isChecked, onToggle }: Switcher1Props) => {
  const translateAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.timing(translateAnim, {
      toValue: isChecked ? 23 : 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [isChecked, translateAnim]);

  const handlePress = () => {
    onToggle(!isChecked);
    if(!isChecked) {
      ToastAndroid.show('Your location has been shared to all your emergency contacts and nearby police stations', ToastAndroid.LONG);
    }
  };

  const trackColor = isChecked ? '#10B981' : '#E5E7EB';

  return (
    <Pressable style={styles.container} onPress={handlePress}>
      <View style={[styles.track, { backgroundColor: trackColor }]} />
      <Animated.View style={[styles.thumb, { transform: [{ translateX: translateAnim }] }]} />
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    width: 56,
    height: 32,
  },
  track: {
    borderRadius: 16,
    height: 32,
    width: 56,
    flex: 1,
  },
  thumb: {
    position: 'absolute',
    backgroundColor: 'white',
    width: 28,
    height: 28,
    borderRadius: 14,
    top: 2,
    left: 2,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
});

export default Switcher1;