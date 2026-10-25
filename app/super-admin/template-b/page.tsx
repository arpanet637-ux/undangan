import { TemplateProjects } from '@/components/super-admin/template-projects'

export const metadata = {
  title: 'Template B - Super Admin Dashboard',
}

export default function TemplateBPage() {
  return (
    <TemplateProjects
      templateId="template-b"
      templateName="Template B (Dark Mode)"
      templateColor="bg-blue-500 text-white hover:bg-blue-600"
      templateDescription="Daftar project undangan dengan desain dark mode"
    />
  )
}
