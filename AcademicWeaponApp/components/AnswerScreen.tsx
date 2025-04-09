import React from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
// import { CameraCapturedPicture } from 'expo-camera'; // No longer needed

// CropDimensions type is no longer needed here
// export type CropDimensions = {
//     top: number;
//     left: number;
//     width: number;
//     height: number;
// };

interface AnswerScreenProps {
    // photo: CameraCapturedPicture; // Removed
    // cropDimensions: CropDimensions; // Removed
    croppedPhotoUri: string; // Expect the URI of the cropped image
    selectedSubject: string;
    onGoBack: () => void; // Function to go back to the camera view
}

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const AnswerScreen: React.FC<AnswerScreenProps> = ({
    // photo,
    // cropDimensions,
    croppedPhotoUri, // Use the URI prop
    selectedSubject,
    onGoBack,
}) => {
    // Use the passed cropped image URI directly
    // const imageUri = `data:image/jpg;base64,${photo.base64}`;

    return (
        <View style={styles.container}>
            {/* Display Cropped Image */}
            <Image source={{ uri: croppedPhotoUri }} style={styles.imagePreview} resizeMode="contain" />

            {/* Analysis Section */}
            <View style={styles.analysisContainer}>
                <Text style={styles.title}>Question Analysis</Text>
                <ScrollView style={styles.scrollView}>
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Transcription</Text>
                        <Text style={styles.contentText}>
                            [Placeholder] The transcribed text from the cropped image will appear here.
                        </Text>
                    </View>
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>AI Answer ({selectedSubject})</Text>
                        <Text style={styles.contentText}>
                            [Placeholder] The AI-generated answer based on the '{selectedSubject}' subject expert will be displayed here.
                        </Text>
                    </View>
                </ScrollView>
            </View>

            {/* Go Back Button (Trash Icon) */}
            <TouchableOpacity
                style={styles.backButton}
                onPress={onGoBack}
            >
                <Ionicons name="trash-outline" size={24} color="white" />
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'black',
    },
    imagePreview: {
        width: SCREEN_WIDTH,
        height: SCREEN_HEIGHT * 0.4, // Adjust height as needed
        backgroundColor: '#222', // Dark background while loading/if image fails
    },
    analysisContainer: {
        flex: 1,
        backgroundColor: '#1c1c1e',
        padding: 15,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        marginTop: -20,
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        color: 'white',
        marginBottom: 15,
        textAlign: 'center',
    },
    scrollView: {
        flex: 1,
    },
    section: {
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#cccccc',
        marginBottom: 8,
    },
    contentText: {
        fontSize: 15,
        color: 'white',
        lineHeight: 21,
    },
    backButton: {
        position: 'absolute',
        top: 50,
        right: 20,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        borderRadius: 22,
        padding: 10,
        justifyContent: 'center',
        alignItems: 'center',
        width: 44,
        height: 44,
    },
});

export default AnswerScreen; 