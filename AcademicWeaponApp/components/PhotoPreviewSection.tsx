import { Ionicons } from '@expo/vector-icons';
import { CameraCapturedPicture } from 'expo-camera';
import React, { useRef, useState } from 'react';
import { TouchableOpacity, View, Image, StyleSheet, Text, Dimensions, LayoutChangeEvent } from 'react-native';
import {
    PanGestureHandler,
    GestureHandlerRootView,
    State,
    PanGestureHandlerGestureEvent,
    PanGestureHandlerStateChangeEvent
} from 'react-native-gesture-handler';
import SubjectSelector from '@/components/SubjectSelector';
import CropOutline from '@/components/CropOutline';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const CROP_AREA_WIDTH_PERCENT = 0.9;
const CROP_AREA_HEIGHT_PERCENT = 0.3;
const CROP_AREA_TOP_PERCENT = 0.20;
const INITIAL_CROP_WIDTH = SCREEN_WIDTH * CROP_AREA_WIDTH_PERCENT;
const INITIAL_CROP_HEIGHT = SCREEN_HEIGHT * CROP_AREA_HEIGHT_PERCENT;
const INITIAL_CROP_TOP = SCREEN_HEIGHT * CROP_AREA_TOP_PERCENT;
const INITIAL_CROP_LEFT = (SCREEN_WIDTH - INITIAL_CROP_WIDTH) / 2;

const markerSize = 30;
const markerHitSlop = 20;

// Define type for crop dimensions
export type CropDimensions = {
    top: number;
    left: number;
    width: number;
    height: number;
};

// Define type for layout
type Layout = { x: number; y: number; width: number; height: number } | null;

// Define the props for PhotoPreviewSection
interface PhotoPreviewSectionProps {
    photo: CameraCapturedPicture;
    selectedSubject: string;
    onSubjectChange: (subject: string) => void;
    cropDimensions: CropDimensions; // Receive state from parent
    onCropDimensionsChange: (dimensions: CropDimensions) => void; // Receive setter from parent
    onConfirmCrop: () => void; // Function to call when crop is confirmed (capture button)
    onRetake: () => void; // Function to call when retaking (trash button)
}

