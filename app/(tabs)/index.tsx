import { Link, Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import { Dimensions, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getCollections, getProducts } from '../../api/shopify';

import { ProductCard } from '@/components/ProductCard';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Skeleton } from '../../components/ui/Skeleton';

const { width } = Dimensions.get('window');

// Mock data for "Promo" - in a real app this could come from a specific collection or metafield
const PROMO_IMAGE = require('../../assets/images/adaptive-icon.png'); // Fallback or use a real URL if avaialble

export default function HomeScreen() {
  const [products, setProducts] = useState<any[]>([]);
  const [collections, setCollections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [productsData, collectionsData] = await Promise.all([
          getProducts(10),
          getCollections(5)
        ]);
        setProducts(productsData);
        setCollections(collectionsData);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const heroProduct = products[0];
  const newArrivals = products.slice(0, 4);
  const bestSellers = products.slice(4);

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        <View style={styles.header}>
          <Text style={styles.brandTitle}>POPU</Text>
          <Link href="/cart" asChild>
            <TouchableOpacity style={styles.cartBtn}>
              <IconSymbol name="bag" size={24} color="#000" />
            </TouchableOpacity>
          </Link>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {loading ? (
            <View style={{ paddingHorizontal: 20 }}>
              {/* Hero Skeleton */}
              <Skeleton width="100%" height={500} style={{ marginBottom: 40 }} />

              {/* Collections Skeleton */}
              <Skeleton width={200} height={24} style={{ marginBottom: 20, alignSelf: 'center' }} />
              <View style={{ flexDirection: 'row', marginBottom: 40 }}>
                {[1, 2, 3].map(i => (
                  <Skeleton key={i} width={140} height={140} style={{ marginRight: 15, borderRadius: 70 }} />
                ))}
              </View>

              {/* Grid Skeleton */}
              <Skeleton width={200} height={24} style={{ marginBottom: 20, alignSelf: 'center' }} />
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', flexWrap: 'wrap' }}>
                {[1, 2, 3, 4].map(i => (
                  <View key={i} style={{ width: Math.floor((width - 40 - 16) / 2), marginBottom: 40 }}>
                    <Skeleton width="100%" height={Math.floor((width - 40 - 16) / 2)} style={{ marginBottom: 12 }} />
                    <Skeleton width="80%" height={16} style={{ marginBottom: 6 }} />
                    <Skeleton width="40%" height={16} />
                  </View>
                ))}
              </View>
            </View>
          ) : (
            <>
              {/* Hero Section */}
              {/* Hero Section - Dual Carousel */}
              <ScrollView
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                style={styles.heroContainer}
                contentContainerStyle={{ width: width * 2 }} // 2 slides
              >
                {/* Slide 1: Bottle Bags */}
                <Link href={`/product/${encodeURIComponent('gid://shopify/Product/7726755643611')}`} asChild>
                  <TouchableOpacity activeOpacity={0.9} style={styles.heroSlide}>
                    <Image
                      source={require('../../assets/images/hero_bottle_bags.png')}
                      style={styles.heroImage}
                    />
                    <View style={styles.heroOverlay}>
                      <Text style={styles.heroTag}>ECO-FRIENDLY CHOICE</Text>
                      <Text style={styles.heroTitle}>Bottle Bags</Text>
                      <View style={styles.shopNowBtn}>
                        <Text style={styles.shopNowText}>SHOP NOW</Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                </Link>

                {/* Slide 2: Machine Bags */}
                <Link href={`/product/${encodeURIComponent('gid://shopify/Product/7726755676379')}`} asChild>
                  <TouchableOpacity activeOpacity={0.9} style={styles.heroSlide}>
                    <Image
                      source={require('../../assets/images/hero_machine_bags.png')}
                      style={styles.heroImage}
                    />
                    <View style={styles.heroOverlay}>
                      <Text style={styles.heroTag}>PREMIUM PROTECTION</Text>
                      <Text style={styles.heroTitle}>Machine Bags</Text>
                      <View style={styles.shopNowBtn}>
                        <Text style={styles.shopNowText}>SHOP NOW</Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                </Link>
              </ScrollView>

              {/* Collections Scroll */}
              <View style={styles.collectionsSection}>
                <Text style={styles.sectionHeader}>SHOP BY CATEGORY</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingLeft: 20 }}>
                  {collections.map((collection) => (
                    <Link key={collection.id} href={`/collection/${encodeURIComponent(collection.id)}`} asChild>
                      <TouchableOpacity style={styles.collectionCard}>
                        <Image source={{ uri: collection.image?.url }} style={styles.collectionImage} />
                        <View style={styles.collectionOverlay} />
                        <Text style={styles.collectionTitle}>{collection.title}</Text>
                      </TouchableOpacity>
                    </Link>
                  ))}
                </ScrollView>
              </View>

              <Text style={styles.sectionHeader}>NEW ARRIVALS</Text>
              <View style={styles.grid}>
                {newArrivals.map((product) => (
                  <ProductCard key={product.id} product={product} origin="home" />
                ))}
              </View>

              {/* Promo Banner */}
              <View style={styles.promoContainer}>
                <Image
                  source={{ uri: "https://images.unsplash.com/photo-1556228720-1957be982260?q=80&w=3270&auto=format&fit=crop" }} // Skincare Banner Placeholder
                  style={styles.promoImage}
                />
                <View style={styles.promoContent}>
                  <Text style={styles.promoTitle}>Radiance Boost</Text>
                  <Text style={styles.promoSubtitle}>Discover our new skincare line</Text>
                </View>
              </View>

              <Text style={styles.sectionHeader}>BEST SELLERS</Text>
              <View style={styles.grid}>
                {bestSellers.map((product) => (
                  <ProductCard key={product.id} product={product} origin="home" />
                ))}
              </View>

              {products.length === 0 && !loading && (
                <View style={styles.emptyState}>
                  <Text>No products found.</Text>
                </View>
              )}
            </>
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 10,
    backgroundColor: '#fff',
  },
  brandTitle: {
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: 2,
    fontFamily: 'System',
  },
  cartBtn: {
    padding: 8,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  loading: {
    textAlign: 'center',
    marginTop: 50,
    color: '#999',
  },
  // Hero
  heroContainer: {
    height: 550,
    marginBottom: 40,
  },
  heroSlide: {
    width: width,
    height: 550,
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  heroOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    top: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  heroTag: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
    letterSpacing: 2,
    marginBottom: 10,
    textTransform: 'uppercase',
  },
  heroTitle: {
    color: '#fff',
    fontSize: 42,
    fontWeight: '900',
    marginBottom: 20,
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
  },
  shopNowBtn: {
    backgroundColor: '#fff',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 2,
  },
  shopNowText: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 14,
    letterSpacing: 1,
  },
  // Collections
  collectionsSection: {
    marginBottom: 40,
  },
  collectionCard: {
    marginRight: 15,
    width: 140,
    height: 140,
    borderRadius: 70, // Circle
    overflow: 'hidden',
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
  },
  collectionImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  collectionOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  collectionTitle: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
    textAlign: 'center',
    zIndex: 1,
    paddingHorizontal: 5,
  },
  // Promo
  promoContainer: {
    height: 300,
    marginBottom: 40,
    position: 'relative',
  },
  promoImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  promoContent: {
    position: 'absolute',
    bottom: 40,
    left: 20,
  },
  promoTitle: {
    color: '#fff',
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  promoSubtitle: {
    color: '#fff',
    fontSize: 16,
    opacity: 0.9,
  },
  // Grid
  sectionHeader: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: 1,
    marginHorizontal: 20,
    marginBottom: 20,
    color: '#000',
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20, // Standardized padding to 20
    justifyContent: 'space-between',
  },
  emptyState: {
    padding: 20,
    alignItems: 'center',
  }
});
