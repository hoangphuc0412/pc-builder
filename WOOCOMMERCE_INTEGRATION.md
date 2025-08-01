# Hướng dẫn tích hợp PC Builder vào WooCommerce

## 3 Phương pháp tích hợp

### Phương pháp 1: Iframe Embedding (Đơn giản nhất)
```html
<!-- Thêm vào trang WooCommerce -->
<iframe 
  src="https://your-replit-app.replit.app" 
  width="100%" 
  height="800px" 
  frameborder="0">
</iframe>
```

### Phương pháp 2: WordPress Plugin (Khuyến nghị)
Tạo plugin WordPress để nhúng PC Builder:

```php
<?php
/**
 * Plugin Name: PC Builder Tool
 * Description: Công cụ cấu hình PC tùy chỉnh
 * Version: 1.0
 */

// Thêm shortcode [pc_builder]
function pc_builder_shortcode() {
    return '<div id="pc-builder-container"></div>
    <script>
        // Load PC Builder React component
        fetch("https://your-replit-app.replit.app/api/embed")
        .then(response => response.text())
        .then(html => {
            document.getElementById("pc-builder-container").innerHTML = html;
        });
    </script>';
}
add_shortcode('pc_builder', 'pc_builder_shortcode');

// Thêm menu admin
function pc_builder_admin_menu() {
    add_menu_page(
        'PC Builder Settings',
        'PC Builder',
        'manage_options',
        'pc-builder-settings',
        'pc_builder_settings_page'
    );
}
add_action('admin_menu', 'pc_builder_admin_menu');
```

### Phương pháp 3: WooCommerce REST API Integration (Hoàn chỉnh nhất)

## Cấu hình WooCommerce API

1. **Tạo API Keys:**
   - Vào WooCommerce → Settings → Advanced → REST API
   - Tạo Consumer Key và Consumer Secret

2. **Cấu hình CORS:**
   ```php
   // Thêm vào functions.php
   function add_cors_http_header(){
       header("Access-Control-Allow-Origin: https://your-replit-app.replit.app");
       header("Access-Control-Allow-Credentials: true");
       header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
       header("Access-Control-Allow-Headers: Content-Type, Authorization");
   }
   add_action('init','add_cors_http_header');
   ```

## Cấu trúc dữ liệu WooCommerce

### Product Categories cho PC Components:
```json
{
  "categories": [
    {"id": 1, "name": "CPU", "slug": "cpu"},
    {"id": 2, "name": "VGA", "slug": "vga"},
    {"id": 3, "name": "Mainboard", "slug": "mainboard"},
    {"id": 4, "name": "RAM", "slug": "ram"},
    {"id": 5, "name": "PSU", "slug": "psu"},
    {"id": 6, "name": "SSD", "slug": "ssd"},
    {"id": 7, "name": "HDD", "slug": "hdd"},
    {"id": 8, "name": "Case", "slug": "case"},
    {"id": 9, "name": "Fan", "slug": "fan"},
    {"id": 10, "name": "CPU Cooler", "slug": "cpu-cooler"},
    {"id": 11, "name": "Monitor", "slug": "monitor"},
    {"id": 12, "name": "Mouse", "slug": "mouse"},
    {"id": 13, "name": "Keyboard", "slug": "keyboard"},
    {"id": 14, "name": "Headphones", "slug": "headphones"}
  ]
}
```

### Custom Fields cho PC Components:
```json
{
  "meta_data": [
    {"key": "brand", "value": "Intel"},
    {"key": "socket", "value": "LGA1700"},
    {"key": "wattage", "value": "125"},
    {"key": "specs", "value": "{\"cores\": 8, \"threads\": 16}"},
    {"key": "compatibility", "value": "[\"LGA1700\", \"DDR4\"]"},
    {"key": "image_url", "value": "https://example.com/product.jpg"}
  ]
}
```

## Code Integration Examples

### JavaScript để kết nối WooCommerce:
```javascript
class WooCommerceAPI {
  constructor(baseURL, consumerKey, consumerSecret) {
    this.baseURL = baseURL;
    this.auth = btoa(`${consumerKey}:${consumerSecret}`);
  }

  async getProducts(category, filters = {}) {
    const params = new URLSearchParams({
      category: category,
      per_page: 50,
      ...filters
    });

    const response = await fetch(`${this.baseURL}/wp-json/wc/v3/products?${params}`, {
      headers: {
        'Authorization': `Basic ${this.auth}`,
        'Content-Type': 'application/json'
      }
    });

    return response.json();
  }

  async createOrder(products, customerInfo) {
    const orderData = {
      payment_method: 'bacs',
      payment_method_title: 'Direct Bank Transfer',
      set_paid: false,
      billing: customerInfo,
      shipping: customerInfo,
      line_items: products.map(product => ({
        product_id: product.id,
        quantity: 1
      })),
      meta_data: [
        {
          key: 'pc_build_config',
          value: JSON.stringify(products)
        }
      ]
    };

    const response = await fetch(`${this.baseURL}/wp-json/wc/v3/orders`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${this.auth}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(orderData)
    });

    return response.json();
  }
}
```

## Deployment Options

### Option 1: Replit Deployment + WordPress Plugin
1. Deploy PC Builder trên Replit
2. Tạo WordPress plugin để embed
3. Sử dụng shortcode `[pc_builder]` trong bất kỳ trang nào

### Option 2: Upload to WordPress
1. Build PC Builder thành static files
2. Upload vào WordPress theme folder
3. Tạo custom page template

### Option 3: Subdomain Integration
1. Deploy PC Builder trên subdomain (tools.yoursite.com)
2. Embed vào WordPress qua iframe với communication API

## Environment Variables cần thiết:

```env
# WooCommerce API
WOOCOMMERCE_URL=https://yoursite.com
WOOCOMMERCE_CONSUMER_KEY=ck_xxxxxxxxxxxx
WOOCOMMERCE_CONSUMER_SECRET=cs_xxxxxxxxxxxx

# CORS Settings
ALLOWED_ORIGINS=https://yoursite.com,https://www.yoursite.com
```

## Next Steps:
1. Chọn phương pháp tích hợp phù hợp
2. Cung cấp WooCommerce API credentials
3. Test integration trên staging site trước
4. Deploy production

Bạn muốn sử dụng phương pháp nào? Tôi có thể giúp implement chi tiết cho từng option.