const shopDomain = process.env.EXPO_PUBLIC_SHOPIFY_STORE_DOMAIN;
const adminToken = process.env.EXPO_PUBLIC_SHOPIFY_ADMIN_ACCESS_TOKEN;

const CREATE_DISCOUNT_MUTATION = `
mutation discountCodeBasicCreate($basicCodeDiscount: DiscountCodeBasicInput!) {
  discountCodeBasicCreate(basicCodeDiscount: $basicCodeDiscount) {
    codeDiscountNode {
      id
    }
    userErrors {
      field
      message
    }
  }
}
`;

/**
 * Sanitizes email to generate a clean, safe code prefix.
 * Example: "abc.def+123@gmail.com" -> "ABCDEF12" (uppercase, max 8 chars, alphanumeric)
 */
export function getSanitizedPrefix(email: string): string {
    if (!email) return 'GUEST';
    const prefix = email.split('@')[0].toUpperCase();
    const sanitized = prefix.replace(/[^A-Z0-9]/g, '');
    return sanitized.slice(0, 8) || 'USER';
}

/**
 * Dynamically creates 5 welcome coupons and 1 optional referral coupon on Shopify.
 */
export async function createDynamicCouponsForUser(email: string, hasReferral: boolean): Promise<{ success: boolean; errors: string[] }> {
    if (!shopDomain || !adminToken) {
        console.error("Missing Shopify Store Domain or Admin Access Token.");
        return { success: false, errors: ["Missing configuration configuration."] };
    }

    const prefix = getSanitizedPrefix(email);
    const codesToCreate: { code: string; amount: number; title: string; endsAt?: string }[] = [];
    const isPromoActive = new Date() < new Date('2026-07-16T00:00:00Z');

    // 1. Generate the 5 welcome coupons if promo is active
    if (isPromoActive) {
        for (let i = 1; i <= 5; i++) {
            codesToCreate.push({
                code: `POPU-${prefix}-${20}-${i}`,
                amount: 20,
                title: `App Welcome Coupon ${i}/5 - $20 Off`,
                endsAt: "2026-07-15T23:59:59Z"
            });
        }
    }

    // 2. Generate the referral coupon if signed up with code
    if (hasReferral) {
        codesToCreate.push({
            code: `POPU-${prefix}-REF-25`,
            amount: 25,
            title: `Referral Coupon Bonus - $25 Off`
        });
    }

    const errors: string[] = [];
    const url = `https://${shopDomain}/admin/api/2024-04/graphql.json`;

    // 3. Send requests in parallel to Shopify Admin API
    const promises = codesToCreate.map(async (item) => {
        const variables = {
            basicCodeDiscount: {
                title: item.title,
                code: item.code,
                startsAt: "2026-01-01T00:00:00Z",
                endsAt: item.endsAt || null,
                customerSelection: {
                    all: true
                },
                customerGets: {
                    value: {
                        discountAmount: {
                            amount: item.amount,
                            appliesOnEachItem: false
                        }
                    },
                    items: {
                        all: true
                    }
                },
                appliesOncePerCustomer: true
            }
        };

        try {
            const res = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Shopify-Access-Token': adminToken
                },
                body: JSON.stringify({
                    query: CREATE_DISCOUNT_MUTATION,
                    variables: variables
                })
            });

            const resJson = await res.json();
            const result = resJson?.data?.discountCodeBasicCreate;
            
            if (result?.userErrors && result.userErrors.length > 0) {
                result.userErrors.forEach((err: any) => {
                    // Ignore "code has already been taken" if they re-trigger signup or similar
                    if (err.message && !err.message.includes("taken")) {
                        errors.push(`${item.code}: ${err.message}`);
                    }
                });
            }
        } catch (e: any) {
            errors.push(`${item.code}: ${e.message || e}`);
        }
    });

    await Promise.all(promises);

    return {
        success: errors.length === 0,
        errors: errors
    };
}
