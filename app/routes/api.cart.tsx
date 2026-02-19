import { json, type ActionFunctionArgs, type LoaderFunctionArgs } from "@remix-run/cloudflare";
import { shopifyFetch } from "~/utils/shopify.server";

export async function action({ request, context }: ActionFunctionArgs) {
  const formData = await request.formData();
  const actionType = formData.get("action");
  const cartId = formData.get("cartId");
  const lines = formData.get("lines") ? JSON.parse(formData.get("lines") as string) : [];

  try {
    let result;

    switch (actionType) {
      case "create":
        const CREATE_MUTATION = `
          mutation cartCreate($lines: [CartLineInput!]) {
            cartCreate(input: { lines: $lines }) {
              cart {
                id
                checkoutUrl
                totalQuantity
                estimatedCost {
                  totalAmount {
                    amount
                    currencyCode
                  }
                }
                lines(first: 100) {
                  edges {
                    node {
                      id
                      quantity
                      merchandise {
                        ... on ProductVariant {
                          id
                          title
                          image {
                            url
                            altText
                          }
                          product {
                            title
                            handle
                          }
                          price {
                            amount
                            currencyCode
                          }
                        }
                      }
                    }
                  }
                }
              }
              userErrors {
                field
                message
              }
            }
          }
        `;
        result = await shopifyFetch({
          query: CREATE_MUTATION,
          variables: { lines },
          context,
        });
        return json(result.cartCreate);

      case "add":
        const ADD_MUTATION = `
          mutation cartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
            cartLinesAdd(cartId: $cartId, lines: $lines) {
              cart {
                id
                checkoutUrl
                totalQuantity
                estimatedCost {
                  totalAmount {
                    amount
                    currencyCode
                  }
                }
                lines(first: 100) {
                  edges {
                    node {
                      id
                      quantity
                      merchandise {
                        ... on ProductVariant {
                          id
                          title
                          image {
                            url
                            altText
                          }
                          product {
                            title
                            handle
                          }
                          price {
                            amount
                            currencyCode
                          }
                        }
                      }
                    }
                  }
                }
              }
              userErrors {
                field
                message
              }
            }
          }
        `;
        result = await shopifyFetch({
          query: ADD_MUTATION,
          variables: { cartId, lines },
          context,
        });
        return json(result.cartLinesAdd);

      case "update":
        const UPDATE_MUTATION = `
          mutation cartLinesUpdate($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
            cartLinesUpdate(cartId: $cartId, lines: $lines) {
              cart {
                id
                checkoutUrl
                totalQuantity
                estimatedCost {
                  totalAmount {
                    amount
                    currencyCode
                  }
                }
                lines(first: 100) {
                  edges {
                    node {
                      id
                      quantity
                      merchandise {
                        ... on ProductVariant {
                          id
                          title
                          image {
                            url
                            altText
                          }
                          product {
                            title
                            handle
                          }
                          price {
                            amount
                            currencyCode
                          }
                        }
                      }
                    }
                  }
                }
              }
              userErrors {
                field
                message
              }
            }
          }
        `;
        result = await shopifyFetch({
          query: UPDATE_MUTATION,
          variables: { cartId, lines },
          context,
        });
        return json(result.cartLinesUpdate);

      case "remove":
        const lineIds = formData.get("lineIds") ? JSON.parse(formData.get("lineIds") as string) : [];
        const REMOVE_MUTATION = `
          mutation cartLinesRemove($cartId: ID!, $lineIds: [ID!]!) {
            cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
              cart {
                id
                checkoutUrl
                totalQuantity
                estimatedCost {
                  totalAmount {
                    amount
                    currencyCode
                  }
                }
                lines(first: 100) {
                  edges {
                    node {
                      id
                      quantity
                      merchandise {
                        ... on ProductVariant {
                          id
                          title
                          image {
                            url
                            altText
                          }
                          product {
                            title
                            handle
                          }
                          price {
                            amount
                            currencyCode
                          }
                        }
                      }
                    }
                  }
                }
              }
              userErrors {
                field
                message
              }
            }
          }
        `;
        result = await shopifyFetch({
          query: REMOVE_MUTATION,
          variables: { cartId, lineIds },
          context,
        });
        return json(result.cartLinesRemove);

      default:
        return json({ error: "Invalid action" }, { status: 400 });
    }
  } catch (error) {
    console.error("Cart API Error:", error);
    return json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 });
  }
}

export async function loader({ request, context }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const cartId = url.searchParams.get("cartId");

  if (!cartId) {
    return json({ cart: null });
  }

  const QUERY = `
    query getCart($cartId: ID!) {
      cart(id: $cartId) {
        id
        checkoutUrl
        totalQuantity
        estimatedCost {
          totalAmount {
            amount
            currencyCode
          }
        }
        lines(first: 100) {
          edges {
            node {
              id
              quantity
              merchandise {
                ... on ProductVariant {
                  id
                  title
                  image {
                    url
                    altText
                  }
                  product {
                    title
                    handle
                  }
                  price {
                    amount
                    currencyCode
                  }
                }
              }
            }
          }
        }
      }
    }
  `;

  try {
    const result = await shopifyFetch({
      query: QUERY,
      variables: { cartId },
      context,
    });
    return json({ cart: result.cart });
  } catch (error) {
    console.error("Cart Loader Error:", error);
    return json({ error: error instanceof Error ? error.message : "Unknown error", cart: null }, { status: 500 });
  }
}
