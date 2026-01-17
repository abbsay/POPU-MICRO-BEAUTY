import { Link } from 'expo-router';
import { useEffect, useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getProducts } from '../../api/shopify';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '../../constants/theme';

export default function HomeScreen() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProducts() {
      try {
        const data = await getProducts();
        setProducts(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
    loadProducts();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>POPU MICRO BEAUTY</Text>
          <Link href="/cart" asChild>
            <TouchableOpacity>
              <IconSymbol name="bag" size={24} color={Colors.light.text} />
            </TouchableOpacity>
          </Link>
        </View>
        {loading ? (
          <Text style={styles.loading}>Loading products...</Text>
        ) : (
          <View style={styles.grid}>
            {products.map((product) => (
              <Link key={product.id} href={`/product/${product.id}`} asChild>
                <TouchableOpacity style={styles.card}>
                  <Image
                    source={{ uri: product.images.edges[0]?.node.url }}
                    style={styles.image}
                  />
                  <Text style={styles.productTitle} numberOfLines={2}>
                    {product.title}
                  </Text>
                  <Text style={styles.price}>
                    {product.priceRange.minVariantPrice.currencyCode}{' '}
                    {product.priceRange.minVariantPrice.amount}
                  </Text>
                </TouchableOpacity>
              </Link>
            ))}
            {products.length === 0 && <Text>No products found. Check your API Token.</Text>}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  loading: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  card: {
    width: '48%',
    marginBottom: 16,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#eee',
  },
  image: {
    width: '100%',
    height: 150,
    borderRadius: 4,
    marginBottom: 8,
    resizeMode: 'cover',
  },
  productTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
    textAlign: 'center',
  },
  price: {
    fontSize: 14,
    color: '#333',
  },
});
