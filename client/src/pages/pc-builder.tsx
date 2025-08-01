import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ComponentModal } from "@/components/component-modal";
import { SelectedProduct } from "@/components/selected-product";
import { CompatibilitySidebar } from "@/components/compatibility-sidebar";
import { WooCommerceCheckout } from "@/components/woocommerce-checkout";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { type Product, type ComponentCategory, COMPONENT_CATEGORIES } from "@shared/schema";
import { Dock, Save, RotateCcw, ShoppingCart, X } from "lucide-react";

export default function PCBuilder() {
  const [selectedComponents, setSelectedComponents] = useState<Record<ComponentCategory, Product | null>>({} as any);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentCategory, setCurrentCategory] = useState<ComponentCategory | null>(null);
  const [totalPrice, setTotalPrice] = useState(0);
  const [showWooCommerceCheckout, setShowWooCommerceCheckout] = useState(false);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Calculate total price whenever selected components change
  useEffect(() => {
    const total = Object.values(selectedComponents)
      .filter(Boolean)
      .reduce((sum, product) => sum + (product?.price || 0), 0);
    setTotalPrice(total);
  }, [selectedComponents]);

  // Get compatibility info
  const { data: compatibilityData } = useQuery({
    queryKey: ['/api/compatibility'],
    queryFn: async () => {
      const componentIds = Object.fromEntries(
        Object.entries(selectedComponents)
          .filter(([_, product]) => product)
          .map(([category, product]) => [category, product!.id])
      );
      
      if (Object.keys(componentIds).length === 0) return null;
      
      const response = await apiRequest('POST', '/api/compatibility', componentIds);
      return response.json();
    },
    enabled: Object.values(selectedComponents).some(Boolean)
  });

  // Save build mutation
  const saveBuildMutation = useMutation({
    mutationFn: async () => {
      const components = Object.fromEntries(
        Object.entries(selectedComponents)
          .filter(([_, product]) => product)
          .map(([category, product]) => [category, product!.id])
      );

      const response = await apiRequest('POST', '/api/builds', {
        name: `Build ${new Date().toLocaleDateString('vi-VN')}`,
        components,
        totalPrice
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Đã lưu cấu hình",
        description: "Cấu hình PC của bạn đã được lưu thành công!"
      });
    },
    onError: () => {
      toast({
        title: "Lỗi",
        description: "Không thể lưu cấu hình. Vui lòng thử lại.",
        variant: "destructive"
      });
    }
  });

  const openComponentModal = (category: ComponentCategory) => {
    setCurrentCategory(category);
    setIsModalOpen(true);
  };

  const selectProduct = (product: Product) => {
    if (currentCategory) {
      setSelectedComponents(prev => ({
        ...prev,
        [currentCategory]: product
      }));
      setIsModalOpen(false);
      setCurrentCategory(null);
    }
  };

  const removeComponent = (category: ComponentCategory) => {
    setSelectedComponents(prev => ({
      ...prev,
      [category]: null
    }));
  };

  const resetConfiguration = () => {
    setSelectedComponents({} as any);
    toast({
      title: "Đã xóa cấu hình",
      description: "Tất cả linh kiện đã được xóa khỏi cấu hình."
    });
  };

  const addToCart = () => {
    const selectedCount = Object.values(selectedComponents).filter(Boolean).length;
    if (selectedCount === 0) {
      toast({
        title: "Chưa chọn linh kiện",
        description: "Vui lòng chọn ít nhất một linh kiện!",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Đã thêm vào giỏ hàng",
      description: `${selectedCount} sản phẩm đã được thêm vào giỏ hàng!`
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0
    }).format(price);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <Dock className="text-2xl text-primary" />
              <h1 className="text-2xl font-bold text-gray-900">PC Builder</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Button 
                variant="outline" 
                onClick={() => saveBuildMutation.mutate()}
                disabled={saveBuildMutation.isPending}
              >
                <Save className="mr-2 h-4 w-4" />
                Lưu cấu hình
              </Button>
              <Button 
                variant="outline" 
                onClick={resetConfiguration}
                className="text-red-700 border-red-200 hover:bg-red-50"
              >
                <RotateCcw className="mr-2 h-4 w-4" />
                Xây dựng lại
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Component Selection Panel */}
          <div className="lg:col-span-3">
            <Card className="shadow-sm">
              {/* Header with Total Price */}
              <div className="flex justify-between items-center p-6 border-b bg-gradient-to-r from-primary/5 to-primary/10">
                <h2 className="text-xl font-bold text-gray-900">Xây dựng cấu hình</h2>
                <div className="text-right">
                  <p className="text-sm text-gray-600">Số tiền phải trả:</p>
                  <p className="text-2xl font-bold text-primary">{formatPrice(totalPrice)}</p>
                </div>
              </div>

              <CardContent className="p-6">
                {/* Component List */}
                <div className="space-y-6">
                  {COMPONENT_CATEGORIES.map((category) => (
                    <div key={category.id} className="border-b pb-6 last:border-b-0">
                      <div className="flex items-center space-x-3 mb-3">
                        <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium min-w-8 text-center">
                          {category.order}
                        </span>
                        <span className="font-medium text-gray-900 flex-1">{category.name}</span>
                        
                        {selectedComponents[category.id] ? (
                          <div className="flex items-center space-x-2 flex-1">
                            <div className="flex-1">
                              <SelectedProduct 
                                product={selectedComponents[category.id]!}
                                onRemove={() => removeComponent(category.id)}
                              />
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openComponentModal(category.id)}
                              className="text-primary border-primary/20 hover:bg-primary/10 flex-shrink-0"
                            >
                              <X className="h-4 w-4 mr-1" />
                              Chọn lại
                            </Button>
                          </div>
                        ) : (
                          <Button 
                            onClick={() => openComponentModal(category.id)}
                            className="bg-primary hover:bg-primary/90 flex-shrink-0"
                          >
                            <span className="mr-2">+</span>
                            {category.name}
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>

              {/* Checkout Options */}
              <div className="p-6 border-t bg-gray-50 space-y-3">
                <Button 
                  onClick={() => setShowWooCommerceCheckout(true)}
                  className="w-full bg-primary hover:bg-primary/90 text-white py-3 text-lg"
                  size="lg"
                  disabled={Object.values(selectedComponents).filter(Boolean).length === 0}
                >
                  <ShoppingCart className="mr-2 h-5 w-5" />
                  Đặt hàng WooCommerce
                </Button>
                <Button 
                  onClick={addToCart}
                  variant="outline"
                  className="w-full border-green-600 text-green-600 hover:bg-green-50 py-3 text-lg"
                  size="lg"
                  disabled={Object.values(selectedComponents).filter(Boolean).length === 0}
                >
                  <ShoppingCart className="mr-2 h-5 w-5" />
                  Thêm vào giỏ hàng thông thường
                </Button>
              </div>
            </Card>
          </div>

          {/* Compatibility & Info Sidebar */}
          <div className="lg:col-span-1">
            <CompatibilitySidebar 
              selectedComponents={selectedComponents}
              compatibilityData={compatibilityData}
            />
          </div>
        </div>
      </div>

      {/* Component Selection Modal */}
      {isModalOpen && currentCategory && (
        <ComponentModal
          category={currentCategory}
          onClose={() => setIsModalOpen(false)}
          onSelect={selectProduct}
        />
      )}

      {/* WooCommerce Checkout Modal */}
      <WooCommerceCheckout
        isOpen={showWooCommerceCheckout}
        onClose={() => setShowWooCommerceCheckout(false)}
        selectedComponents={Object.values(selectedComponents).filter(Boolean) as Product[]}
        totalPrice={totalPrice}
      />
    </div>
  );
}
