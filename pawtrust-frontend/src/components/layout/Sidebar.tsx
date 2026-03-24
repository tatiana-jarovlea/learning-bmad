import { NavLink } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

type Role = 'buyer' | 'breeder' | 'sitter' | 'admin'

type NavItem = { label: string; to: string }

function useSidebarItems(role: Role, t: (key: string, fallback: string) => string): NavItem[] {
  switch (role) {
    case 'buyer':
      return [
        { label: t('buyer.sidebar.inquiries', 'My Inquiries'), to: '/buyer/inquiries' },
        { label: t('buyer.sidebar.reviews', 'My Reviews'), to: '/buyer/reviews' },
      ]
    case 'breeder':
      return [
        { label: t('breeder.sidebar.my_listings', 'My Listings'), to: '/breeder/listings' },
        {
          label: t('breeder.sidebar.incoming_inquiries', 'Incoming Inquiries'),
          to: '/breeder/inquiries',
        },
        { label: t('breeder.sidebar.verification', 'Verification'), to: '/breeder/verification' },
        { label: t('breeder.sidebar.documents', 'Documents'), to: '/breeder/documents' },
      ]
    case 'sitter':
      return [
        { label: t('sitter.sidebar.my_profile', 'My Profile'), to: '/sitter/profile' },
        {
          label: t('sitter.sidebar.publish_listing', 'Publish Listing'),
          to: '/sitter/listing/new',
        },
      ]
    case 'admin':
      return [
        {
          label: t('admin.sidebar.verification_queue', 'Verification Queue'),
          to: '/admin/verification',
        },
        { label: t('admin.sidebar.users', 'Users'), to: '/admin/users' },
        { label: t('admin.sidebar.listings', 'Listings'), to: '/admin/listings' },
      ]
  }
}

const activeClass = 'bg-blue-50 text-blue-700 font-medium'
const idleClass = 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'

export function Sidebar({ role }: { role: Role }) {
  const { t } = useTranslation()
  const items = useSidebarItems(role, t)

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-56 shrink-0 border-r border-gray-200 bg-white">
        <nav className="flex flex-col p-3 gap-1">
          {items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `px-3 py-2 rounded-md text-sm ${isActive ? activeClass : idleClass}`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Mobile tab bar */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex z-40">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex-1 flex flex-col items-center py-2 text-xs ${isActive ? 'text-blue-600 font-medium' : 'text-gray-500'}`
            }
          >
            <span className="w-5 h-5 mb-0.5">•</span>
            <span className="truncate max-w-[3.5rem]">{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </>
  )
}
