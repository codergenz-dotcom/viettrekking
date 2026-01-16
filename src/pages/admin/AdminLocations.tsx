import { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { locationService, type Location } from '@/services/api';
import { toast } from 'sonner';
import {
    MapPin,
    Search,
    Plus,
    Edit2,
    Trash2,
    Route,
    ImageIcon,
    Loader2
} from 'lucide-react';

const AdminLocations = () => {
    const [locations, setLocations] = useState<Location[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        province: '',
        routes: '',
        image: '',
        description: ''
    });

    const fetchLocations = async () => {
        setIsLoading(true);
        try {
            const response = await locationService.getLocations({
                search: searchQuery,
                page: 0,
                size: 100
            });
            setLocations(response.data.content);
        } catch (error) {
            console.error('Error fetching locations:', error);
            // If API fails, use mock data as fallback for UI demo
            const { mockDestinations } = await import('@/data/mockDestinations');
            const mappedMocks: Location[] = mockDestinations.map((d, i) => ({
                id: `mock-${i}`,
                name: d.name,
                province: d.province,
                routes: d.routes,
                image: d.image,
                description: 'Mô tả mẫu cho địa điểm này.',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            }));
            setLocations(mappedMocks);
            // toast.error('Không thể tải danh sách địa điểm');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchLocations();
    }, []);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        fetchLocations();
    };

    const openAddDialog = () => {
        setSelectedLocation(null);
        setFormData({ name: '', province: '', routes: '', image: '', description: '' });
        setIsDialogOpen(true);
    };

    const openEditDialog = (location: Location) => {
        setSelectedLocation(location);
        setFormData({
            name: location.name,
            province: location.province,
            routes: location.routes,
            image: location.image,
            description: location.description || ''
        });
        setIsDialogOpen(true);
    };

    const openDeleteDialog = (location: Location) => {
        setSelectedLocation(location);
        setIsDeleteDialogOpen(true);
    };

    const handleSubmit = async () => {
        if (!formData.name || !formData.province || !formData.routes || !formData.image) {
            toast.error('Vui lòng điền đầy đủ các trường bắt buộc');
            return;
        }

        try {
            if (selectedLocation) {
                await locationService.updateLocation(selectedLocation.id, formData);
                toast.success('Cập nhật địa điểm thành công');
            } else {
                await locationService.createLocation(formData);
                toast.success('Thêm địa điểm thành công');
            }
            setIsDialogOpen(false);
            fetchLocations();
        } catch (error) {
            console.error('Save location error:', error);
            toast.error('Có lỗi xảy ra khi lưu địa điểm');
        }
    };

    const handleDelete = async () => {
        if (!selectedLocation) return;

        try {
            await locationService.deleteLocation(selectedLocation.id);
            toast.success('Xóa địa điểm thành công');
            setIsDeleteDialogOpen(false);
            fetchLocations();
        } catch (error) {
            console.error('Delete location error:', error);
            toast.error('Có lỗi xảy ra khi xóa địa điểm');
        }
    };

    return (
        <AdminLayout>
            <div className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-foreground">Quản lý địa điểm</h1>
                        <p className="text-muted-foreground">
                            Quản lý danh sách các địa điểm trekking, hình ảnh và thông báo
                        </p>
                    </div>
                    <Button onClick={openAddDialog} className="flex items-center gap-2">
                        <Plus className="h-4 w-4" />
                        Thêm địa điểm
                    </Button>
                </div>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                        <CardTitle>Danh sách địa điểm</CardTitle>
                        <form onSubmit={handleSearch} className="relative w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Tìm kiếm địa điểm..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-9"
                            />
                        </form>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <div className="flex flex-col items-center justify-center py-12">
                                <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
                                <p className="text-muted-foreground">Đang tải danh sách địa điểm...</p>
                            </div>
                        ) : locations.length === 0 ? (
                            <div className="text-center py-12 text-muted-foreground">
                                <MapPin className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                <p>Không tìm thấy địa điểm nào</p>
                            </div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Địa điểm</TableHead>
                                        <TableHead>Số tuyến</TableHead>
                                        <TableHead>Ngày tạo</TableHead>
                                        <TableHead className="text-right">Thao tác</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {locations.map((location) => (
                                        <TableRow key={location.id}>
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    <div className="h-10 w-16 rounded overflow-hidden bg-muted">
                                                        <img
                                                            src={location.image}
                                                            alt={location.name}
                                                            className="w-full h-full object-cover"
                                                            onError={(e) => {
                                                                (e.target as HTMLImageElement).src = 'https://placehold.co/400x300?text=No+Image';
                                                            }}
                                                        />
                                                    </div>
                                                    <div>
                                                        <p className="font-medium">{location.name}</p>
                                                        <p className="text-xs text-primary font-medium">{location.province}</p>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-1.5 text-muted-foreground">
                                                    <Route className="h-4 w-4" />
                                                    {location.routes}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <p className="text-sm text-muted-foreground">
                                                    {new Date(location.createdAt).toLocaleDateString('vi-VN')}
                                                </p>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => openEditDialog(location)}
                                                    >
                                                        <Edit2 className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                                        onClick={() => openDeleteDialog(location)}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Add/Edit Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>{selectedLocation ? 'Chỉnh sửa địa điểm' : 'Thêm địa điểm mới'}</DialogTitle>
                        <DialogDescription>
                            Nhập thông tin chi tiết địa điểm bên dưới. Nhấn lưu khi hoàn tất.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <label htmlFor="name" className="text-sm font-medium">Tên địa điểm *</label>
                            <Input
                                id="name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="VD: Fansipan, Mù Cang Chải..."
                            />
                        </div>
                        <div className="grid gap-2">
                            <label htmlFor="province" className="text-sm font-medium">Tỉnh / Thành phố *</label>
                            <Input
                                id="province"
                                value={formData.province}
                                onChange={(e) => setFormData({ ...formData, province: e.target.value })}
                                placeholder="VD: Lào Cai, Yên Bái..."
                            />
                        </div>
                        <div className="grid gap-2">
                            <label htmlFor="routes" className="text-sm font-medium">Thông tin tuyến đường *</label>
                            <Input
                                id="routes"
                                value={formData.routes}
                                onChange={(e) => setFormData({ ...formData, routes: e.target.value })}
                                placeholder="VD: 15 cung đường"
                            />
                        </div>
                        <div className="grid gap-2">
                            <label htmlFor="image" className="text-sm font-medium">Link hình ảnh *</label>
                            <div className="flex gap-2">
                                <Input
                                    id="image"
                                    value={formData.image}
                                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                                    placeholder="https://images.unsplash.com/..."
                                />
                                <div className="h-10 w-10 flex-shrink-0 border rounded bg-muted flex items-center justify-center overflow-hidden">
                                    {formData.image ? (
                                        <img src={formData.image} className="w-full h-full object-cover" alt="Preview" />
                                    ) : (
                                        <ImageIcon className="h-5 w-5 text-muted-foreground" />
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="grid gap-2">
                            <label htmlFor="description" className="text-sm font-medium">Mô tả</label>
                            <Textarea
                                id="description"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                placeholder="Nhập mô tả về địa điểm..."
                                rows={4}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Hủy</Button>
                        <Button onClick={handleSubmit}>Lưu thay đổi</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Xác nhận xóa</DialogTitle>
                        <DialogDescription>
                            Bạn có chắc chắn muốn xóa địa điểm "{selectedLocation?.name}"? Hành động này không thể hoàn tác.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Hủy</Button>
                        <Button variant="destructive" onClick={handleDelete}>Xóa địa điểm</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AdminLayout>
    );
};

export default AdminLocations;
