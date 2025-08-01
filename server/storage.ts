import { type Product, type InsertProduct, type Build, type InsertBuild, type ComponentCategory } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Product operations
  getProducts(category?: ComponentCategory, filters?: {
    brand?: string[];
    socket?: string[];
    priceRange?: { min: number; max: number };
    search?: string;
  }): Promise<Product[]>;
  getProduct(id: string): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  
  // Build operations
  getBuild(id: string): Promise<Build | undefined>;
  createBuild(build: InsertBuild): Promise<Build>;
  updateBuild(id: string, build: Partial<InsertBuild>): Promise<Build | undefined>;
}

export class MemStorage implements IStorage {
  private products: Map<string, Product>;
  private builds: Map<string, Build>;

  constructor() {
    this.products = new Map();
    this.builds = new Map();
    this.seedData();
  }

  private seedData() {
    // CPU Products
    const cpuProducts: InsertProduct[] = [
      {
        name: "Chip xử lý CPU Intel Core Ultra 7 265KF (UP TO 5.5Ghz, 20 NHÂN 20 LUỒNG, 30MB CACHE, 125W)",
        category: "cpu",
        brand: "Intel",
        price: 7350000,
        image: "https://images.unsplash.com/photo-1555617981-dac3880eac6e?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=200",
        description: "CPU Intel thế hệ mới với hiệu năng vượt trội, 20 nhân 20 luồng, xung nhịp tối đa 5.5GHz",
        specs: { cores: "20", threads: "20", baseFreq: "3.8GHz", boostFreq: "5.5GHz", cache: "30MB", tdp: "125W" },
        socket: "lga1700",
        wattage: 125
      },
      {
        name: "Chip xử lý CPU Intel Core i7 14700K (UP TO 5.6Ghz, 20 NHÂN 28 LUỒNG, 33MB CACHE, 125W)",
        category: "cpu",
        brand: "Intel",
        price: 8490000,
        image: "https://images.unsplash.com/photo-1591488320449-011701bb6704?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=200",
        specs: { cores: "20", threads: "28", baseFreq: "3.4GHz", boostFreq: "5.6GHz", cache: "33MB", tdp: "125W" },
        socket: "lga1700",
        wattage: 125
      },
      {
        name: "Chip xử lý CPU Intel Core i5 13600K (UP TO 5.1Ghz, 14 NHÂN 20 LUỒNG, 24MB CACHE, 125W)",
        category: "cpu",
        brand: "Intel",
        price: 6450000,
        image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=200",
        specs: { cores: "14", threads: "20", baseFreq: "3.5GHz", boostFreq: "5.1GHz", cache: "24MB", tdp: "125W" },
        socket: "lga1700",
        wattage: 125
      },
      {
        name: "AMD Ryzen 7 7700X (UP TO 5.4Ghz, 8 NHÂN 16 LUỒNG, 32MB CACHE, 105W)",
        category: "cpu",
        brand: "AMD",
        price: 7890000,
        image: "https://images.unsplash.com/photo-1587202372775-e229f172b9d7?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=200",
        specs: { cores: "8", threads: "16", baseFreq: "4.5GHz", boostFreq: "5.4GHz", cache: "32MB", tdp: "105W" },
        socket: "am5",
        wattage: 105
      },
      {
        name: "Intel Core i9 14900K (UP TO 6.0Ghz, 24 NHÂN 32 LUỒNG, 36MB CACHE, 125W)",
        category: "cpu",
        brand: "Intel",
        price: 12990000,
        image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=200",
        specs: { cores: "24", threads: "32", baseFreq: "3.2GHz", boostFreq: "6.0GHz", cache: "36MB", tdp: "125W" },
        socket: "lga1700",
        wattage: 125
      },
      {
        name: "AMD Ryzen 9 7900X (UP TO 5.6Ghz, 12 NHÂN 24 LUỒNG, 64MB CACHE, 170W)",
        category: "cpu",
        brand: "AMD",
        price: 11450000,
        image: "https://images.unsplash.com/photo-1595617795501-9661aafda72a?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=200",
        specs: { cores: "12", threads: "24", baseFreq: "4.7GHz", boostFreq: "5.6GHz", cache: "64MB", tdp: "170W" },
        socket: "am5",
        wattage: 170
      }
    ];

    // VGA Products
    const vgaProducts: InsertProduct[] = [
      {
        name: "NVIDIA GeForce RTX 4070 (12GB GDDR6X, 2610MHz)",
        category: "vga",
        brand: "NVIDIA",
        price: 15900000,
        image: "https://images.unsplash.com/photo-1591488320449-011701bb6704?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=200",
        specs: { memory: "12GB GDDR6X", coreClock: "2610MHz", memoryBus: "192-bit", ports: "HDMI 2.1, DP 1.4a" },
        wattage: 200
      },
      {
        name: "AMD Radeon RX 7800 XT (16GB GDDR6, 2430MHz)",
        category: "vga",
        brand: "AMD",
        price: 13500000,
        image: "https://images.unsplash.com/photo-1591488320449-011701bb6704?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=200",
        specs: { memory: "16GB GDDR6", coreClock: "2430MHz", memoryBus: "256-bit", ports: "HDMI 2.1, DP 2.1" },
        wattage: 263
      }
    ];

    // Mainboard Products
    const mainboardProducts: InsertProduct[] = [
      {
        name: "ASUS ROG Strix Z690-E Gaming WiFi (LGA1700, DDR5, PCIe 5.0)",
        category: "mainboard",
        brand: "ASUS",
        price: 9500000,
        image: "https://images.unsplash.com/photo-1518717758536-85ae29035b6d?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=200",
        specs: { chipset: "Z690", memoryType: "DDR5", maxMemory: "128GB", slots: "4x DIMM", expansion: "PCIe 5.0" },
        socket: "lga1700",
        wattage: 50
      },
      {
        name: "MSI MAG B650 TOMAHAWK WiFi (AM5, DDR5, PCIe 5.0)",
        category: "mainboard",
        brand: "MSI",
        price: 6800000,
        image: "https://images.unsplash.com/photo-1518717758536-85ae29035b6d?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=200",
        specs: { chipset: "B650", memoryType: "DDR5", maxMemory: "128GB", slots: "4x DIMM", expansion: "PCIe 5.0" },
        socket: "am5",
        wattage: 45
      }
    ];

    // Add all seed products
    [...cpuProducts, ...vgaProducts, ...mainboardProducts].forEach(product => {
      this.createProduct(product);
    });
  }

