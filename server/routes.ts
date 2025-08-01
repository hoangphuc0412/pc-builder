import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { insertBuildSchema, type ComponentCategory } from "@shared/schema";
import { WooCommerceAPI, type WooCommerceConfig } from "./woocommerce";

// Initialize WooCommerce API if credentials are provided
let wooCommerceAPI: WooCommerceAPI | null = null;

if (process.env.WOOCOMMERCE_URL && process.env.WOOCOMMERCE_CONSUMER_KEY && process.env.WOOCOMMERCE_CONSUMER_SECRET) {
  const wooConfig: WooCommerceConfig = {
    baseURL: process.env.WOOCOMMERCE_URL,
    consumerKey: process.env.WOOCOMMERCE_CONSUMER_KEY,
    consumerSecret: process.env.WOOCOMMERCE_CONSUMER_SECRET
  };
  wooCommerceAPI = new WooCommerceAPI(wooConfig);
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Get products with optional filters
  app.get("/api/products", async (req, res) => {
    try {
      const category = req.query.category as ComponentCategory | undefined;
      const brand = req.query.brand ? String(req.query.brand).split(',') : undefined;
      const socket = req.query.socket ? String(req.query.socket).split(',') : undefined;
      const search = req.query.search as string | undefined;
      
      let priceRange;
      if (req.query.minPrice || req.query.maxPrice) {
        priceRange = {
          min: req.query.minPrice ? parseInt(String(req.query.minPrice)) : 0,
          max: req.query.maxPrice ? parseInt(String(req.query.maxPrice)) : Number.MAX_SAFE_INTEGER
        };
      }

      const products = await storage.getProducts(category, {
        brand,
        socket,
        priceRange,
        search
      });

      res.json(products);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch products" });
    }
  });

  // Get single product
  app.get("/api/products/:id", async (req, res) => {
    try {
      const product = await storage.getProduct(req.params.id);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      res.json(product);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch product" });
    }
  });

  // Save build configuration
  app.post("/api/builds", async (req, res) => {
    try {
      const buildData = insertBuildSchema.parse(req.body);
      const build = await storage.createBuild(buildData);
      res.json(build);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid build data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to save build" });
    }
  });

  // Get build
  app.get("/api/builds/:id", async (req, res) => {
    try {
      const build = await storage.getBuild(req.params.id);
      if (!build) {
        return res.status(404).json({ message: "Build not found" });
      }
      res.json(build);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch build" });
    }
  });

  // Update build
  app.patch("/api/builds/:id", async (req, res) => {
    try {
      const updateData = insertBuildSchema.partial().parse(req.body);
      const build = await storage.updateBuild(req.params.id, updateData);
      if (!build) {
        return res.status(404).json({ message: "Build not found" });
      }
      res.json(build);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid build data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update build" });
    }
  });

  // Get compatibility info for selected components
  app.post("/api/compatibility", async (req, res) => {
    try {
      const { components } = req.body;
      const compatibility = {
        cpuMainboard: true,
        ramMainboard: true,
        psuWattage: "adequate",
        warnings: [] as string[]
      };

      // Basic compatibility checking logic
      if (components.cpu && components.mainboard) {
        const cpu = await storage.getProduct(components.cpu);
        const mainboard = await storage.getProduct(components.mainboard);
        
        if (cpu?.socket !== mainboard?.socket) {
          compatibility.cpuMainboard = false;
          compatibility.warnings.push("CPU và Mainboard không tương thích về socket");
        }
      }

      // Calculate total wattage
      let totalWattage = 0;
      for (const componentId of Object.values(components)) {
        const product = await storage.getProduct(componentId as string);
        if (product?.wattage) {
          totalWattage += product.wattage;
        }
      }

      if (components.psu) {
        const psu = await storage.getProduct(components.psu);
        const psuWattage = psu?.specs?.wattage || 750; // Default PSU wattage
        
        if (totalWattage > psuWattage * 0.8) {
          compatibility.psuWattage = "insufficient";
          compatibility.warnings.push("Công suất nguồn có thể không đủ");
        } else if (totalWattage > psuWattage * 0.6) {
          compatibility.psuWattage = "marginal";
          compatibility.warnings.push("Cân nhắc nguồn có công suất cao hơn");
        }
      }

      res.json({ compatibility, totalWattage });
    } catch (error) {
      res.status(500).json({ message: "Failed to check compatibility" });
    }
  });

  // WooCommerce Integration Routes
  
  // Create WooCommerce order from PC build
  app.post("/api/woocommerce/order", async (req, res) => {
    try {
      if (!wooCommerceAPI) {
        return res.status(400).json({ 
          message: "WooCommerce API not configured. Please provide WOOCOMMERCE_URL, WOOCOMMERCE_CONSUMER_KEY, and WOOCOMMERCE_CONSUMER_SECRET environment variables." 
        });
      }

      const { components, customerInfo } = req.body;
      
      // Validate required fields
      if (!components || !Array.isArray(components) || !customerInfo) {
        return res.status(400).json({ 
          message: "Invalid request. Required: components (array) and customerInfo" 
        });
      }

      // Get full product details for components
      const products = [];
      for (const componentId of components) {
        const product = await storage.getProduct(componentId);
        if (product) {
          products.push(product);
        }
      }

      if (products.length === 0) {
        return res.status(400).json({ message: "No valid products found" });
      }

      // Create WooCommerce order
      const order = await wooCommerceAPI.createPCBuildOrder(products, customerInfo);
      
      res.json({
        success: true,
        order_id: order.id,
        order_total: order.total,
        message: "Đơn hàng PC đã được tạo thành công!",
        woocommerce_order: order
      });

    } catch (error) {
      console.error("WooCommerce order creation error:", error);
      res.status(500).json({ 
        message: "Failed to create WooCommerce order",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Get WooCommerce status
  app.get("/api/woocommerce/status", (req, res) => {
    res.json({
      woocommerce_configured: !!wooCommerceAPI,
      api_url: process.env.WOOCOMMERCE_URL || null,
      has_consumer_key: !!process.env.WOOCOMMERCE_CONSUMER_KEY,
      has_consumer_secret: !!process.env.WOOCOMMERCE_CONSUMER_SECRET
    });
  });

  const httpServer = createServer(app);
  return httpServer;
}
