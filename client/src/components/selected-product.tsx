import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X, ExternalLink } from "lucide-react";
import { type Product } from "@shared/schema";

interface SelectedProductProps {
  product: Product;
  onRemove: () => void;
}

export function SelectedProduct({ product, onRemove }: SelectedProductProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0
    }).format(price);
  };

  const getSpecsDisplay = (specs: Record<string, any> | null) => {
    if (!specs) return "";
    
    // Get the most relevant specs for display
    const relevantSpecs = [];
    
    if (specs.cores && specs.threads) {
      relevantSpecs.push(`${specs.cores} cores, ${specs.threads} threads`);
    }
    if (specs.boostFreq) {
      relevantSpecs.push(`up to ${specs.boostFreq}`);
    }
    if (specs.memory) {
      relevantSpecs.push(specs.memory);
    }
    if (specs.coreClock) {
      relevantSpecs.push(specs.coreClock);
    }
    if (specs.chipset) {
      relevantSpecs.push(specs.chipset);
    }
    
    return relevantSpecs.slice(0, 2).join(', ');
  };

  const handleProductClick = () => {
    // Simulate opening product details page
    window.open(`#/product/${product.id}`, '_blank');
  };

  return (
    <Card className="bg-white border hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start space-x-4">
          <img 
            src={product.image} 
            alt={product.name}
            className="w-20 h-20 object-cover rounded-lg flex-shrink-0 cursor-pointer"
            onClick={handleProductClick}
          />
          <div className="flex-1 min-w-0">
            <h4 
              className="font-medium text-gray-900 mb-2 line-clamp-2 cursor-pointer hover:text-primary"
              onClick={handleProductClick}
            >
              {product.name}
            </h4>
            {product.description && (
              <p className="text-sm text-gray-600 mb-2 line-clamp-1">
                {product.description}
              </p>
            )}
            <p className="text-sm text-gray-600 mb-2">
              {getSpecsDisplay(product.specs)}
            </p>
            <div className="flex items-center justify-between">
              <p className="text-lg font-bold text-primary">
                {formatPrice(product.price)}
              </p>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleProductClick}
                className="text-gray-500 hover:text-primary p-1 h-auto"
              >
                <ExternalLink className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onRemove}
            className="text-gray-400 hover:text-red-500 p-1 h-auto flex-shrink-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
