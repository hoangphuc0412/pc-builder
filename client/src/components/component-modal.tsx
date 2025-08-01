import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Card, CardContent } from "@/components/ui/card";
import { Search, ChevronLeft, ChevronRight, X, ChevronDown, ChevronUp } from "lucide-react";
import { type Product, type ComponentCategory, COMPONENT_CATEGORIES } from "@shared/schema";

interface ComponentModalProps {
  category: ComponentCategory;
  onClose: () => void;
  onSelect: (product: Product) => void;
}

export function ComponentModal({ category, onClose, onSelect }: ComponentModalProps) {
  const [search, setSearch] = useState("");
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedSockets, setSelectedSockets] = useState<string[]>([]);
  const [selectedPriceRanges, setSelectedPriceRanges] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  
  // Collapsible states
  const [isBrandOpen, setIsBrandOpen] = useState(false);
  const [isSocketOpen, setIsSocketOpen] = useState(false);
  const [isPriceOpen, setIsPriceOpen] = useState(false);
  
  const itemsPerPage = 6;

  // Get category title
  const categoryTitle = COMPONENT_CATEGORIES.find(c => c.id === category)?.name || "Chọn linh kiện";

  // Fetch products
  const { data: products = [], isLoading } = useQuery({
    queryKey: ['/api/products', category, search, selectedBrands, selectedSockets, selectedPriceRanges],
    queryFn: async () => {
      const params = new URLSearchParams({
        category
      });
      
      if (search) params.append('search', search);
      if (selectedBrands.length) params.append('brand', selectedBrands.join(','));
      if (selectedSockets.length) params.append('socket', selectedSockets.join(','));
      
      // Handle price ranges
      if (selectedPriceRanges.length > 0) {
        let minPrice = 0;
        let maxPrice = Number.MAX_SAFE_INTEGER;
        
        selectedPriceRanges.forEach(range => {
          switch (range) {
            case 'under-5m':
              maxPrice = Math.min(maxPrice, 5000000);
              break;
            case '5m-10m':
              minPrice = Math.max(minPrice, 5000000);
              maxPrice = Math.min(maxPrice, 10000000);
              break;
            case 'over-10m':
              minPrice = Math.max(minPrice, 10000000);
              break;
          }
        });
        
        if (minPrice > 0) params.append('minPrice', minPrice.toString());
        if (maxPrice < Number.MAX_SAFE_INTEGER) params.append('maxPrice', maxPrice.toString());
      }

      const response = await fetch(`/api/products?${params}`);
      return response.json();
    }
  });

  // Get unique brands and sockets for filters
  const availableBrands = Array.from(new Set(products.map((p: Product) => p.brand)));
  const availableSockets = Array.from(new Set(products.map((p: Product) => p.socket).filter(Boolean)));

  // Pagination
  const totalPages = Math.ceil(products.length / itemsPerPage);
  const paginatedProducts = products.slice(
    (currentPage - 1) * itemsPerPage, 
    currentPage * itemsPerPage
  );

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, selectedBrands, selectedSockets, selectedPriceRanges]);

  const clearAllFilters = () => {
    setSelectedBrands([]);
    setSelectedSockets([]);
    setSelectedPriceRanges([]);
    setSearch("");
  };

  const handleBrandToggle = (brand: string, checked: boolean) => {
    setSelectedBrands(prev => 
      checked ? [...prev, brand] : prev.filter(b => b !== brand)
    );
  };

  const handleSocketToggle = (socket: string, checked: boolean) => {
    setSelectedSockets(prev => 
      checked ? [...prev, socket] : prev.filter(s => s !== socket)
    );
  };

  const handlePriceToggle = (priceRange: string, checked: boolean) => {
    setSelectedPriceRanges(prev => 
      checked ? [...prev, priceRange] : prev.filter(p => p !== priceRange)
    );
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0
    }).format(price);
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden">
        {/* Modal Header */}
        <DialogHeader className="bg-primary p-6 text-white -m-6 mb-0">
          <DialogTitle className="text-xl font-bold">{categoryTitle}</DialogTitle>
          
          {/* Search Bar */}
          <div className="mt-4 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              type="text"
              placeholder="Tìm kiếm sản phẩm..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 text-gray-900 placeholder-gray-500"
            />
          </div>
        </DialogHeader>

        <div className="flex flex-1 overflow-hidden">
          {/* Filters Sidebar */}
          <div className="w-64 bg-gray-50 p-6 overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-bold text-gray-900">Bộ lọc</h4>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={clearAllFilters}
                className="text-red-600 hover:text-red-700"
              >
                <X className="h-4 w-4 mr-1" />
                Xóa tất cả
              </Button>
            </div>
            
            {/* Brand Filter */}
            {availableBrands.length > 0 && (
              <div className="mb-6">
                <Collapsible open={isBrandOpen} onOpenChange={setIsBrandOpen}>
                  <CollapsibleTrigger asChild>
                    <Button variant="ghost" className="w-full justify-between p-0 h-auto">
                      <div className="flex items-center">
                        <h5 className="font-medium text-gray-900">
                          Thương hiệu {selectedBrands.length > 0 && `(${selectedBrands.length})`}
                        </h5>
                      </div>
                      {isBrandOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="space-y-2 mt-2">
                    {/* Show selected brands first */}
                    {selectedBrands.map(brand => (
                      <div key={`selected-${brand}`} className="flex items-center space-x-2 bg-primary/10 p-2 rounded">
                        <Checkbox
                          id={`brand-${brand}`}
                          checked={true}
                          onCheckedChange={(checked) => handleBrandToggle(brand, !!checked)}
                        />
                        <label htmlFor={`brand-${brand}`} className="text-sm font-medium text-primary cursor-pointer">
                          {brand}
                        </label>
                      </div>
                    ))}
                    {/* Show unselected brands */}
                    {availableBrands.filter(brand => !selectedBrands.includes(brand)).map(brand => (
                      <div key={brand} className="flex items-center space-x-2">
                        <Checkbox
                          id={`brand-${brand}`}
                          checked={false}
                          onCheckedChange={(checked) => handleBrandToggle(brand, !!checked)}
                        />
                        <label htmlFor={`brand-${brand}`} className="text-sm text-gray-700 cursor-pointer">
                          {brand}
                        </label>
                      </div>
                    ))}
                  </CollapsibleContent>
                </Collapsible>
              </div>
            )}

            {/* Socket Filter */}
            {availableSockets.length > 0 && (
              <div className="mb-6">
                <Collapsible open={isSocketOpen} onOpenChange={setIsSocketOpen}>
                  <CollapsibleTrigger asChild>
                    <Button variant="ghost" className="w-full justify-between p-0 h-auto">
                      <div className="flex items-center">
                        <h5 className="font-medium text-gray-900">
                          Socket {selectedSockets.length > 0 && `(${selectedSockets.length})`}
                        </h5>
                      </div>
                      {isSocketOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="space-y-2 mt-2">
                    {/* Show selected sockets first */}
                    {selectedSockets.map(socket => (
                      <div key={`selected-${socket}`} className="flex items-center space-x-2 bg-primary/10 p-2 rounded">
                        <Checkbox
                          id={`socket-${socket}`}
                          checked={true}
                          onCheckedChange={(checked) => handleSocketToggle(socket, !!checked)}
                        />
                        <label htmlFor={`socket-${socket}`} className="text-sm font-medium text-primary cursor-pointer">
                          {socket?.toUpperCase()}
                        </label>
                      </div>
                    ))}
                    {/* Show unselected sockets */}
                    {availableSockets.filter(socket => !selectedSockets.includes(socket)).map(socket => (
                      <div key={socket} className="flex items-center space-x-2">
                        <Checkbox
                          id={`socket-${socket}`}
                          checked={false}
                          onCheckedChange={(checked) => handleSocketToggle(socket, !!checked)}
                        />
                        <label htmlFor={`socket-${socket}`} className="text-sm text-gray-700 cursor-pointer">
                          {socket?.toUpperCase()}
                        </label>
                      </div>
                    ))}
                  </CollapsibleContent>
                </Collapsible>
              </div>
            )}

            {/* Price Range */}
            <div className="mb-6">
              <Collapsible open={isPriceOpen} onOpenChange={setIsPriceOpen}>
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" className="w-full justify-between p-0 h-auto">
                    <div className="flex items-center">
                      <h5 className="font-medium text-gray-900">
                        Khoảng giá {selectedPriceRanges.length > 0 && `(${selectedPriceRanges.length})`}
                      </h5>
                    </div>
                    {isPriceOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-2 mt-2">
                  {/* Price ranges */}
                  {[
                    { id: 'under-5m', label: 'Dưới 5 triệu' },
                    { id: '5m-10m', label: '5-10 triệu' },
                    { id: 'over-10m', label: 'Trên 10 triệu' }
                  ].map(priceRange => (
                    <div 
                      key={priceRange.id} 
                      className={`flex items-center space-x-2 ${
                        selectedPriceRanges.includes(priceRange.id) ? 'bg-primary/10 p-2 rounded' : ''
                      }`}
                    >
                      <Checkbox
                        id={`price-${priceRange.id}`}
                        checked={selectedPriceRanges.includes(priceRange.id)}
                        onCheckedChange={(checked) => handlePriceToggle(priceRange.id, !!checked)}
                      />
                      <label 
                        htmlFor={`price-${priceRange.id}`} 
                        className={`text-sm cursor-pointer ${
                          selectedPriceRanges.includes(priceRange.id) ? 'font-medium text-primary' : 'text-gray-700'
                        }`}
                      >
                        {priceRange.label}
                      </label>
                    </div>
                  ))}
                </CollapsibleContent>
              </Collapsible>
            </div>
          </div>

          {/* Products Grid */}
          <div className="flex-1 p-6 overflow-y-auto">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-gray-200 animate-pulse rounded-xl h-64" />
                ))}
              </div>
            ) : paginatedProducts.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500">Không tìm thấy sản phẩm nào</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {paginatedProducts.map((product: Product) => (
                    <Card key={product.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                      <CardContent className="p-4">
                        <img 
                          src={product.image} 
                          alt={product.name}
                          className="w-full h-32 object-cover rounded-lg mb-3"
                        />
                        <h4 className="font-medium text-gray-900 mb-2 line-clamp-2">
                          {product.name}
                        </h4>
                        {product.specs && (
                          <p className="text-sm text-gray-600 mb-3">
                            {Object.entries(product.specs).slice(0, 3).map(([key, value]) => 
                              `${value}`
                            ).join(', ')}
                          </p>
                        )}
                        <div className="flex items-center justify-between">
                          <span className="text-lg font-bold text-gray-900">
                            Giá: {formatPrice(product.price)}
                          </span>
                          <Button 
                            onClick={() => onSelect(product)}
                            className="bg-primary hover:bg-primary/90"
                          >
                            Chọn
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center items-center space-x-2 mt-8">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    
                    {[...Array(totalPages)].map((_, i) => (
                      <Button
                        key={i + 1}
                        variant={currentPage === i + 1 ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(i + 1)}
                        className={currentPage === i + 1 ? "bg-primary" : ""}
                      >
                        {i + 1}
                      </Button>
                    ))}
                    
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
