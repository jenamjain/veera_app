import { TouchableOpacity, Text } from 'react-native';

interface Props {
  title: string;
  onPress: () => void;
}

export default function Button({ title, onPress }: Props) {
  return (
    <TouchableOpacity
      
      onPress={onPress}
    >
      <Text>{title}</Text>
    </TouchableOpacity>
  );
}
