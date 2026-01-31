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

    const json = await response.json() as any;
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

export async function getProductById(id: string) {
  const query = `
    query getProductById($id: ID!) {
      product(id: $id) {
        id
        title
        descriptionHtml
        images(first: 5) {
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
        options {
          id
          name
          values
        }
        variants(first: 20) {
          edges {
            node {
              id
              title
              selectedOptions {
                 name
                 value
              }
              price {
                amount
                currencyCode
              }
              availableForSale
            }
          }
        }
      }
    }
  `;
  const response = await shopifyFetch(query, { id });
  return response.product;
}

export async function createCart(lines: any[] = []) {
  const query = `
    mutation createCart($lines: [CartLineInput!]) {
      cartCreate(input: { lines: $lines }) {
        cart {
          id
          checkoutUrl
          lines(first: 10) {
            edges {
              node {
                id
                quantity
                merchandise {
                  ... on ProductVariant {
                    id
                    title
                    price {
                      amount
                      currencyCode
                    }
                    product {
                      title
                      images(first: 1) {
                        edges {
                          node {
                            url
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
          cost {
            totalAmount {
              amount
              currencyCode
            }
          }
        }
      }
    }
  `;
  const response = await shopifyFetch(query, { lines });
  return response.cartCreate.cart;
}

export async function addToCart(cartId: string, lines: any[]) {
  const query = `
    mutation addToCart($cartId: ID!, $lines: [CartLineInput!]!) {
      cartLinesAdd(cartId: $cartId, lines: $lines) {
        cart {
          id
          lines(first: 10) {
            edges {
              node {
                id
                quantity
                merchandise {
                  ... on ProductVariant {
                    id
                    title
                    price {
                      amount
                      currencyCode
                    }
                    product {
                      title
                      images(first: 1) {
                        edges {
                          node {
                            url
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
          cost {
            totalAmount {
              amount
              currencyCode
            }
          }
        }
      }
    }
  `;
  const response = await shopifyFetch(query, { cartId, lines });
  return response.cartLinesAdd.cart;
}

export async function cartBuyerIdentityUpdate(cartId: string, customerAccessToken: string) {
  const query = `
    mutation cartBuyerIdentityUpdate($cartId: ID!, $buyerIdentity: CartBuyerIdentityInput!) {
      cartBuyerIdentityUpdate(cartId: $cartId, buyerIdentity: $buyerIdentity) {
        cart {
          id
          checkoutUrl
        }
        userErrors {
          field
          message
        }
      }
    }
  `;
  const response = await shopifyFetch(query, {
    cartId,
    buyerIdentity: { customerAccessToken }
  });
  return response.cartBuyerIdentityUpdate.cart;
}

export async function getCart(cartId: string) {
  const query = `
    query getCart($cartId: ID!) {
      cart(id: $cartId) {
        id
        checkoutUrl
        lines(first: 10) {
          edges {
            node {
              id
              quantity
              merchandise {
                ... on ProductVariant {
                  id
                  title
                  price {
                    amount
                    currencyCode
                  }
                  product {
                    title
                    images(first: 1) {
                      edges {
                        node {
                          url
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
        cost {
          totalAmount {
            amount
            currencyCode
          }
        }
      }
    }
  `;
  const response = await shopifyFetch(query, { cartId });
  return response.cart;
}

export async function getCollections(first = 10) {
  const query = `
    query getCollections($first: Int!) {
      collections(first: $first) {
        edges {
          node {
            id
            title
            image {
              url
            }
          }
        }
      }
    }
  `;
  const response = await shopifyFetch(query, { first });
  return response.collections.edges.map((edge: any) => edge.node);
}

export async function searchProducts(searchTerm: string) {
  const query = `
    query searchProducts($query: String!) {
      products(first: 10, query: $query) {
        edges {
          node {
            id
            title
            priceRange {
              minVariantPrice {
                amount
                currencyCode
              }
            }
            images(first: 1) {
              edges {
                node {
                  url
                }
              }
            }
          }
        }
      }
    }
  `;
  const response = await shopifyFetch(query, { query: searchTerm });
  return response.products.edges.map((edge: any) => edge.node);
}

export async function getCollectionProducts(collectionId: string) {
  const query = `
    query getCollectionProducts($id: ID!) {
      collection(id: $id) {
        id
        title
        products(first: 20) {
          edges {
            node {
              id
              title
              priceRange {
                minVariantPrice {
                  amount
                  currencyCode
                }
              }
              images(first: 1) {
                edges {
                  node {
                    url
                  }
                }
              }
            }
          }
        }
      }
    }
  `;
  const response = await shopifyFetch(query, { id: collectionId });
  return response.collection;
}

