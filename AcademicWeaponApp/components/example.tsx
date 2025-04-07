import { Fontisto } from '@expo/vector-icons';
import { CameraCapturedPicture } from 'expo-camera';
import React, { useState } from 'react';
import { TouchableOpacity, View, Image, StyleSheet, Text } from 'react-native';
import SubjectSelector from '@/components/SubjectSelector';
import CropOutline from '@/components/CropOutline';

const PhotoPreviewSection = ({
    photo,
    handleRetakePhoto,
    selectedSubject
}: {
    photo: CameraCapturedPicture;
    handleRetakePhoto: () => void;
    selectedSubject: string;
}) => {
    const [previewSubject, setPreviewSubject] = useState(selectedSubject);

    const handlePreviewSubjectChange = (subject: string) => {
        setPreviewSubject(subject);
    };

    return (
        <View style={styles.container}>
            <Image
                style={styles.previewImage}
                source={{ uri: 'data:image/jpg;base64,' + photo.base64 }}
            />
            <CropOutline />

            <TouchableOpacity style={styles.trashButton} onPress={handleRetakePhoto}>
                <Fontisto name='trash' size={28} color='white' />
            </TouchableOpacity>

            <View style={styles.buttonContainer}>
                <SubjectSelector
                    onSubjectChange={handlePreviewSubjectChange}
                    initialSubject={previewSubject}
                />
                <View style={styles.captureButtonContainer}>
                    <TouchableOpacity style={styles.captureButton}>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        backgroundColor: 'black',
    },
    previewImage: {
        flex: 1,
        resizeMode: 'cover',
    },
    trashButton: {
        position: 'absolute',
        top: 50,
        right: 20,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        borderRadius: 20,
        padding: 8,
    },
    buttonContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'transparent',
        justifyContent: 'flex-end',
        alignItems: 'center',
        marginBottom: 30,
    },
    captureButtonContainer: {
        marginBottom: 20,
        alignItems: 'center',
    },
    captureButton: {
        width: 80,
        height: 80,
        borderRadius: 40,
        borderWidth: 4,
        borderColor: 'white',
        backgroundColor: 'rgba(128, 128, 128, 0.5)',
    },
});

export default PhotoPreviewSection;