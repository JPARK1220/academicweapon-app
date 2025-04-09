import React from 'react';
import { View, StyleSheet, Dimensions, Text } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// // Define the dimensions and position of the crop area (Now passed as props)
// const CROP_AREA_WIDTH_PERCENT = 0.9;
// const CROP_AREA_HEIGHT_PERCENT = 0.3;
// const CROP_AREA_TOP_PERCENT = 0.20;
// const CROP_AREA_WIDTH = SCREEN_WIDTH * CROP_AREA_WIDTH_PERCENT;
// const CROP_AREA_HEIGHT = SCREEN_HEIGHT * CROP_AREA_HEIGHT_PERCENT;
// const CROP_AREA_TOP = SCREEN_HEIGHT * CROP_AREA_TOP_PERCENT;
// const CROP_AREA_LEFT = (SCREEN_WIDTH - CROP_AREA_WIDTH) / 2;

// Corner marker constants
const markerSize = 30;
const markerThickness = 4;
const markerColor = 'white'; // Match border color

// Define props interface
interface CropOutlineProps {
    label?: string;
    adjustable?: boolean;
    cropDimensions: { // Receive dimensions via props
        top: number;
        left: number;
        width: number;
        height: number;
    };
}

const CropOutline: React.FC<CropOutlineProps> = ({ label = "Take a picture of a question", adjustable = false, cropDimensions }) => {

    const { top, left, width, height } = cropDimensions;

    return (
        <View style={styles.container} pointerEvents="none">
            {/* Label above the crop area */}
            <Text style={[styles.label, { top: top - 40 }]}>{label}</Text>

            {/* Crop Area Border - Style directly using props */}
            <View style={[
                styles.cropBorderBase,
                {
                    top: top,
                    left: left,
                    width: width,
                    height: height,
                }
            ]} />

            {/* Conditional Corner Markers - Position based on props */}
            {adjustable && (
                <>
                    {/* Top Left */}
                    <View style={[styles.cornerMarkerBase, {
                        top: top - markerThickness / 2,
                        left: left - markerThickness / 2,
                        width: markerSize, height: markerSize, borderLeftWidth: markerThickness, borderTopWidth: markerThickness, borderColor: markerColor,
                        borderTopLeftRadius: styles.cropBorderBase.borderRadius, // Use radius from base style
                    }]} />
                    {/* Top Right */}
                    <View style={[styles.cornerMarkerBase, {
                        top: top - markerThickness / 2,
                        left: left + width - markerSize + markerThickness / 2,
                        width: markerSize, height: markerSize, borderRightWidth: markerThickness, borderTopWidth: markerThickness, borderColor: markerColor,
                        borderTopRightRadius: styles.cropBorderBase.borderRadius,
                    }]} />
                    {/* Bottom Left */}
                    <View style={[styles.cornerMarkerBase, {
                        top: top + height - markerSize + markerThickness / 2,
                        left: left - markerThickness / 2,
                        width: markerSize, height: markerSize, borderLeftWidth: markerThickness, borderBottomWidth: markerThickness, borderColor: markerColor,
                        borderBottomLeftRadius: styles.cropBorderBase.borderRadius,
                    }]} />
                    {/* Bottom Right */}
                    <View style={[styles.cornerMarkerBase, {
                        top: top + height - markerSize + markerThickness / 2,
                        left: left + width - markerSize + markerThickness / 2,
                        width: markerSize, height: markerSize, borderRightWidth: markerThickness, borderBottomWidth: markerThickness, borderColor: markerColor,
                        borderBottomRightRadius: styles.cropBorderBase.borderRadius,
                    }]} />
                </>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        // alignItems: 'center', // Label positioning is now absolute based on crop top
    },
    label: {
        position: 'absolute',
        left: 0, // Center label horizontally relative to screen
        right: 0,
        // top: CROP_AREA_TOP - 40, // Dynamic positioning based on prop
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
        textAlign: 'center',
    },
    cropBorderBase: { // Renamed from cropBorder for clarity
        position: 'absolute',
        borderWidth: 1,
        borderColor: 'white',
        borderRadius: 10,
    },
    // Styles for Corner Markers
    cornerMarkerBase: {
        position: 'absolute',
    },
    // Specific corner positioning styles removed, handled inline now
    // topLeftCorner: { ... },
    // topRightCorner: { ... },
    // bottomLeftCorner: { ... },
    // bottomRightCorner: { ... },
});

export default CropOutline;