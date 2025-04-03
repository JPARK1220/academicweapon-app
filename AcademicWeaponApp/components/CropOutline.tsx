import React from 'react';
import { View, StyleSheet, Dimensions, Text } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Define the dimensions and position of the crop area
const CROP_AREA_WIDTH_PERCENT = 0.9; // 90% of screen width
const CROP_AREA_HEIGHT_PERCENT = 0.3; // 35% of screen height (increased from 0.25)
const CROP_AREA_TOP_PERCENT = 0.20;   // Position 20% from the top (adjusted from 0.25)

const CROP_AREA_WIDTH = SCREEN_WIDTH * CROP_AREA_WIDTH_PERCENT;
const CROP_AREA_HEIGHT = SCREEN_HEIGHT * CROP_AREA_HEIGHT_PERCENT;
const CROP_AREA_TOP = SCREEN_HEIGHT * CROP_AREA_TOP_PERCENT;
const CROP_AREA_LEFT = (SCREEN_WIDTH - CROP_AREA_WIDTH) / 2;

const CropOutline = () => {
    return (
        <View style={styles.container} pointerEvents="none">
            {/* Label above the crop area */}


            {/* Crop Area Border */}
            <View style={styles.cropBorder} />
            <Text style={styles.label}>Take a picture of a question</Text>
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
        alignItems: 'center', // Center the label horizontally
    },
    label: {
        position: 'absolute',
        top: CROP_AREA_TOP - 40, // Position label above the crop area
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
        textAlign: 'center',
    },
    cropBorder: {
        position: 'absolute',
        top: CROP_AREA_TOP,
        left: CROP_AREA_LEFT,
        width: CROP_AREA_WIDTH,
        height: CROP_AREA_HEIGHT,
        borderWidth: 1,
        borderColor: 'white',
        borderRadius: 10, // Rounded corners like the reference
    },
});

export default CropOutline;