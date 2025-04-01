import { CameraView, CameraType, useCameraPermissions, CameraCapturedPicture } from 'expo-camera';
import { useState, useRef } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { AntDesign } from '@expo/vector-icons';
import PhotoPreviewSection from '@/components/PhotoPreviewSection';

// index.tsx is the 1st screen, and the 1st screen for this app is a camera
export default function CameraScreen() {
    const [facing, setFacing] = useState<CameraType>('back');
    const [permission, requestPermission] = useCameraPermissions();
    const [photo, setPhoto] = useState<CameraCapturedPicture | null>(null);
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
                    style={[styles.button, styles.permissionButton]}
                    onPress={requestPermission}
                >
                    <Text style={styles.text}>Grant Permission</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const toggleCameraFacing = () => {
        setFacing(current => (current === 'back' ? 'front' : 'back'));
    };

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

    if (photo) {
        return <PhotoPreviewSection photo={photo} handleRetakePhoto={handleRetakePhoto} />;
    }

    return (
        <View style={styles.container}>
            <CameraView style={styles.camera} facing={facing} ref={cameraRef}>
                <View style={styles.buttonContainer}>
                    <TouchableOpacity
                        style={styles.button}
                        onPress={toggleCameraFacing}
                    >
                        <AntDesign name="retweet" size={44} color="black" />
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.button}
                        onPress={handleTakePhoto}
                    >
                        <AntDesign name="camera" size={44} color="black" />
                    </TouchableOpacity>
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
        fontSize: 18,
    },
    camera: {
        flex: 1,
    },
    buttonContainer: {
        flex: 1,
        flexDirection: 'row',
        backgroundColor: 'transparent',
        margin: 64,
    },
    button: {
        flex: 1,
        alignSelf: 'flex-end',
        alignItems: 'center',
        marginHorizontal: 10,
        backgroundColor: 'gray',
        borderRadius: 10,
        padding: 10,
    },
    permissionButton: {
        marginHorizontal: 50,
        marginTop: 20,
    },
    text: {
        fontSize: 24,
        fontWeight: 'bold',
        color: 'white',
    },
}); 