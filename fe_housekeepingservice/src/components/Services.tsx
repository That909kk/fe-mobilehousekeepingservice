import React, { useState } from 'react';
import { useServices } from '../shared/hooks/useServices';
import { useCategories } from '../shared/hooks/useCategories';
import { useMenuPermissions } from '../shared/hooks/useMenuPermissions';
import { useStaticData, getNestedValue } from '../shared/hooks/useStaticData';
import { useLanguage } from '../shared/hooks/useLanguage';
import type { ServiceSearchParams } from '../types/service';

const Services: React.FC = () => {
  const { language } = useLanguage();
  const { data: staticData, loading: staticLoading } = useStaticData('services', language);
  const { hasPermission } = useMenuPermissions();
  const [searchParams, setSearchParams] = useState<ServiceSearchParams>({
    page: 1,
    limit: 10
  });

  const { data: servicesData, loading: servicesLoading, error: servicesError, refetch } = useServices(searchParams);
  const { data: categoriesData, loading: categoriesLoading } = useCategories();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });

  // Check permissions
  const canViewServices = hasPermission('SERVICE', 'VIEW', 'SERVICE_LIST');
  const canCreateService = hasPermission('SERVICE', 'CREATE', 'SERVICE');
  const canUpdateService = hasPermission('SERVICE', 'UPDATE', 'SERVICE');
  const canDeleteService = hasPermission('SERVICE', 'DELETE', 'SERVICE');

  const handleSearch = () => {
    const newParams: ServiceSearchParams = {
      ...searchParams,
      page: 1,
      keyword: searchTerm || undefined,
      categoryId: selectedCategory || undefined,
      minPrice: priceRange.min ? parseFloat(priceRange.min) : undefined,
      maxPrice: priceRange.max ? parseFloat(priceRange.max) : undefined,
    };
    setSearchParams(newParams);
    refetch(newParams);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  if (staticLoading) {
    return <div className="flex justify-center items-center h-64">
      <div className="text-lg">Đang tải...</div>
    </div>;
  }

  // Check if user has permission to view services
  if (!canViewServices) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="text-6xl mb-4">🔒</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Không có quyền truy cập
          </h2>
          <p className="text-gray-600 mb-6">
            Bạn không có quyền xem danh sách dịch vụ. Vui lòng liên hệ quản trị viên để được cấp quyền.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {getNestedValue(staticData, 'title', 'Dịch vụ')}
          </h1>
          <p className="text-gray-600">
            {getNestedValue(staticData, 'subtitle', 'Khám phá các dịch vụ giúp việc gia đình của chúng tôi')}
          </p>
        </div>
        
        {/* Action Buttons */}
        <div className="flex gap-2">
          {canCreateService && (
            <button
              onClick={() => alert('Tạo dịch vụ mới (Demo)')}
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors duration-200 flex items-center gap-2"
            >
              <span>+</span>
              Tạo dịch vụ mới
            </button>
          )}
        </div>
      </div>

      {/* Permissions Info (Debug) */}
      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <h3 className="font-semibold text-gray-700 mb-2">Quyền hạn của bạn:</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
          <div className={`flex items-center ${canViewServices ? 'text-green-600' : 'text-red-600'}`}>
            <span className="mr-2">{canViewServices ? '✅' : '❌'}</span>
            Xem dịch vụ
          </div>
          <div className={`flex items-center ${canCreateService ? 'text-green-600' : 'text-red-600'}`}>
            <span className="mr-2">{canCreateService ? '✅' : '❌'}</span>
            Tạo dịch vụ
          </div>
          <div className={`flex items-center ${canUpdateService ? 'text-green-600' : 'text-red-600'}`}>
            <span className="mr-2">{canUpdateService ? '✅' : '❌'}</span>
            Sửa dịch vụ
          </div>
          <div className={`flex items-center ${canDeleteService ? 'text-green-600' : 'text-red-600'}`}>
            <span className="mr-2">{canDeleteService ? '✅' : '❌'}</span>
            Xóa dịch vụ
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search Input */}
          <div>
            <input
              type="text"
              placeholder={getNestedValue(staticData, 'search.placeholder', 'Tìm kiếm dịch vụ...')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Category Filter */}
          <div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              disabled={categoriesLoading}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
            >
              <option value="">
                {categoriesLoading 
                  ? getNestedValue(staticData, 'search.filters.loading', 'Đang tải...') 
                  : getNestedValue(staticData, 'search.filters.all', 'Tất cả danh mục')
                }
              </option>
              {!categoriesLoading && categoriesData?.data?.map((category) => (
                <option key={category.categoryId} value={category.categoryId}>
                  {category.categoryName}
                </option>
              ))}
            </select>
          </div>

          {/* Price Range */}
          <div className="flex space-x-2">
            <input
              type="number"
              placeholder="Giá từ"
              value={priceRange.min}
              onChange={(e) => setPriceRange(prev => ({ ...prev, min: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <input
              type="number"
              placeholder="Giá đến"
              value={priceRange.max}
              onChange={(e) => setPriceRange(prev => ({ ...prev, max: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Search Button */}
          <button
            onClick={handleSearch}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            {getNestedValue(staticData, 'search.button', 'Tìm kiếm')}
          </button>
        </div>
      </div>

      {/* Loading State */}
      {servicesLoading && (
        <div className="flex justify-center items-center h-64">
          <div className="text-lg">
            {getNestedValue(staticData, 'messages.loading', 'Đang tải dịch vụ...')}
          </div>
        </div>
      )}

      {/* Error State */}
      {servicesError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
          <p className="text-red-600">{servicesError}</p>
        </div>
      )}

      {/* Services Grid */}
      {servicesData && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {servicesData.data.map((service) => (
              <div key={service.serviceId} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-xl font-semibold text-gray-900 line-clamp-2">
                      {service.serviceName}
                    </h3>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      service.status === 'ACTIVE' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {service.status === 'ACTIVE' 
                        ? getNestedValue(staticData, 'status.active', 'Đang hoạt động')
                        : getNestedValue(staticData, 'status.inactive', 'Ngưng hoạt động')
                      }
                    </span>
                  </div>

                  <p className="text-gray-600 mb-4 line-clamp-3">
                    {service.description}
                  </p>

                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">
                        {getNestedValue(staticData, 'labels.category', 'Danh mục')}:
                      </span>
                      <span className="text-sm font-medium">{service.categoryName}</span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">
                        {getNestedValue(staticData, 'labels.duration', 'Thời gian')}:
                      </span>
                      <span className="text-sm font-medium">
                        {service.duration} {getNestedValue(staticData, `units.${service.unit}`, service.unit)}
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">
                        {getNestedValue(staticData, 'labels.price', 'Giá')}:
                      </span>
                      <span className="text-lg font-bold text-blue-600">
                        {formatPrice(service.price)}/{getNestedValue(staticData, `units.${service.unit}`, service.unit)}
                      </span>
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <button className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm">
                      {getNestedValue(staticData, 'actions.viewDetail', 'Xem chi tiết')}
                    </button>
                    <button className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm">
                      {getNestedValue(staticData, 'actions.bookNow', 'Đặt ngay')}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {servicesData.pagination && (
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-600">
                {getNestedValue(staticData, 'pagination.showing', 'Hiển thị')} {((servicesData.pagination.page - 1) * servicesData.pagination.limit) + 1} - {Math.min(servicesData.pagination.page * servicesData.pagination.limit, servicesData.pagination.total)} {getNestedValue(staticData, 'pagination.of', 'của')} {servicesData.pagination.total} {getNestedValue(staticData, 'pagination.results', 'kết quả')}
              </div>
              
              <div className="flex space-x-2">
                <button
                  onClick={() => {
                    const newParams = { ...searchParams, page: searchParams.page! - 1 };
                    setSearchParams(newParams);
                    refetch(newParams);
                  }}
                  disabled={searchParams.page === 1}
                  className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  {getNestedValue(staticData, 'pagination.previous', 'Trước')}
                </button>
                
                <span className="px-4 py-2 border border-gray-300 rounded-lg bg-blue-50 text-blue-600">
                  {getNestedValue(staticData, 'pagination.page', 'Trang')} {searchParams.page} {getNestedValue(staticData, 'pagination.of', 'của')} {servicesData.pagination.totalPages}
                </span>
                
                <button
                  onClick={() => {
                    const newParams = { ...searchParams, page: searchParams.page! + 1 };
                    setSearchParams(newParams);
                    refetch(newParams);
                  }}
                  disabled={searchParams.page === servicesData.pagination.totalPages}
                  className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  {getNestedValue(staticData, 'pagination.next', 'Tiếp')}
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Empty State */}
      {servicesData && servicesData.data.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-500 text-lg">
            {getNestedValue(staticData, 'messages.empty', 'Không có dịch vụ nào')}
          </div>
        </div>
      )}
    </div>
  );
};

export default Services;
