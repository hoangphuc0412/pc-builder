import { type Product } from "@shared/schema";

export interface WooCommerceConfig {
  baseURL: string;
  consumerKey: string;
  consumerSecret: string;
}

export interface WooCommerceProduct {
  id: number;
  name: string;
  slug: string;
  description: string;
  short_description: string;
  price: string;
  regular_price: string;
  sale_price: string;
  images: Array<{
    src: string;
    alt: string;
  }>;
  categories: Array<{
    id: number;
    name: string;
    slug: string;
  }>;
  meta_data: Array<{
    key: string;
    value: string;
  }>;
}

export interface WooCommerceOrder {
  id: number;
  status: string;
  total: string;
  line_items: Array<{
    product_id: number;
    quantity: number;
    name: string;
    price: number;
  }>;
  billing: {
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
  };
  meta_data: Array<{
    key: string;
    value: string;
  }>;
}

export class WooCommerceAPI {
  private config: WooCommerceConfig;
  private authHeader: string;

  constructor(config: WooCommerceConfig) {
    this.config = config;
    this.authHeader = Buffer.from(`${config.consumerKey}:${config.consumerSecret}`).toString('base64');
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const url = `${this.config.baseURL}/wp-json/wc/v3/${endpoint}`;
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'Authorization': `Basic ${this.authHeader}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`WooCommerce API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  // Get products by category
  async getProducts(categorySlug: string, filters: Record<string, any> = {}): Promise<WooCommerceProduct[]> {
    const params = new URLSearchParams({
      category: categorySlug,
      per_page: '50',
      status: 'publish',
      ...filters
    });

    return this.request(`products?${params}`);
  }

  // Get product by ID
  async getProduct(productId: number): Promise<WooCommerceProduct> {
    return this.request(`products/${productId}`);
  }

  // Create order with PC build configuration
  async createPCBuildOrder(
    products: Product[], 
    customerInfo: {
      first_name: string;
      last_name: string;
      email: string;
      phone: string;
      address_1?: string;
      city?: string;
      postcode?: string;
      country?: string;
    }
  ): Promise<WooCommerceOrder> {
    const orderData = {
      payment_method: 'bacs',
      payment_method_title: 'Chuyển khoản ngân hàng',
      set_paid: false,
      billing: customerInfo,
      shipping: customerInfo,
      line_items: products.map(product => ({
        product_id: product.id,
        quantity: 1,
        name: product.name,
        price: product.price
      })),
      meta_data: [
        {
          key: 'pc_build_configuration',
          value: JSON.stringify({
            components: products,
            total_price: products.reduce((sum, p) => sum + p.price, 0),
            build_date: new Date().toISOString(),
            builder_version: '1.0'
          })
        },
        {
          key: 'order_type',
          value: 'pc_build'
        }
      ]
    };

    return this.request('orders', {
      method: 'POST',
      body: JSON.stringify(orderData)
    });
  }

  // Get product categories
  async getCategories(): Promise<Array<{ id: number; name: string; slug: string }>> {
    return this.request('products/categories?per_page=100');
  }

  // Convert WooCommerce product to our Product schema
  static convertToProduct(wcProduct: WooCommerceProduct, category: string): Product {
    // Extract specs from meta_data
    const specsMetaData = wcProduct.meta_data.find(meta => meta.key === 'specs');
    const specs = specsMetaData ? JSON.parse(specsMetaData.value) : {};

    // Extract brand from meta_data or product name
    const brandMetaData = wcProduct.meta_data.find(meta => meta.key === 'brand');
    const brand = brandMetaData?.value || wcProduct.name.split(' ')[0];

    // Extract socket for CPU/Motherboard compatibility
    const socketMetaData = wcProduct.meta_data.find(meta => meta.key === 'socket');
    const socket = socketMetaData?.value;

    // Extract wattage for PSU
    const wattageMetaData = wcProduct.meta_data.find(meta => meta.key === 'wattage');
    const wattage = wattageMetaData ? parseInt(wattageMetaData.value) : undefined;

    return {
      id: wcProduct.id.toString(),
      name: wcProduct.name,
      description: wcProduct.short_description || wcProduct.description,
      price: parseFloat(wcProduct.regular_price || wcProduct.price || '0'),
      category: category as any,
      brand,
      image: wcProduct.images[0]?.src || '/placeholder-product.jpg',
      specs,
      socket: socket || null,
      wattage: wattage || null,
      inStock: true // WooCommerce products are typically in stock if published
    };
  }

  // Convert our Product to WooCommerce format
  static convertFromProduct(product: Product, categoryId: number): Partial<WooCommerceProduct> {
    return {
      name: product.name,
      description: product.description || undefined,
      regular_price: product.price.toString(),
      categories: [{ id: categoryId, name: '', slug: '' }],
      meta_data: [
        { key: 'brand', value: product.brand },
        { key: 'specs', value: JSON.stringify(product.specs) },
        ...(product.socket ? [{ key: 'socket', value: product.socket }] : []),
        ...(product.wattage ? [{ key: 'wattage', value: product.wattage.toString() }] : [])
      ]
    };
  }
}

// Category mapping between our system and WooCommerce
export const WOOCOMMERCE_CATEGORY_MAPPING = {
  'cpu': 'cpu',
  'vga': 'vga',
  'mainboard': 'mainboard', 
  'ram': 'ram',
  'psu': 'psu',
  'ssd': 'ssd',
  'hdd': 'hdd',
  'case': 'case',
  'fan': 'fan',
  'cpu-cooler': 'cpu-cooler',
  'monitor': 'monitor',
  'mouse': 'mouse',
  'keyboard': 'keyboard',
  'headphones': 'headphones'
};