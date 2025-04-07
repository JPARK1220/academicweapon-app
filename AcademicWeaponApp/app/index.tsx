import { CameraView, CameraType, useCameraPermissions, CameraCapturedPicture } from 'expo-camera';
import { useState, useRef } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import PhotoPreviewSection from '@/components/PhotoPreviewSection';
import SubjectSelector from '@/components/SubjectSelector';
import CropOutline from '@/components/CropOutline';

// index.tsx is the 1st screen, and the 1st screen for this app is a camera
export default function CameraScreen() {
    const [permission, requestPermission] = useCameraPermissions();
    const [photo, setPhoto] = useState<CameraCapturedPicture | null>(null);
    const [selectedSubject, setSelectedSubject] = useState('MATH');
    const cameraRef = useRef<CameraView | null>(null);

    if (!permission) {
        // Camera permissions are still loading.
        return <View />;
    }

    if (!permission.granted) {
        // Camera permissions are not granted yet.
        return (
            <View style={styles.container}>
                <Text style={styles.message}>We need your permission to show the camera</Text>
                <TouchableOpacity
                    style={styles.permissionButton}
                    onPress={requestPermission}
                >
                    <Text style={styles.text}>Grant Permission</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const handleTakePhoto = async () => {
        if (cameraRef.current) {
            const options = {
                quality: 1,
                base64: true,
                exif: false,
            };
            try {
                const capturedPhoto = await cameraRef.current.takePictureAsync(options);
                if (capturedPhoto) {
                    setPhoto(capturedPhoto);
                }
            } catch (error) {
                console.error('Failed to take photo:', error);
            }
        }
    };

    const handleRetakePhoto = () => {
        setPhoto(null);
    };

    const handleSubjectChange = (subject: string) => {
        setSelectedSubject(subject);
    };

    if (photo) {
        return <PhotoPreviewSection
            photo={photo}
            handleRetakePhoto={handleRetakePhoto}
            selectedSubject={selectedSubject}
            onSubjectChange={handleSubjectChange}
        />;
    }

    return (
        <View style={styles.container}>
            <CameraView style={styles.camera} ref={cameraRef}>
                <CropOutline />
                <View style={styles.buttonContainer}>
                    <SubjectSelector
                        onSubjectChange={handleSubjectChange}
                        initialSubjectName={selectedSubject}
                    />
                    <View style={styles.captureButtonContainer}>
                        <TouchableOpacity
                            style={styles.captureButton}
                            onPress={handleTakePhoto}
                        >
                        </TouchableOpacity>
                    </View>
                </View>
            </CameraView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
    },
    message: {
        textAlign: 'center',
        paddingBottom: 10,
        fontSize: 16,
        fontWeight: '600',
        color: 'white',
    },
    camera: {
        flex: 1,
    },
    buttonContainer: {
        flex: 1,
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
        backgroundColor: 'transparent',
    },
    permissionButton: {
        marginHorizontal: 50,
        marginTop: 20,
    },
    text: {
        fontSize: 16,
        fontWeight: '600',
        color: 'white',
    },
}); 