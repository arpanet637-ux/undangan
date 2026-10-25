import { AdminLayout } from '@/components/admin/admin-layout'
import { AdminGallery } from '@/components/admin/admin-gallery'

export default async function AdminGalleryPage({ params }: { params: Promise<{ adminCode: string }> }) {
  const { adminCode } = await params
  return (
    <AdminLayout adminCode={adminCode}>
      <AdminGallery adminCode={adminCode} />
    </AdminLayout>
  )
}
