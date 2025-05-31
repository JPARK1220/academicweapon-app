import { CameraView, CameraType, useCameraPermissions, CameraCapturedPicture } from 'expo-camera';
import { useState, useRef } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, Dimensions, Platform, ActivityIndicator } from 'react-native';
import * as ImageManipulator from 'expo-image-manipulator';
import PhotoPreviewSection, { CropDimensions } from '@/components/PhotoPreviewSection';
import SubjectSelector from '@/components/SubjectSelector';
import CropOutline from '@/components/CropOutline';
import AnswerScreen from '@/components/AnswerScreen';
import SettingsScreen from '@/components/SettingsScreen';
import { Ionicons } from '@expo/vector-icons';

// Get screen dimensions
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Initial crop area dimensions
const CROP_AREA_WIDTH_PERCENT = 0.9;
const CROP_AREA_HEIGHT_PERCENT = 0.3;
const CROP_AREA_TOP_PERCENT = 0.20;
const INITIAL_CROP_WIDTH = SCREEN_WIDTH * CROP_AREA_WIDTH_PERCENT;
const INITIAL_CROP_HEIGHT = SCREEN_HEIGHT * CROP_AREA_HEIGHT_PERCENT;
const INITIAL_CROP_TOP = SCREEN_HEIGHT * CROP_AREA_TOP_PERCENT;
const INITIAL_CROP_LEFT = (SCREEN_WIDTH - INITIAL_CROP_WIDTH) / 2;

// Define initial dimensions object
const initialCropDimensions: CropDimensions = {
    top: INITIAL_CROP_TOP,
    left: INITIAL_CROP_LEFT,
    width: INITIAL_CROP_WIDTH,
    height: INITIAL_CROP_HEIGHT,
};

