import { TemplateProjects } from '@/components/super-admin/template-projects'

export const metadata = {
  title: 'Template A - Super Admin Dashboard',
}

export default function TemplateAPage() {
  return (
    <TemplateProjects
      templateId="template-a"
      templateName="Template A (Light Mode)"
      templateColor="bg-amber-500 text-white hover:bg-amber-600"
      templateDescription="Daftar project undangan dengan desain light mode"
    />
  )
}