export async function customerAccessTokenCreate(email: string, password: string) {
  const query = `
    mutation customerAccessTokenCreate($input: CustomerAccessTokenCreateInput!) {
      customerAccessTokenCreate(input: $input) {
        customerAccessToken {
          accessToken
          expiresAt
        }
        customerUserErrors {
          code
          field
          message
        }
      }
    }
  `;
  const response = await shopifyFetch(query, { input: { email, password } });
  return response.customerAccessTokenCreate;
}

export async function customerCreate(email: string, password: string) {
  const query = `
    mutation customerCreate($input: CustomerCreateInput!) {
      customerCreate(input: $input) {
        customer {
          id
          email
        }
        customerUserErrors {
          code
          field
          message
        }
      }
    }
  `;
  const response = await shopifyFetch(query, { input: { email, password } });
  return response.customerCreate;
}

export async function customerRecover(email: string) {
  const query = `
    mutation customerRecover($email: String!) {
      customerRecover(email: $email) {
        customerUserErrors {
          code
          field
          message
        }
      }
    }
  `;
  const response = await shopifyFetch(query, { email });
  return response.customerRecover;
}



export async function getCustomer(accessToken: string) {
  const query = `
    query getCustomer($accessToken: String!) {
      customer(customerAccessToken: $accessToken) {
        id
        firstName
        lastName
        email
        phone
        defaultAddress {
          id
          formatted
          phone
        }
        addresses(first: 5) {
          edges {
            node {
              id
              formatted
              firstName
              lastName
              address1
              address2
              city
              province
              zip
              country
              phone
            }
          }
        }
        orders(first: 10) {
           edges {
             node {
               id
               orderNumber
               financialStatus
               totalPrice {
                 amount
                 currencyCode
               }
             }
           }
        }
      }
    }
  `;
  const response = await shopifyFetch(query, { accessToken });
  return response.customer;
}

export async function customerAddressCreate(accessToken: string, address: any) {
  const query = `
    mutation customerAddressCreate($customerAccessToken: String!, $address: MailingAddressInput!) {
      customerAddressCreate(customerAccessToken: $customerAccessToken, address: $address) {
        customerAddress {
          id
        }
        customerUserErrors {
          code
          field
          message
        }
      }
    }
  `;
  const response = await shopifyFetch(query, { customerAccessToken: accessToken, address });
  return response.customerAddressCreate;
}

export async function customerAddressUpdate(accessToken: string, id: string, address: any) {
  const query = `
    mutation customerAddressUpdate($customerAccessToken: String!, $id: ID!, $address: MailingAddressInput!) {
      customerAddressUpdate(customerAccessToken: $customerAccessToken, id: $id, address: $address) {
        customerAddress {
          id
        }
        customerUserErrors {
          code
          field
          message
        }
      }
    }
  `;
  const response = await shopifyFetch(query, { customerAccessToken: accessToken, id, address });
  return response.customerAddressUpdate;
}

export async function customerAddressDelete(accessToken: string, id: string) {
  const query = `
    mutation customerAddressDelete($id: ID!, $customerAccessToken: String!) {
      customerAddressDelete(id: $id, customerAccessToken: $customerAccessToken) {
        deletedCustomerAddressId
        customerUserErrors {
          code
          field
          message
        }
      }
    }
  `;
  const response = await shopifyFetch(query, { id, customerAccessToken: accessToken });
  return response.customerAddressDelete;
}

export async function getOrderById(id: string) {
  const query = `
    query getOrderById($id: ID!) {
      node(id: $id) {
        ... on Order {
          id
          orderNumber
          processedAt
          financialStatus
          fulfillmentStatus
          totalPrice {
            amount
            currencyCode
          }
          totalShippingPrice {
             amount
             currencyCode
          }
          totalTax {
             amount
             currencyCode
          }
          subtotalPrice {
             amount
             currencyCode
          }
          shippingAddress {
             formatted
          }
          lineItems(first: 20) {
            edges {
              node {
                title
                quantity
                originalTotalPrice {
                  amount
                  currencyCode
                }
                variant {
                  image {
                    url
                  }
                  title
                  product {
                    title
                  }
                }
              }
            }
          }
        }
      }
    }
  `;
  const response = await shopifyFetch(query, { id });
  return response.node;
}

export async function customerUpdate(accessToken: string, customer: any) {
  const query = `
    mutation customerUpdate($customerAccessToken: String!, $customer: CustomerUpdateInput!) {
      customerUpdate(customerAccessToken: $customerAccessToken, customer: $customer) {
        customer {
          id
          firstName
          lastName
          email
          phone
        }
        customerUserErrors {
          code
          field
          message
        }
      }
    }
  `;
  const response = await shopifyFetch(query, { customerAccessToken: accessToken, customer });
  return response.customerUpdate;
}
