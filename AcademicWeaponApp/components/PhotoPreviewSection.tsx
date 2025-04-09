import { Fontisto } from '@expo/vector-icons';
import { CameraCapturedPicture } from 'expo-camera';
import React, { useState, useRef } from 'react';
import { TouchableOpacity, View, Image, StyleSheet, Text, Dimensions, LayoutChangeEvent } from 'react-native';
import {
    PanGestureHandler,
    GestureHandlerRootView,
    State,
    PanGestureHandlerGestureEvent,
    HandlerStateChangeEvent,
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
type CropDimensions = {
    top: number;
    left: number;
    width: number;
    height: number;
};

// Define type for layout
type Layout = { x: number; y: number; width: number; height: number } | null;

const PhotoPreviewSection = ({
    photo,
    handleRetakePhoto,
    selectedSubject,
    onSubjectChange
}: {
    photo: CameraCapturedPicture;
    handleRetakePhoto: () => void;
    selectedSubject: string;
    onSubjectChange: (subject: string) => void;
}) => {
    // State for current crop dimensions
    const [cropDimensions, setCropDimensions] = useState<CropDimensions>({
        top: INITIAL_CROP_TOP,
        left: INITIAL_CROP_LEFT,
        width: INITIAL_CROP_WIDTH,
        height: INITIAL_CROP_HEIGHT,
    });

    // Refs to store dimensions at the start of the gesture
    const startDimensionsRef = useRef<CropDimensions>(cropDimensions);

    // State to store layout of other components
    const [trashLayout, setTrashLayout] = useState<Layout>(null);
    const [bottomContainerLayout, setBottomContainerLayout] = useState<Layout>(null);

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

        // 1. Calculate potential new positions
        let potentialTop = start.top;
        let potentialLeft = start.left;
        let fixedRight = start.left + start.width;
        let fixedBottom = start.top + start.height;

        if (corner === 'topLeft') {
            potentialTop = start.top + translationY;
            potentialLeft = start.left + translationX;
        } else if (corner === 'topRight') {
            potentialTop = start.top + translationY;
            potentialLeft = start.left; // Left is fixed
            fixedRight = start.left + start.width + translationX; // Right moves
        } else if (corner === 'bottomLeft') {
            potentialTop = start.top; // Top is fixed
            potentialLeft = start.left + translationX;
            fixedBottom = start.top + start.height + translationY; // Bottom moves
        } else if (corner === 'bottomRight') {
            potentialTop = start.top; // Top is fixed
            potentialLeft = start.left; // Left is fixed
            fixedRight = start.left + start.width + translationX; // Right moves
            fixedBottom = start.top + start.height + translationY; // Bottom moves
        }

        // 2. Apply position constraints
        let finalTop = potentialTop;
        let finalLeft = potentialLeft;

        // Screen bounds
        finalTop = Math.max(0, finalTop);
        finalLeft = Math.max(0, finalLeft);
        fixedRight = Math.min(SCREEN_WIDTH, fixedRight);
        fixedBottom = Math.min(SCREEN_HEIGHT, fixedBottom);

        // UI element constraints (apply to the edges being potentially moved)
        if (trashLayout) {
            if (corner === 'topLeft' || corner === 'topRight') {
                finalTop = Math.max(finalTop, trashLayout.y + trashLayout.height + PADDING);
            }
            if (corner === 'topRight' || corner === 'bottomRight') {
                fixedRight = Math.min(fixedRight, trashLayout.x - PADDING);
            }
        }
        if (bottomContainerLayout) {
            if (corner === 'bottomLeft' || corner === 'bottomRight') {
                fixedBottom = Math.min(fixedBottom, bottomContainerLayout.y - PADDING);
            }
        }

        // Ensure dragged corner doesn't cross the fixed one (minimum size precursor)
        if (corner === 'topLeft') {
            finalTop = Math.min(finalTop, fixedBottom - markerSize);
            finalLeft = Math.min(finalLeft, fixedRight - markerSize);
        }
        if (corner === 'topRight') {
            finalTop = Math.min(finalTop, fixedBottom - markerSize);
            fixedRight = Math.max(fixedRight, finalLeft + markerSize); // Adjust fixedRight based on constrained finalLeft
        }
        if (corner === 'bottomLeft') {
            fixedBottom = Math.max(fixedBottom, finalTop + markerSize); // Adjust fixedBottom based on constrained finalTop
            finalLeft = Math.min(finalLeft, fixedRight - markerSize);
        }
        if (corner === 'bottomRight') {
            fixedBottom = Math.max(fixedBottom, finalTop + markerSize);
            fixedRight = Math.max(fixedRight, finalLeft + markerSize);
        }


        // 3. Calculate final width and height based on constrained positions
        let finalWidth = fixedRight - finalLeft;
        let finalHeight = fixedBottom - finalTop;

        // 4. Apply minimum size constraint (redundant check, but safe)
        finalWidth = Math.max(markerSize, finalWidth);
        finalHeight = Math.max(markerSize, finalHeight);

        // Adjust position if minimum size constraint changed dimensions
        if (corner === 'topLeft' || corner === 'bottomLeft') {
            finalLeft = fixedRight - finalWidth;
        }
        if (corner === 'topLeft' || corner === 'topRight') {
            finalTop = fixedBottom - finalHeight;
        }

        // Update state
        setCropDimensions({
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
            // Store the dimensions when the gesture starts
            startDimensionsRef.current = { ...cropDimensions };
        }
        // No need to explicitly persist on ACTIVE/END as state is updated continuously
        // if (nativeEvent.oldState === State.ACTIVE) {
        // }
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
                source={{ uri: 'data:image/jpg;base64,' + photo.base64 }}
            />
            <CropOutline
                label="Crop the question"
                adjustable={true}
                cropDimensions={cropDimensions}
            />

            <PanGestureHandler
                onGestureEvent={onTopLeftGestureEvent}
                onHandlerStateChange={onTopLeftHandlerStateChange}
                hitSlop={{ top: markerHitSlop, left: markerHitSlop, bottom: markerHitSlop, right: markerHitSlop }}
            >
                <View style={[styles.cornerHandle, {
                    top: cropDimensions.top - markerHitSlop,
                    left: cropDimensions.left - markerHitSlop,
                    width: markerSize + markerHitSlop,
                    height: markerSize + markerHitSlop,
                }]} />
            </PanGestureHandler>

            <PanGestureHandler
                onGestureEvent={onTopRightGestureEvent}
                onHandlerStateChange={onTopRightHandlerStateChange}
                hitSlop={{ top: markerHitSlop, left: markerHitSlop, bottom: markerHitSlop, right: markerHitSlop }}
            >
                <View style={[styles.cornerHandle, {
                    top: cropDimensions.top - markerHitSlop,
                    left: cropDimensions.left + cropDimensions.width - markerSize,
                    width: markerSize + markerHitSlop,
                    height: markerSize + markerHitSlop,
                }]} />
            </PanGestureHandler>

            <PanGestureHandler
                onGestureEvent={onBottomLeftGestureEvent}
                onHandlerStateChange={onBottomLeftHandlerStateChange}
                hitSlop={{ top: markerHitSlop, left: markerHitSlop, bottom: markerHitSlop, right: markerHitSlop }}
            >
                <View style={[styles.cornerHandle, {
                    top: cropDimensions.top + cropDimensions.height - markerSize,
                    left: cropDimensions.left - markerHitSlop,
                    width: markerSize + markerHitSlop,
                    height: markerSize + markerHitSlop,
                }]} />
            </PanGestureHandler>

            <PanGestureHandler
                onGestureEvent={onBottomRightGestureEvent}
                onHandlerStateChange={onBottomRightHandlerStateChange}
                hitSlop={{ top: markerHitSlop, left: markerHitSlop, bottom: markerHitSlop, right: markerHitSlop }}
            >
                <View style={[styles.cornerHandle, {
                    top: cropDimensions.top + cropDimensions.height - markerSize,
                    left: cropDimensions.left + cropDimensions.width - markerSize,
                    width: markerSize + markerHitSlop,
                    height: markerSize + markerHitSlop,
                }]} />
            </PanGestureHandler>

            <TouchableOpacity
                style={styles.trashButton}
                onPress={handleRetakePhoto}
                onLayout={onTrashLayout}
            >
                <Fontisto name='trash' size={28} color='white' />
            </TouchableOpacity>

            <View
                style={styles.buttonContainer}
                onLayout={onBottomContainerLayout}
            >
                <SubjectSelector
                    onSubjectChange={onSubjectChange}
                    initialSubjectName={selectedSubject}
                />
                <View style={styles.captureButtonContainer}>
                    <TouchableOpacity style={styles.captureButton}>
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
    cornerHandle: {
        position: 'absolute',
    },
});

export default PhotoPreviewSection;