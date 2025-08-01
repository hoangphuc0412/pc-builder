import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { ShoppingCart, CheckCircle, AlertCircle } from "lucide-react";
import { type Product } from "@shared/schema";

interface WooCommerceCheckoutProps {
  isOpen: boolean;
  onClose: () => void;
  selectedComponents: Product[];
  totalPrice: number;
}

interface CustomerInfo {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  address_1?: string;
  city?: string;
  postcode?: string;
  country?: string;
}

export function WooCommerceCheckout({ isOpen, onClose, selectedComponents, totalPrice }: WooCommerceCheckoutProps) {
  const { toast } = useToast();
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    address_1: '',
    city: '',
    postcode: '',
    country: 'VN'
  });

  const createOrderMutation = useMutation({
    mutationFn: async (orderData: { components: string[]; customerInfo: CustomerInfo }) => {
      return apiRequest('/api/woocommerce/order', {
        method: 'POST',
        body: JSON.stringify(orderData)
      });
    },
    onSuccess: (data) => {
      toast({
        title: "Đặt hàng thành công!",
        description: `Đơn hàng #${data.order_id} đã được tạo với tổng giá trị ${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(parseFloat(data.order_total))}`,
      });
      onClose();
      // Reset form
      setCustomerInfo({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        address_1: '',
        city: '',
        postcode: '',
        country: 'VN'
      });
    },
    onError: (error: any) => {
      toast({
        title: "Lỗi đặt hàng",
        description: error.message || "Có lỗi xảy ra khi tạo đơn hàng WooCommerce",
        variant: "destructive"
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!customerInfo.first_name || !customerInfo.last_name || !customerInfo.email || !customerInfo.phone) {
      toast({
        title: "Thông tin không đầy đủ",
        description: "Vui lòng nhập đầy đủ họ tên, email và số điện thoại",
        variant: "destructive"
      });
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(customerInfo.email)) {
      toast({
        title: "Email không hợp lệ",
        description: "Vui lòng nhập địa chỉ email đúng định dạng",
        variant: "destructive"
      });
      return;
    }

    // Create order
    createOrderMutation.mutate({
      components: selectedComponents.map(c => c.id),
      customerInfo
    });
  };

  const handleInputChange = (field: keyof CustomerInfo, value: string) => {
    setCustomerInfo(prev => ({ ...prev, [field]: value }));
  };

  if (selectedComponents.length === 0) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5 text-primary" />
            Đặt hàng PC Build - WooCommerce
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Order Summary */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold mb-3">Tóm tắt đơn hàng</h3>
            <div className="space-y-2">
              {selectedComponents.map((component, index) => (
                <div key={component.id} className="flex justify-between text-sm">
                  <span>{index + 1}. {component.name}</span>
                  <span className="font-medium">
                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(component.price)}
                  </span>
                </div>
              ))}
              <div className="border-t pt-2 flex justify-between font-semibold">
                <span>Tổng cộng:</span>
                <span className="text-primary">
                  {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(totalPrice)}
                </span>
              </div>
            </div>
          </div>

          {/* Customer Information Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <h3 className="font-semibold">Thông tin khách hàng</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="first_name">Họ và tên đệm *</Label>
                <Input
                  id="first_name"
                  value={customerInfo.first_name}
                  onChange={(e) => handleInputChange('first_name', e.target.value)}
                  placeholder="Nguyễn Văn"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="last_name">Tên *</Label>
                <Input
                  id="last_name"
                  value={customerInfo.last_name}
                  onChange={(e) => handleInputChange('last_name', e.target.value)}
                  placeholder="An"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={customerInfo.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="example@email.com"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Số điện thoại *</Label>
              <Input
                id="phone"
                value={customerInfo.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="0901234567"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address_1">Địa chỉ</Label>
              <Textarea
                id="address_1"
                value={customerInfo.address_1}
                onChange={(e) => handleInputChange('address_1', e.target.value)}
                placeholder="Số nhà, tên đường, phường/xã"
                rows={2}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">Thành phố</Label>
                <Input
                  id="city"
                  value={customerInfo.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  placeholder="Hồ Chí Minh"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="postcode">Mã bưu điện</Label>
                <Input
                  id="postcode"
                  value={customerInfo.postcode}
                  onChange={(e) => handleInputChange('postcode', e.target.value)}
                  placeholder="700000"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={createOrderMutation.isPending}
              >
                Hủy
              </Button>
              
              <Button
                type="submit"
                className="bg-primary hover:bg-primary/90"
                disabled={createOrderMutation.isPending}
              >
                {createOrderMutation.isPending ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Đang xử lý...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4" />
                    Đặt hàng ngay
                  </div>
                )}
              </Button>
            </div>
          </form>

          {/* WooCommerce Integration Status */}
          <div className="bg-blue-50 p-3 rounded-lg">
            <div className="flex items-center gap-2 text-sm text-blue-700">
              <AlertCircle className="h-4 w-4" />
              <span>Đơn hàng sẽ được tạo trực tiếp trên hệ thống WooCommerce của bạn</span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}