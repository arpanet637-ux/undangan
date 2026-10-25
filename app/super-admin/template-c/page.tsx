import { TemplateProjects } from '@/components/super-admin/template-projects'

export const metadata = {
  title: 'Template C - Super Admin Dashboard',
}

export default function TemplateCPage() {
  return (
    <TemplateProjects
      templateId="template-c"
      templateName="Template C (Metatah Light)"
      templateColor="bg-emerald-500 text-white hover:bg-emerald-600"
      templateDescription="Daftar project undangan Metatah dengan desain light"
    />
  )
}
