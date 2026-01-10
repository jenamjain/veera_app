// pages/index.tsx
import { Text, View, TextInput, Button, TouchableOpacity, ToastAndroid } from "react-native";
import { useState } from "react";
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../types/navigation';
import { Ionicons } from '@expo/vector-icons'
export default function Home() {
    
    const [input, setInput] = useState('');
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    
    const handleProceed = () => {
        if (input.trim() === '') {
            ToastAndroid.show('Please enter your name', ToastAndroid.SHORT);
            return;
        }
        navigation.navigate('Main', { text: input });
    };
    
    return (
        <View style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flex: 1, padding: 20 }}>
            {/* App Name */}
            <View style={{ flexDirection: 'column', alignItems: 'center', gap: 10, marginTop: 40 }}>
                {/* App Logo + Name */}
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <Ionicons name="shield" size={24} color="#e96f6fff" />
                    <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#e96f6fff' }}>VEERA</Text>
                </View>
                
                {/* A quote */}
                <Text style={{ fontSize: 14, color: '#e68181ff' }}>Here to keep you safe and secure</Text>
            </View>
            {/* Input Field */}
            
            <View style={{ width: '100%', maxWidth: 400, display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'center' }}>
                <Text style={{ marginBottom: 8, fontSize: 16, color: '#ec6b6bff' }}>Hi , What's your good name?</Text>

                <TextInput
                    style={{ borderBottomWidth: 1, borderColor: '#ddd', padding: 12, borderRadius: 8, fontSize: 16, width: '100%' }}
                    placeholder="Enter your name..."
                    value={input}
                    onChangeText={setInput}
                />
                {/* Button to navigate ahead */}
                <View style={{ width: '100%', maxWidth: 400 }}>
                    <TouchableOpacity onPress={handleProceed} style={{ backgroundColor: '#e96f6fff', padding: 12, borderRadius: 8, alignItems: 'center' }}>
                        <Text style={{ color: 'white', fontSize: 16, fontWeight: 'bold' }}>Proceed</Text>
                    </TouchableOpacity>
                </View>
            </View>
            
            {/* Stored only on your device */}
            <View style={{ marginTop: 20 }}>
                <Text style={{ fontSize: 12, color: '#666', textAlign: 'center' }}>*Your name is stored only on your device</Text>
            </View>
        </View>
    );
}