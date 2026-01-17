const SHOPIFY_STORE_DOMAIN = process.env.EXPO_PUBLIC_SHOPIFY_STORE_DOMAIN;
const STOREFRONT_ACCESS_TOKEN = process.env.EXPO_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN;

if (!SHOPIFY_STORE_DOMAIN || !STOREFRONT_ACCESS_TOKEN) {
    console.warn("Shopify credentials missing in .env");
}

export async function shopifyFetch(query: string, variables = {}) {
    try {
        const response = await fetch(`https://${SHOPIFY_STORE_DOMAIN}/api/2024-01/graphql.json`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-Shopify-Storefront-Access-Token": STOREFRONT_ACCESS_TOKEN!,
            },
            body: JSON.stringify({ query, variables }),
        });

        const json = await response.json();
        if (json.errors) {
            console.error("Shopify API Errors:", json.errors);
            throw new Error("Failed to fetch from Shopify API");
        }
        return json.data;
    } catch (error) {
        console.error("Shopify Network Error:", error);
        throw error;
    }
}

export async function getProducts(first = 10) {
    const query = `
    query getProducts($first: Int!) {
      products(first: $first) {
        edges {
          node {
            id
            title
            description
            images(first: 1) {
              edges {
                node {
                  url
                }
              }
            }
            priceRange {
              minVariantPrice {
                amount
                currencyCode
              }
            }
          }
        }
      }
    }
  `;
    const response = await shopifyFetch(query, { first });
    return response.products.edges.map((edge: any) => edge.node);
}
