import { Link, Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import { Dimensions, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getProducts } from '../../api/shopify';

import { IconSymbol } from '@/components/ui/icon-symbol';
// Actually, let's stick to standard views to ensure compatibility if gradient isn't pre-installed, or use simple styling.

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProducts() {
      try {
        const data = await getProducts(10);
        setProducts(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
    loadProducts();
  }, []);

  const heroProduct = products[0];
  const gridProducts = products.slice(1);

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
            <Text style={styles.loading}>Loading Collection...</Text>
          ) : (
            <>
              {/* Hero Section */}
              {heroProduct && (
                <Link href={`/product/${encodeURIComponent(heroProduct.id)}`} asChild>
                  <TouchableOpacity style={styles.heroContainer}>
                    <Image
                      source={{ uri: heroProduct.images.edges[0]?.node.url }}
                      style={styles.heroImage}
                    />
                    <View style={styles.heroOverlay}>
                      <Text style={styles.heroTag}>NEW ARRIVAL</Text>
                      <Text style={styles.heroTitle} numberOfLines={2}>{heroProduct.title}</Text>
                      <Text style={styles.heroPrice}>
                        {heroProduct.priceRange.minVariantPrice.currencyCode} {heroProduct.priceRange.minVariantPrice.amount}
                      </Text>
                    </View>
                  </TouchableOpacity>
                </Link>
              )}

              <Text style={styles.sectionHeader}>TRENDING NOW</Text>

              {/* Product Grid */}
              <View style={styles.grid}>
                {gridProducts.map((product) => (
                  <Link key={product.id} href={`/product/${encodeURIComponent(product.id)}`} asChild>
                    <TouchableOpacity style={styles.card}>
                      <View style={styles.imageWrapper}>
                        <Image
                          source={{ uri: product.images.edges[0]?.node.url }}
                          style={styles.image}
                        />
                      </View>
                      <Text style={styles.productTitle} numberOfLines={1}>
                        {product.title}
                      </Text>
                      <Text style={styles.price}>
                        {product.priceRange.minVariantPrice.currencyCode} {product.priceRange.minVariantPrice.amount}
                      </Text>
                    </TouchableOpacity>
                  </Link>
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
    width: width,
    height: 450,
    marginBottom: 30,
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
    padding: 20,
    paddingBottom: 40,
    backgroundColor: 'rgba(0,0,0,0.3)', // Subtle gradient effect replacement
  },
  heroTag: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
    letterSpacing: 1.5,
    marginBottom: 8,
    opacity: 0.9,
  },
  heroTitle: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  heroPrice: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  // Grid
  sectionHeader: {
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 1,
    marginHorizontal: 20,
    marginBottom: 20,
    color: '#000',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 15,
    justifyContent: 'space-between',
  },
  card: {
    width: (width - 45) / 2, // 2 column with spacing
    marginBottom: 30,
  },
  imageWrapper: {
    backgroundColor: '#f6f6f6',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 12,
  },
  image: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  productTitle: {
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 6,
    color: '#000',
    letterSpacing: 0.5,
  },
  price: {
    fontSize: 13,
    color: '#666',
    fontWeight: '400',
  },
  emptyState: {
    padding: 20,
    alignItems: 'center',
  }
});
