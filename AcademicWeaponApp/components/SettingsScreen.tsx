import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as WebBrowser from 'expo-web-browser';

interface SettingsScreenProps {
    onClose: () => void;
}

const SettingsScreen: React.FC<SettingsScreenProps> = ({ onClose }) => {
    // Function to handle link opening
    const handleLinkPress = (url: string) => {
        WebBrowser.openBrowserAsync(url);
    };

    return (
        <View style={styles.container}>
            {/* Header with back button */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={onClose}
                >
                    <Ionicons name="close-outline" size={28} color="white" />
                </TouchableOpacity>
                <Text style={styles.title}>Settings</Text>
            </View>

            {/* Settings content */}
            <View style={styles.content}>
                {/* Terms of Use */}
                <TouchableOpacity style={styles.settingsItem} onPress={() => handleLinkPress('https://docs.google.com/document/d/e/2PACX-1vSVTacfTVOT_mi7pNG6LyF2JWa_VSX92A3_bp4T3bP123ieza_grxAoYbCFHZ6hDj4XJpq12PXwkEFn/pub')}>
                    <Ionicons name="document-text-outline" size={24} color="white" style={styles.icon} />
                    <Text style={styles.settingsText}>Terms of Use</Text>
                    <Ionicons name="chevron-forward-outline" size={24} color="white" />
                </TouchableOpacity>

                {/* Privacy Policy */}
                <TouchableOpacity style={styles.settingsItem} onPress={() => handleLinkPress('https://docs.google.com/document/d/e/2PACX-1vSRkqw0_wXIvTxhV01_f7_IiYl8WjCrlKAxPRg-Cg9R3qaGf8Ns_-40JCtKPSKnNEN0MQhLFn9PPRUe/pub')}>
                    <Ionicons name="shield-checkmark-outline" size={24} color="white" style={styles.icon} />
                    <Text style={styles.settingsText}>Privacy Policy</Text>
                    <Ionicons name="chevron-forward-outline" size={24} color="white" />
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'black',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingTop: 50,
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    backButton: {
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        borderRadius: 25,
        padding: 10,
        marginRight: 15,
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        color: 'white',
        flex: 1,
        textAlign: 'center',
        marginLeft: -40,
    },
    content: {
        flex: 1,
        paddingHorizontal: 20,
        paddingTop: 20,
    },
    settingsItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#333',
    },
    icon: {
        marginRight: 15,
    },
    settingsText: {
        flex: 1,
        color: 'white',
        fontSize: 16,
    },
});

export default SettingsScreen; 