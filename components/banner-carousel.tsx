import { Image } from 'expo-image';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

export type BannerCarouselItem = {
  id: string;
  imageUrl?: string;
  title?: string;
};

type LoopBannerItem = BannerCarouselItem & {
  renderKey: string;
};

type BannerCarouselProps = {
  data: BannerCarouselItem[];
};

const AUTO_PLAY_INTERVAL = 5000;
const ITEM_GAP = 12;

export function BannerCarousel({ data }: BannerCarouselProps) {
  const { width } = useWindowDimensions();
  const scrollRef = useRef<ScrollView>(null);
  const scrollX = useRef(new Animated.Value(0)).current;
  const virtualIndexRef = useRef(data.length > 1 ? 1 : 0);
  const [activeIndex, setActiveIndex] = useState(0);

  const itemWidth = Math.round(width * 0.74);
  const interval = itemWidth + ITEM_GAP;
  const sidePadding = Math.max((width - itemWidth) / 2, 0);

  const carouselData = useMemo<LoopBannerItem[]>(() => {
    if (data.length <= 1) {
      return data.map((item, index) => ({
        ...item,
        renderKey: `${item.id}-${index}`,
      }));
    }

    const first = data[0];
    const last = data[data.length - 1];

    return [
      { ...last, renderKey: `${last.id}-clone-last-${data.length - 1}` },
      ...data.map((item, index) => ({
        ...item,
        renderKey: `${item.id}-${index}`,
      })),
      { ...first, renderKey: `${first.id}-clone-first-0` },
    ];
  }, [data]);

  useEffect(() => {
    const startIndex = data.length > 1 ? 1 : 0;
    const startOffset = startIndex * interval;

    virtualIndexRef.current = startIndex;
    setActiveIndex(0);
    scrollX.setValue(startOffset);
    requestAnimationFrame(() => {
      scrollRef.current?.scrollTo({ animated: false, x: startOffset, y: 0 });
    });
  }, [data.length, interval, scrollX]);

  useEffect(() => {
    if (data.length <= 1) {
      return;
    }

    const timer = setInterval(() => {
      const nextIndex = virtualIndexRef.current + 1;

      virtualIndexRef.current = nextIndex;
      scrollRef.current?.scrollTo({ animated: true, x: nextIndex * interval, y: 0 });
    }, AUTO_PLAY_INTERVAL);

    return () => clearInterval(timer);
  }, [data.length, interval]);

  if (data.length === 0) {
    return null;
  }

  const handleScrollEnd = (offsetX: number) => {
    const rawIndex = Math.round(offsetX / interval);

    if (data.length <= 1) {
      setActiveIndex(0);
      virtualIndexRef.current = 0;
      return;
    }

    if (rawIndex === 0) {
      const targetIndex = data.length;

      setActiveIndex(data.length - 1);
      virtualIndexRef.current = targetIndex;
      requestAnimationFrame(() => {
        scrollRef.current?.scrollTo({ animated: false, x: targetIndex * interval, y: 0 });
      });
      return;
    }

    if (rawIndex === data.length + 1) {
      setActiveIndex(0);
      virtualIndexRef.current = 1;
      requestAnimationFrame(() => {
        scrollRef.current?.scrollTo({ animated: false, x: interval, y: 0 });
      });
      return;
    }

    setActiveIndex(rawIndex - 1);
    virtualIndexRef.current = rawIndex;
  };

  return (
    <View style={styles.container}>
      <Animated.ScrollView
        ref={scrollRef}
        contentContainerStyle={[styles.rail, { paddingHorizontal: sidePadding }]}
        decelerationRate="fast"
        horizontal
        onMomentumScrollEnd={(event) => handleScrollEnd(event.nativeEvent.contentOffset.x)}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
        showsHorizontalScrollIndicator={false}
        snapToInterval={interval}>
        {carouselData.map((item, index) => {
          const inputRange = [(index - 1) * interval, index * interval, (index + 1) * interval];
          const scale = scrollX.interpolate({
            extrapolate: 'clamp',
            inputRange,
            outputRange: [0.86, 1, 0.86],
          });
          const opacity = scrollX.interpolate({
            extrapolate: 'clamp',
            inputRange,
            outputRange: [0.68, 1, 0.68],
          });

          return (
            <Animated.View
              key={item.renderKey}
              style={[
                styles.slide,
                {
                  marginRight: ITEM_GAP,
                  opacity,
                  transform: [{ scale }],
                  width: itemWidth,
                },
              ]}>
              <ThemedView lightColor="#FFFFFF" darkColor="#202326" style={styles.card}>
                {item.imageUrl ? (
                  <Image contentFit="cover" source={{ uri: item.imageUrl }} style={styles.image} />
                ) : (
                  <ThemedView lightColor="#EEF2F6" darkColor="#2B3035" style={styles.placeholder}>
                    <ThemedText numberOfLines={1} style={styles.placeholderText}>
                      {item.title ?? 'Banner'}
                    </ThemedText>
                  </ThemedView>
                )}

                {item.title ? (
                  <View style={styles.badge}>
                    <ThemedText style={styles.badgeText}>{item.title}</ThemedText>
                  </View>
                ) : null}
              </ThemedView>
            </Animated.View>
          );
        })}
      </Animated.ScrollView>

      {data.length > 1 ? (
        <View style={styles.dots}>
          {data.map((item, index) => (
            <View
              key={`${item.id}-${index}-dot`}
              style={[styles.dot, index === activeIndex && styles.dotActive]}
            />
          ))}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    borderRadius: 999,
    bottom: 12,
    paddingHorizontal: 10,
    paddingVertical: 5,
    position: 'absolute',
    right: 12,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    lineHeight: 16,
  },
  card: {
    aspectRatio: 2.36,
    borderRadius: 8,
    elevation: 2,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { height: 4, width: 0 },
    shadowOpacity: 0.14,
    shadowRadius: 10,
  },
  container: {
    marginHorizontal: -24,
    paddingBottom:20,
  },
  dot: {
    backgroundColor: 'rgba(255, 255, 255, 0.55)',
    borderRadius: 999,
    height: 6,
    width: 6,
  },
  dotActive: {
    backgroundColor: '#FFFFFF',
    width: 18,
  },
  dots: {
    alignSelf: 'center',
    bottom: 34,
    flexDirection: 'row',
    gap: 6,
    position: 'absolute',
  },
  image: {
    height: '100%',
    width: '100%',
  },
  placeholder: {
    alignItems: 'center',
    height: '100%',
    justifyContent: 'center',
    width: '100%',
  },
  placeholderText: {
    color: '#6B7280',
    fontSize: 14,
    paddingHorizontal: 12,
    textAlign: 'center',
  },
  rail: {
    alignItems: 'center',
  },
  slide: {
    justifyContent: 'center',
    paddingVertical: 12,
  },
});