// index.tsx is the 1st screen, and the 1st screen for this app is a camera
export default function App() {
    const [permission, requestPermission] = useCameraPermissions();
    const [photo, setPhoto] = useState<CameraCapturedPicture | null>(null);
    const [selectedSubject, setSelectedSubject] = useState('MATH');
    const [showSettings, setShowSettings] = useState(false);
    const cameraRef = useRef<CameraView | null>(null);

    // State for crop dimensions - lifted up
    const [cropDimensions, setCropDimensions] = useState<CropDimensions>(initialCropDimensions);
    // State to control showing the answer screen
    const [showAnswerScreen, setShowAnswerScreen] = useState(false);
    // State to prevent camera unmount during picture taking
    const [isTakingPicture, setIsTakingPicture] = useState(false);
    const [isProcessingCrop, setIsProcessingCrop] = useState(false);
    const [croppedPhotoUri, setCroppedPhotoUri] = useState<string | null>(null);

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
        // Prevent calling if already taking a picture or camera is not ready
        if (cameraRef.current && !isTakingPicture) {
            setIsTakingPicture(true);
            const options = {
                quality: 1,
                base64: false,
                exif: false,
            };
            try {
                const capturedPhoto = await cameraRef.current.takePictureAsync(options);
                if (capturedPhoto) {
                    setPhoto(capturedPhoto);
                    setShowAnswerScreen(false);
                    setCroppedPhotoUri(null);
                    setCropDimensions(initialCropDimensions);
                }
            } catch (error) {
                console.error('Failed to take photo:', error);
            } finally {
                setIsTakingPicture(false); // Reset flag
            }
        }
    };

    const handleGoBack = () => {
        setPhoto(null);
        setShowAnswerScreen(false);
        setCroppedPhotoUri(null);
        setCropDimensions(initialCropDimensions);
    };

    const handleSubjectChange = (subject: string) => {
        setSelectedSubject(subject);
    };

    const handleShowAnswer = async () => {
        if (!photo || isProcessingCrop) return;

        setIsProcessingCrop(true);

        try {
            // Original image dimensions
            const { uri, width: imageWidth, height: imageHeight } = photo;

            // Screen dimensions are already available: SCREEN_WIDTH, SCREEN_HEIGHT

            // --- Calculate Pixel Crop Region --- //
            // Assumes preview uses resizeMode: 'contain'

            // Calculate scale factor used by 'contain'
            const scaleX = SCREEN_WIDTH / imageWidth;
            const scaleY = SCREEN_HEIGHT / imageHeight;
            const scale = Math.min(scaleX, scaleY);

            // Calculate the size of the image as displayed on screen
            const displayedWidth = imageWidth * scale;
            const displayedHeight = imageHeight * scale;

            // Calculate the offset (margins) around the displayed image
            const offsetX = (SCREEN_WIDTH - displayedWidth) / 2;
            const offsetY = (SCREEN_HEIGHT - displayedHeight) / 2;

            // Translate screen crop box coordinates to coordinates relative to the displayed image
            // Ensure crop box stays within the displayed image bounds before scaling
            const relativeCropX = Math.max(0, cropDimensions.left - offsetX);
            const relativeCropY = Math.max(0, cropDimensions.top - offsetY);
            const relativeCropWidth = Math.min(displayedWidth - relativeCropX, cropDimensions.width);
            const relativeCropHeight = Math.min(displayedHeight - relativeCropY, cropDimensions.height);

            // Convert relative coordinates to original image pixel coordinates
            const originX = Math.round(relativeCropX / scale);
            const originY = Math.round(relativeCropY / scale);
            const cropWidthPixels = Math.round(relativeCropWidth / scale);
            const cropHeightPixels = Math.round(relativeCropHeight / scale);

            // Ensure pixel values are within the original image bounds
            const finalOriginX = Math.max(0, originX);
            const finalOriginY = Math.max(0, originY);
            const finalWidth = Math.min(imageWidth - finalOriginX, cropWidthPixels);
            const finalHeight = Math.min(imageHeight - finalOriginY, cropHeightPixels);

            // Check for valid crop dimensions
            if (finalWidth <= 0 || finalHeight <= 0) {
                console.error("Invalid crop dimensions calculated.", { finalOriginX, finalOriginY, finalWidth, finalHeight });
                // Optionally show an error to the user
                setIsProcessingCrop(false);
                return; // Stop processing
            }

            const cropRegion = {
                originX: finalOriginX,
                originY: finalOriginY,
                width: finalWidth,
                height: finalHeight,
            };

            console.log("Cropping with:", cropRegion); // Debug log

            // Perform the crop
            const result = await ImageManipulator.manipulateAsync(
                uri,
                [{ crop: cropRegion }],
                { compress: 1, format: ImageManipulator.SaveFormat.JPEG } // Use JPEG format
            );

            console.log("Cropped URI:", result.uri); // Debug log

            // Update state with the cropped image URI and navigate
            setCroppedPhotoUri(result.uri);
            setShowAnswerScreen(true);

        } catch (error) {
            console.error('Failed to crop image:', error);
            // Optionally show an error message to the user
        } finally {
            setIsProcessingCrop(false);
        }
    };

    // --- Render Logic ---

    if (showSettings) {
        return <SettingsScreen onClose={() => setShowSettings(false)} />;
    } else if (showAnswerScreen && croppedPhotoUri) {
        // Show Answer Screen with the CROPPED image URI
        return <AnswerScreen
            croppedPhotoUri={croppedPhotoUri}
            selectedSubject={selectedSubject}
            onGoBack={handleGoBack}
        />;
    } else if (photo && !isTakingPicture) {
        // Show Photo Preview Screen
        return (
            <View style={styles.container}>
                <PhotoPreviewSection
                    photo={photo}
                    selectedSubject={selectedSubject}
                    onSubjectChange={handleSubjectChange}
                    cropDimensions={cropDimensions}
                    onCropDimensionsChange={setCropDimensions}
                    onConfirmCrop={handleShowAnswer}
                    onRetake={handleGoBack}
                />
                {isProcessingCrop && (
                    <View style={styles.loadingOverlay}>
                        <ActivityIndicator size="large" color="white" />
                        <Text style={styles.loadingText}>Cropping...</Text>
                    </View>
                )}
            </View>
        );
    } else {
        // Show Camera View
        return (
            <View style={styles.container}>
                <CameraView style={styles.camera} ref={cameraRef} />
                {/* Settings Button */}
                <TouchableOpacity
                    style={styles.settingsButton}
                    onPress={() => setShowSettings(true)}
                >
                    <Ionicons name="settings-outline" size={24} color="white" />
                </TouchableOpacity>

                <CropOutline
                    label="Take a picture of a question"
                    cropDimensions={initialCropDimensions}
                    adjustable={false}
                />
                <View style={styles.buttonContainer}>
                    <SubjectSelector
                        onSubjectChange={handleSubjectChange}
                        initialSubjectName={selectedSubject}
                    />
                    <View style={styles.captureButtonContainer}>
                        <TouchableOpacity
                            style={styles.captureButton}
                            onPress={handleTakePhoto}
                            disabled={isTakingPicture}
                        >
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        backgroundColor: 'black',
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
    loadingOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10,
    },
    loadingText: {
        color: 'white',
        marginTop: 10,
        fontSize: 16,
    },
    buttonContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'transparent',
        justifyContent: 'flex-end',
        alignItems: 'center',
        paddingBottom: 50,
    },
    captureButtonContainer: {
        alignItems: 'center',
        marginTop: 0,
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
        alignSelf: 'center',
        marginTop: 20,
        paddingVertical: 10,
        paddingHorizontal: 20,
        backgroundColor: '#007AFF',
        borderRadius: 8,
    },
    text: {
        fontSize: 16,
        fontWeight: '600',
        color: 'white',
        textAlign: 'center',
    },
    settingsButton: {
        position: 'absolute',
        top: 50,
        right: 20,
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
        borderRadius: 20,
        padding: 8,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1,
    },
}); 