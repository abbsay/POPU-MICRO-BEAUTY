import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Link, Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import { Dimensions, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getCollections, getProducts, searchProducts, getMainPromotionProducts } from '../../api/shopify';

import { ProductCard } from '@/components/ProductCard';
import { Skeleton } from '../../components/ui/Skeleton';

const { width } = Dimensions.get('window');

// Mock data for "Promo" - in a real app this could come from a specific collection or metafield
const PROMO_IMAGE = require('../../assets/images/adaptive-icon.png'); // Fallback or use a real URL if avaialble

export default function HomeScreen() {
  const [products, setProducts] = useState<any[]>([]);
  const [collections, setCollections] = useState<any[]>([]);
  const [heroItems, setHeroItems] = useState<any[]>([]); // Dedicated state for hero
  const [newArrivals, setNewArrivals] = useState<any[]>([]);
  const [bestSellers, setBestSellers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [productsData, collectionsDataRaw, hero1, hero2, newArrivalsData, bestSellersData] = await Promise.all([
          getProducts(20),
          getCollections(30),
          searchProducts('POPU CLOVER CARTRIDGE NEEDLES'),
          searchProducts('POPU DIVA'), // Using 'POPU DIVA' to be safe against typos/long names
          getMainPromotionProducts(4, "CREATED_AT", true),
          getMainPromotionProducts(4, "BEST_SELLING", false)
        ]);
        setProducts(productsData);

        const topCollectionTitles = [
          "PMU machine kit",
          "POPU PMU Machines",
          "POPU PMU Cartridges",
          "SMP Cartridges Needles",
          "Vernus Microneedle Cartridges",
          "Permanent Makeup Practice Skin",
          "Cups"
        ];
        
        const filteredCollections = topCollectionTitles
          .map(title => collectionsDataRaw.find((c: any) => c.title === title))
          .filter(Boolean);
          
        setCollections(filteredCollections.length > 0 ? filteredCollections : collectionsDataRaw.slice(0, 7));

        // Prepare hero items
        const h1 = hero1?.[0] || productsData[0];
        const h2 = hero2?.[0] || productsData[1];
        setHeroItems([h1, h2].filter(Boolean));
        setNewArrivals(newArrivalsData);
        setBestSellers(bestSellersData);
        
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const heroProduct = products[0];

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        <View style={styles.header}>
          <Text style={styles.brandTitle}>POPU</Text>
          <Link href="/design" asChild>
            <TouchableOpacity style={styles.cartBtn}>
              <MaterialCommunityIcons name="face-woman-shimmer" size={24} color="#000" />
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
                contentContainerStyle={{ width: width * 2 }} // Fixed 2 slides
              >
                {heroItems.map((product, index) => {
                  // Customize title/tag based on the product (index 0 is Clover, 1 is Diva)
                  const isClover = index === 0;
                  const customTitle = isClover ? "POPU PMU CARTRIDGES" : "POPU PMU MACHINES";
                  const customTag = isClover ? "PRECISION & SAFETY" : "INNOVATIVE DESIGN";

                  return (
                    <Link key={product.id + index} href={`/product/${encodeURIComponent(product.id)}?origin=home_hero`} asChild>
                      <TouchableOpacity activeOpacity={0.9} style={styles.heroSlide}>
                        {product.images?.edges?.[0]?.node?.url ? (
                          <Image
                            source={{ uri: product.images.edges[0].node.url }}
                            style={styles.heroImage}
                          />
                        ) : (
                          <View style={[styles.heroImage, { backgroundColor: '#ddd' }]} />
                        )}
                        <View style={styles.heroOverlay}>
                          <Text style={styles.heroTag}>{customTag}</Text>
                          <Text style={styles.heroTitle} numberOfLines={2}>
                            {customTitle}
                          </Text>
                          <View style={styles.shopNowBtn}>
                            <Text style={styles.shopNowText}>SHOP NOW</Text>
                          </View>
                        </View>
                      </TouchableOpacity>
                    </Link>
                  );
                })}
              </ScrollView>

              {/* Collections Scroll */}
              <View style={styles.collectionsSection}>
                <Text style={styles.sectionHeader}>Top Collections</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingLeft: 20 }}>
                  {collections.map((collection) => (
                    <Link key={collection.id} href={`/collection/${encodeURIComponent(collection.id)}`} asChild>
                      <TouchableOpacity style={styles.collectionCard}>
                        <View style={styles.collectionImageContainer}>
                          <Image source={{ uri: collection.image?.url }} style={styles.collectionImage} />
                        </View>
                        <Text numberOfLines={2} style={styles.collectionTitle}>{collection.title}</Text>
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
              {/* Promo Banner */}
              {/* Design Your Eyebrows Banner */}
              <Link href="/design" asChild>
                <TouchableOpacity style={styles.bannerContainer}>
                  <View style={styles.bannerContent}>
                    <MaterialCommunityIcons name="face-woman-shimmer" size={32} color="#fff" />
                    <View>
                      <Text style={styles.bannerTitle}>Design Your Eyebrows</Text>
                      <Text style={styles.bannerSubtitle}>Try it now!</Text>
                    </View>
                  </View>
                  <MaterialCommunityIcons name="arrow-right" size={24} color="#fff" />
                </TouchableOpacity>
              </Link>

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
    alignItems: 'center',
  },
  collectionImageContainer: {
    width: 140,
    height: 140,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#f0f0f0',
    marginBottom: 8,
  },
  collectionImage: {
    width: '100%',
    height: '100%',
  },
  collectionTitle: {
    color: '#333',
    fontWeight: '600',
    fontSize: 13,
    textAlign: 'center',
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
  // Home Banner (Copied from Shop)
  bannerContainer: {
    backgroundColor: '#000',
    marginHorizontal: 20,
    marginBottom: 40, // Consistent spacing
    padding: 20,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#E8A0BF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  bannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  bannerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  bannerSubtitle: {
    color: '#E8A0BF',
    fontSize: 14,
    marginTop: 2,
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
