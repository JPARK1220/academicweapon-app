import React, { useRef } from 'react';
import { View, Text, StyleSheet, FlatList, Dimensions } from 'react-native';
import Animated, {
    useAnimatedScrollHandler,
    useSharedValue,
    withSpring,
    useAnimatedStyle,
} from 'react-native-reanimated';
import MaskedView from '@react-native-masked-view/masked-view';
import { LinearGradient } from 'expo-linear-gradient';

const SUBJECTS = [
    { id: '1', name: 'HISTORY' },
    { id: '2', name: 'SCIENCE' },
    { id: '3', name: 'MATH' },
    { id: '4', name: 'ENGLISH' },
    { id: '5', name: 'SPANISH' },
    { id: '6', name: 'FRENCH' },
    { id: '7', name: 'CODING' },
];

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const ITEM_WIDTH = 100;
const ITEM_SPACING = 20;
const CONTENT_OFFSET = (SCREEN_WIDTH - ITEM_WIDTH - ITEM_SPACING) / 2;
const GRADIENT_WIDTH = 50; // Width of the fade on each side

interface SubjectItemProps {
    item: { id: string; name: string };
    index: number;
    activeIndex: Animated.SharedValue<number>;
}

// Separate component for the animated item
const SubjectItem: React.FC<SubjectItemProps> = ({ item, index, activeIndex }) => {
    const animatedStyle = useAnimatedStyle(() => {
        const isActive = activeIndex.value === index;
        return {
            opacity: withSpring(isActive ? 1 : 0.5),
            transform: [{ scale: withSpring(isActive ? 1 : 0.8) }],
        };
    });

    return (
        <Animated.View style={[styles.itemContainer, animatedStyle]}>
            <Text style={styles.itemText} numberOfLines={1}>{item.name}</Text>
        </Animated.View>
    );
};

interface SubjectSelectorProps {
    onSubjectChange: (subject: string) => void;
}

const SubjectSelector: React.FC<SubjectSelectorProps> = ({ onSubjectChange }) => {
    const flatListRef = useRef<FlatList>(null);
    const scrollX = useSharedValue(0);
    const activeIndex = useSharedValue(2);

    const scrollHandler = useAnimatedScrollHandler({
        onScroll: (event) => {
            scrollX.value = event.contentOffset.x;
            const potentialIndex = Math.round((event.contentOffset.x + ITEM_WIDTH / 2) / (ITEM_WIDTH + ITEM_SPACING));
            const maxIndex = SUBJECTS.length - 1;
            activeIndex.value = Math.max(0, Math.min(potentialIndex, maxIndex));
        },
    });

    const renderItem = ({ item, index }: { item: { id: string; name: string }, index: number }) => (
        <SubjectItem item={item} index={index} activeIndex={activeIndex} />
    );

    return (
        <View style={styles.container}>
            <MaskedView
                style={{ flex: 1 }}
                maskElement={
                    <LinearGradient
                        colors={['transparent', 'white', 'white', 'transparent']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        locations={[0, 0.1, 0.9, 1]}
                        style={{ flex: 1 }}
                    />
                }
            >
                <Animated.FlatList
                    ref={flatListRef}
                    data={SUBJECTS}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.id}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    snapToInterval={ITEM_WIDTH + ITEM_SPACING}
                    decelerationRate="fast"
                    contentContainerStyle={{
                        paddingHorizontal: CONTENT_OFFSET,
                    }}
                    onScroll={scrollHandler}
                    scrollEventThrottle={16}
                    initialScrollIndex={2}
                    getItemLayout={(data, index) => ({
                        length: ITEM_WIDTH + ITEM_SPACING,
                        offset: (ITEM_WIDTH + ITEM_SPACING) * index,
                        index,
                    })}
                />
            </MaskedView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        height: 50,
        marginBottom: 20,
    },
    itemContainer: {
        width: ITEM_WIDTH,
        height: 40,
        marginHorizontal: ITEM_SPACING / 2,
        justifyContent: 'center',
        alignItems: 'center',
    },
    itemText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
});

export default SubjectSelector;
