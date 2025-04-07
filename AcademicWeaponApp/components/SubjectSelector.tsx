import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Dimensions, NativeSyntheticEvent, NativeScrollEvent } from 'react-native';
import Animated, {
    useAnimatedScrollHandler,
    useSharedValue,
    withSpring,
    useAnimatedStyle,
    runOnJS,
} from 'react-native-reanimated';
import MaskedView from '@react-native-masked-view/masked-view';
import { LinearGradient } from 'expo-linear-gradient';

const SUBJECTS = [
    { id: '1', name: 'CODING' },
    { id: '2', name: 'HISTORY' },
    { id: '3', name: 'SCIENCE' },
    { id: '4', name: 'MATH' },
    { id: '5', name: 'ENGLISH' },
    { id: '6', name: 'SPANISH' },
    { id: '7', name: 'FRENCH' },
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
    initialSubjectName?: string;
}

const SubjectSelector: React.FC<SubjectSelectorProps> = ({ onSubjectChange, initialSubjectName }) => {
    const findInitialIndex = () => {
        if (initialSubjectName) {
            // console.log(initialSubjectName);
            const index = SUBJECTS.findIndex(subject => subject.name === initialSubjectName);
            if (index !== -1) {
                return index;
            }
        }
        return Math.floor(SUBJECTS.length / 2);
    };

    const initialIndex = findInitialIndex();

    const flatListRef = useRef<FlatList>(null);
    const scrollX = useSharedValue((ITEM_WIDTH + ITEM_SPACING) * initialIndex);
    const activeIndex = useSharedValue(initialIndex);
    const isScrolling = useSharedValue(false);

    // Function to call onSubjectChange on the JS thread
    const notifySubjectChange = (index: number) => {
        if (onSubjectChange && index >= 0 && index < SUBJECTS.length) {
            onSubjectChange(SUBJECTS[index].name);
        }
    };

    const scrollHandler = useAnimatedScrollHandler({
        onScroll: (event) => {
            scrollX.value = event.contentOffset.x;
            isScrolling.value = true;
            const potentialIndex = Math.round((event.contentOffset.x + (ITEM_WIDTH + ITEM_SPACING) / 2) / (ITEM_WIDTH + ITEM_SPACING));
            const maxIndex = SUBJECTS.length - 1;
            activeIndex.value = Math.max(0, Math.min(potentialIndex, maxIndex));
        },
        onBeginDrag: () => {
            isScrolling.value = true;
        },
        onEndDrag: (event) => {
            const finalIndex = Math.round(event.contentOffset.x / (ITEM_WIDTH + ITEM_SPACING));
            const clampedIndex = Math.max(0, Math.min(finalIndex, SUBJECTS.length - 1));
            activeIndex.value = clampedIndex;
            isScrolling.value = false;
            runOnJS(notifySubjectChange)(clampedIndex);
        },
        onMomentumEnd: (event) => {
            const finalIndex = Math.round(event.contentOffset.x / (ITEM_WIDTH + ITEM_SPACING));
            const clampedIndex = Math.max(0, Math.min(finalIndex, SUBJECTS.length - 1));
            activeIndex.value = clampedIndex;
            isScrolling.value = false;
            runOnJS(notifySubjectChange)(clampedIndex);
        }
    });

    // Initial call to onSubjectChange with the starting index
    useEffect(() => {
        notifySubjectChange(initialIndex);
    }, [initialIndex]);

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
                    initialScrollIndex={initialIndex}
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