  async getProducts(category?: ComponentCategory, filters?: {
    brand?: string[];
    socket?: string[];
    priceRange?: { min: number; max: number };
    search?: string;
  }): Promise<Product[]> {
    let products = Array.from(this.products.values());

    if (category) {
      products = products.filter(p => p.category === category);
    }

    if (filters?.brand?.length) {
      products = products.filter(p => filters.brand!.includes(p.brand));
    }

    if (filters?.socket?.length) {
      products = products.filter(p => p.socket && filters.socket!.includes(p.socket));
    }

    if (filters?.priceRange) {
      products = products.filter(p => 
        p.price >= filters.priceRange!.min && p.price <= filters.priceRange!.max
      );
    }

    if (filters?.search) {
      const searchLower = filters.search.toLowerCase();
      products = products.filter(p => 
        p.name.toLowerCase().includes(searchLower) ||
        p.brand.toLowerCase().includes(searchLower)
      );
    }

    return products;
  }

  async getProduct(id: string): Promise<Product | undefined> {
    return this.products.get(id);
  }

  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    const id = randomUUID();
    const product: Product = { ...insertProduct, id };
    this.products.set(id, product);
    return product;
  }

  async getBuild(id: string): Promise<Build | undefined> {
    return this.builds.get(id);
  }

  async createBuild(insertBuild: InsertBuild): Promise<Build> {
    const id = randomUUID();
    const build: Build = { 
      ...insertBuild, 
      id, 
      createdAt: new Date().toISOString() 
    };
    this.builds.set(id, build);
    return build;
  }

  async updateBuild(id: string, updateData: Partial<InsertBuild>): Promise<Build | undefined> {
    const build = this.builds.get(id);
    if (!build) return undefined;

    const updatedBuild: Build = { ...build, ...updateData };
    this.builds.set(id, updatedBuild);
    return updatedBuild;
  }

  async saveProduct(product: Product): Promise<Product> {
    this.products.set(product.id, product);
    return product;
  }
}

export const storage = new MemStorage();
