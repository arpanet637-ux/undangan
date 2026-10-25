// TEMPORARY: login check removed for testing. Restore the session redirect before production.
export default function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
