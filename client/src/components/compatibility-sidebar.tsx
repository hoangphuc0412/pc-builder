import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, XCircle, AlertTriangle } from "lucide-react";
import { type Product, type ComponentCategory } from "@shared/schema";

interface CompatibilitySidebarProps {
  selectedComponents: Record<ComponentCategory, Product | null>;
  compatibilityData?: {
    compatibility: {
      cpuMainboard: boolean;
      ramMainboard: boolean;
      psuWattage: "adequate" | "marginal" | "insufficient";
      warnings: string[];
    };
    totalWattage: number;
  };
}

export function CompatibilitySidebar({ selectedComponents, compatibilityData }: CompatibilitySidebarProps) {
  const selectedCount = Object.values(selectedComponents).filter(Boolean).length;
  const totalComponents = 14;

  const getPerformanceLevel = () => {
    const cpu = selectedComponents.cpu;
    const vga = selectedComponents.vga;
    
    if (!cpu && !vga) return "Chưa đánh giá";
    
    // Simple performance assessment based on price ranges
    const cpuPrice = cpu?.price || 0;
    const vgaPrice = vga?.price || 0;
    const totalPrice = cpuPrice + vgaPrice;
    
    if (totalPrice > 20000000) return "High-End";
    if (totalPrice > 12000000) return "Mid-High";
    if (totalPrice > 8000000) return "Mid-Range";
    return "Entry-Level";
  };

  const getCompatibilityIcon = (isCompatible: boolean) => {
    return isCompatible ? (
      <CheckCircle className="h-4 w-4 text-green-500" />
    ) : (
      <XCircle className="h-4 w-4 text-red-500" />
    );
  };

  const getPsuIcon = (status: string) => {
    switch (status) {
      case "adequate":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "marginal":
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case "insufficient":
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-gray-400" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Compatibility Check */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-base">
            <CheckCircle className="mr-2 h-5 w-5 text-green-500" />
            Kiểm tra tương thích
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">CPU & Mainboard</span>
            {compatibilityData ? 
              getCompatibilityIcon(compatibilityData.compatibility.cpuMainboard) :
              <CheckCircle className="h-4 w-4 text-gray-400" />
            }
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">RAM & Mainboard</span>
            {compatibilityData ? 
              getCompatibilityIcon(compatibilityData.compatibility.ramMainboard) :
              <CheckCircle className="h-4 w-4 text-gray-400" />
            }
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">PSU Wattage</span>
            {compatibilityData ? 
              getPsuIcon(compatibilityData.compatibility.psuWattage) :
              <AlertTriangle className="h-4 w-4 text-gray-400" />
            }
          </div>
        </CardContent>
      </Card>

      {/* Build Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Tóm tắt cấu hình</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Linh kiện đã chọn:</span>
            <span className="font-medium">{selectedCount}/{totalComponents}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Tổng công suất:</span>
            <span className="font-medium">
              {compatibilityData ? `~${compatibilityData.totalWattage}W` : "~0W"}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Performance:</span>
            <span className={`font-medium ${
              getPerformanceLevel() === "High-End" ? "text-green-600" :
              getPerformanceLevel() === "Mid-High" ? "text-blue-600" :
              getPerformanceLevel() === "Mid-Range" ? "text-yellow-600" :
              "text-gray-600"
            }`}>
              {getPerformanceLevel()}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Gợi ý</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {compatibilityData?.compatibility.warnings.length ? (
            compatibilityData.compatibility.warnings.map((warning, index) => (
              <div key={index} className="bg-yellow-50 p-3 rounded-lg">
                <p className="text-sm text-yellow-800">{warning}</p>
              </div>
            ))
          ) : (
            <>
              {!selectedComponents.ssd && (
                <div className="bg-blue-50 p-3 rounded-lg">
                  <p className="text-sm text-blue-800">
                    Khuyến nghị thêm SSD để tăng tốc độ khởi động
                  </p>
                </div>
              )}
              {selectedComponents.vga && !selectedComponents.psu && (
                <div className="bg-yellow-50 p-3 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    Cân nhắc nguồn 750W cho VGA hiệu năng cao
                  </p>
                </div>
              )}
              {selectedCount === 0 && (
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-sm text-gray-600">
                    Bắt đầu bằng việc chọn CPU và Mainboard
                  </p>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
