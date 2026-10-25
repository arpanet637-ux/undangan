import { TemplateProjects } from '@/components/super-admin/template-projects'

export const metadata = {
  title: 'Template D - Super Admin Dashboard',
}

export default function TemplateDPage() {
  return (
    <TemplateProjects
      templateId="template-d"
      templateName="Template D (Metatah Dark)"
      templateColor="bg-violet-500 text-white hover:bg-violet-600"
      templateDescription="Daftar project undangan Metatah dengan desain dark"
    />
  )
}