const PhotoPreviewSection: React.FC<PhotoPreviewSectionProps> = ({
    photo,
    selectedSubject,
    onSubjectChange,
    cropDimensions, // Use prop
    onCropDimensionsChange, // Use prop setter
    onConfirmCrop, // Use prop for confirm action
    onRetake, // Use prop for retake action
}) => {
    // Refs to store dimensions at the start of the gesture
    const startDimensionsRef = useRef<CropDimensions>(cropDimensions);

    // State to store layout of other components
    const [trashLayout, setTrashLayout] = React.useState<Layout>(null);
    const [bottomContainerLayout, setBottomContainerLayout] = React.useState<Layout>(null);

    const PADDING = 10; // Padding between crop area and other elements

    // onLayout handlers
    const onTrashLayout = (event: LayoutChangeEvent) => {
        setTrashLayout(event.nativeEvent.layout);
    };
    const onBottomContainerLayout = (event: LayoutChangeEvent) => {
        setBottomContainerLayout(event.nativeEvent.layout);
    };

    // Common gesture event handler logic
    const handleGestureEvent = (
        event: PanGestureHandlerGestureEvent,
        corner: 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight'
    ) => {
        const { translationX, translationY } = event.nativeEvent;
        const start = startDimensionsRef.current;

        let potentialTop = start.top;
        let potentialLeft = start.left;
        let fixedRight = start.left + start.width;
        let fixedBottom = start.top + start.height;

        // --- Calculate potential new positions based on corner ---
        if (corner === 'topLeft') {
            potentialTop = start.top + translationY;
            potentialLeft = start.left + translationX;
        } else if (corner === 'topRight') {
            potentialTop = start.top + translationY;
            // Left is fixed
            fixedRight = start.left + start.width + translationX; // Right moves
        } else if (corner === 'bottomLeft') {
            // Top is fixed
            potentialLeft = start.left + translationX;
            fixedBottom = start.top + start.height + translationY; // Bottom moves
        } else if (corner === 'bottomRight') {
            // Top is fixed
            // Left is fixed
            fixedRight = start.left + start.width + translationX; // Right moves
            fixedBottom = start.top + start.height + translationY; // Bottom moves
        }

        // --- Apply constraints ---
        let finalTop = potentialTop;
        let finalLeft = potentialLeft;

        // Screen bounds
        finalTop = Math.max(0, finalTop);
        finalLeft = Math.max(0, finalLeft);
        fixedRight = Math.min(SCREEN_WIDTH, fixedRight);
        fixedBottom = Math.min(SCREEN_HEIGHT, fixedBottom);

        // UI element constraints
        if (trashLayout) {
            if (corner === 'topLeft' || corner === 'topRight') {
                finalTop = Math.max(finalTop, trashLayout.y + trashLayout.height + PADDING);
            }
            // Adjust right boundary constraint if necessary (e.g., prevent overlap)
            // This might need refinement based on exact UI layout goals
            if (corner === 'topRight' || corner === 'bottomRight') {
                // Example: prevent right edge from overlapping trash button's left edge
                // fixedRight = Math.min(fixedRight, trashLayout.x - PADDING);
            }
        }
        if (bottomContainerLayout) {
            if (corner === 'bottomLeft' || corner === 'bottomRight') {
                fixedBottom = Math.min(fixedBottom, bottomContainerLayout.y - PADDING);
            }
        }

        // Ensure dragged corner doesn't cross the fixed one (minimum size precursor)
        let tempWidth = fixedRight - finalLeft;
        let tempHeight = fixedBottom - finalTop;

        if (tempWidth < markerSize) {
            if (corner === 'topLeft' || corner === 'bottomLeft') {
                finalLeft = fixedRight - markerSize; // Adjust left based on fixed right
            } else { // topRight or bottomRight
                fixedRight = finalLeft + markerSize; // Adjust right based on fixed left
            }
        }
        if (tempHeight < markerSize) {
            if (corner === 'topLeft' || corner === 'topRight') {
                finalTop = fixedBottom - markerSize; // Adjust top based on fixed bottom
            } else { // bottomLeft or bottomRight
                fixedBottom = finalTop + markerSize; // Adjust bottom based on fixed top
            }
        }


        // Calculate final width and height based on constrained positions
        let finalWidth = fixedRight - finalLeft;
        let finalHeight = fixedBottom - finalTop;

        // Update state using the passed setter
        onCropDimensionsChange({
            top: finalTop,
            left: finalLeft,
            width: finalWidth,
            height: finalHeight,
        });
    };

    // Common state change handler logic
    const handleHandlerStateChange = (
        { nativeEvent }: PanGestureHandlerStateChangeEvent,
        corner: 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight'
    ) => {
        if (nativeEvent.state === State.BEGAN) {
            // Store the dimensions from props when the gesture starts
            startDimensionsRef.current = { ...cropDimensions };
        }
        // No change needed for ACTIVE/END as state is updated continuously via prop setter
    };

    // Simplified handlers using common functions
    const onTopLeftGestureEvent = (e: PanGestureHandlerGestureEvent) => handleGestureEvent(e, 'topLeft');
    const onTopLeftHandlerStateChange = (e: PanGestureHandlerStateChangeEvent) => handleHandlerStateChange(e, 'topLeft');

    const onTopRightGestureEvent = (e: PanGestureHandlerGestureEvent) => handleGestureEvent(e, 'topRight');
    const onTopRightHandlerStateChange = (e: PanGestureHandlerStateChangeEvent) => handleHandlerStateChange(e, 'topRight');

    const onBottomLeftGestureEvent = (e: PanGestureHandlerGestureEvent) => handleGestureEvent(e, 'bottomLeft');
    const onBottomLeftHandlerStateChange = (e: PanGestureHandlerStateChangeEvent) => handleHandlerStateChange(e, 'bottomLeft');

    const onBottomRightGestureEvent = (e: PanGestureHandlerGestureEvent) => handleGestureEvent(e, 'bottomRight');
    const onBottomRightHandlerStateChange = (e: PanGestureHandlerStateChangeEvent) => handleHandlerStateChange(e, 'bottomRight');

    return (
        <GestureHandlerRootView style={styles.container}>
            <Image
                style={styles.previewImage}
                source={{ uri: photo.uri }}
            />
            <CropOutline
                label="Crop the question"
                adjustable={true}
                cropDimensions={cropDimensions} // Use prop
            />

            {/* Top Left Handle */}
            <PanGestureHandler
                onGestureEvent={onTopLeftGestureEvent}
                onHandlerStateChange={onTopLeftHandlerStateChange}
                hitSlop={{ top: markerHitSlop, left: markerHitSlop, bottom: markerHitSlop, right: markerHitSlop }}
            >
                <View style={[styles.cornerHandle, {
                    top: cropDimensions.top - markerHitSlop / 2, // Adjust based on desired visual hit area vs actual handle size
                    left: cropDimensions.left - markerHitSlop / 2,
                    width: markerSize + markerHitSlop,
                    height: markerSize + markerHitSlop,
                    // backgroundColor: 'rgba(255, 0, 0, 0.3)', // DEBUG: Visualize hit area
                }]} />
            </PanGestureHandler>

            {/* Top Right Handle */}
            <PanGestureHandler
                onGestureEvent={onTopRightGestureEvent}
                onHandlerStateChange={onTopRightHandlerStateChange}
                hitSlop={{ top: markerHitSlop, left: markerHitSlop, bottom: markerHitSlop, right: markerHitSlop }}
            >
                <View style={[styles.cornerHandle, {
                    top: cropDimensions.top - markerHitSlop / 2,
                    left: cropDimensions.left + cropDimensions.width - markerSize - markerHitSlop / 2, // Adjust left based on handle size and desired hit area
                    width: markerSize + markerHitSlop,
                    height: markerSize + markerHitSlop,
                    // backgroundColor: 'rgba(0, 255, 0, 0.3)', // DEBUG: Visualize hit area
                }]} />
            </PanGestureHandler>

            {/* Bottom Left Handle */}
            <PanGestureHandler
                onGestureEvent={onBottomLeftGestureEvent}
                onHandlerStateChange={onBottomLeftHandlerStateChange}
                hitSlop={{ top: markerHitSlop, left: markerHitSlop, bottom: markerHitSlop, right: markerHitSlop }}
            >
                <View style={[styles.cornerHandle, {
                    top: cropDimensions.top + cropDimensions.height - markerSize - markerHitSlop / 2, // Adjust top based on handle size
                    left: cropDimensions.left - markerHitSlop / 2,
                    width: markerSize + markerHitSlop,
                    height: markerSize + markerHitSlop,
                    // backgroundColor: 'rgba(0, 0, 255, 0.3)', // DEBUG: Visualize hit area
                }]} />
            </PanGestureHandler>

            {/* Bottom Right Handle */}
            <PanGestureHandler
                onGestureEvent={onBottomRightGestureEvent}
                onHandlerStateChange={onBottomRightHandlerStateChange}
                hitSlop={{ top: markerHitSlop, left: markerHitSlop, bottom: markerHitSlop, right: markerHitSlop }}
            >
                <View style={[styles.cornerHandle, {
                    top: cropDimensions.top + cropDimensions.height - markerSize - markerHitSlop / 2,
                    left: cropDimensions.left + cropDimensions.width - markerSize - markerHitSlop / 2,
                    width: markerSize + markerHitSlop,
                    height: markerSize + markerHitSlop,
                    // backgroundColor: 'rgba(255, 255, 0, 0.3)', // DEBUG: Visualize hit area
                }]} />
            </PanGestureHandler>

            {/* Trash Button - Use Ionicons */}
            <TouchableOpacity
                style={styles.trashButton}
                onPress={onRetake}
                onLayout={onTrashLayout}
            >
                <Ionicons name="trash-outline" size={28} color="white" />
            </TouchableOpacity>

            {/* Bottom Controls Container */}
            <View
                style={styles.buttonContainer}
                onLayout={onBottomContainerLayout}
            >
                <SubjectSelector
                    onSubjectChange={onSubjectChange}
                    initialSubjectName={selectedSubject}
                />
                {/* Capture/Confirm Button - Uses onConfirmCrop prop */}
                <View style={styles.captureButtonContainer}>
                    <TouchableOpacity
                        style={styles.captureButton}
                        onPress={onConfirmCrop} // Call the confirmation handler
                    >
                        {/* You might want to add an icon here later, like a checkmark */}
                    </TouchableOpacity>
                </View>
            </View>
        </GestureHandlerRootView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        backgroundColor: 'black',
    },
    previewImage: {
        ...StyleSheet.absoluteFillObject, // Fill container
        resizeMode: 'contain', // Contain ensures whole image is visible, adjust if needed
    },
    trashButton: {
        position: 'absolute',
        top: 50,
        right: 20,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        borderRadius: 25,
        padding: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    buttonContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'transparent',
        justifyContent: 'flex-end',
        alignItems: 'center',
        paddingBottom: 50, // Use padding for spacing from bottom edge
    },
    captureButtonContainer: {
        marginTop: 0, // Reduced from 20 to bring the button closer to the subject selector
        alignItems: 'center',
    },
    captureButton: {
        width: 80,
        height: 80,
        borderRadius: 40,
        borderWidth: 4,
        borderColor: 'white',
        backgroundColor: 'rgba(128, 128, 128, 0.5)', // Semi-transparent gray
        justifyContent: 'center', // Center potential future icon
        alignItems: 'center', // Center potential future icon
    },
    cornerHandle: {
        position: 'absolute',
        // Ensure handles are interactable but visually subtle if needed
        // backgroundColor: 'rgba(0, 255, 0, 0.3)', // Optional: for debugging touch areas
    },
});

export default PhotoPreviewSection;