import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { auth } from '../firebase'
import { signOut } from 'firebase/auth'
import { Menu, X, ChevronDown } from 'lucide-react'
import { Button } from './ui/Button'

type User = {
  uid: string
  displayName?: string
}

const navItems = [
  { label: '인사말', path: '/greetings' },
  { label: '120주년 전야제', path: '/festival' },
  { label: '신청조회', path: '/check' },
  { label: '오시는 길', path: '/directions' },
  { label: '120주년 자료', path: '/materials' },
  { label: '총동문회 소개', path: '/alumni' },
]

export default function Header() {
  const [user, setUser] = useState<User | null>(auth.currentUser as any)
  const navigate = useNavigate()
  const location = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser as any)
    })
    return () => unsubscribe()
  }, [])

  const handleLogout = async () => {
    try {
      await signOut(auth)
      navigate('/')
    } catch (error) {
      console.error('로그아웃 실패:', error)
    }
  }

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/'
    }
    return location.pathname.startsWith(path)
  }

  const NavLink = ({ item }: { item: typeof navItems[0] }) => (
    <div
      className="relative"
      onMouseEnter={() => setOpenDropdown(item.path)}
      onMouseLeave={() => setOpenDropdown(null)}
    >
      <Link
        to={item.path}
        className={`px-4 py-2 rounded-lg transition-colors font-medium ${isActive(item.path)
          ? 'bg-sookmyung-blue-600 text-white'
          : 'text-gray-700 hover:bg-sookmyung-blue-50 hover:text-sookmyung-blue-600'
          }`}
      >
        {item.label}
      </Link>
    </div>
  )

  // Desktop navigation
  const DesktopNav = (
    <div className="hidden lg:flex items-center gap-4 xl:gap-8 ml-8">
      {navItems.map((item) => (
        <NavLink key={item.path} item={item} />
      ))}
    </div>
  )

  // Mobile drawer
  const MobileDrawer = (
    <div className={`lg:hidden fixed inset-0 z-50 transform ${mobileOpen ? 'translate-x-0' : 'translate-x-full'} transition-transform duration-300`}>
      <div className="absolute inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
      <div className="absolute right-0 top-0 h-full w-80 bg-white flex flex-col shadow-xl">
        <div className="flex items-center justify-between px-4 py-4 border-b bg-sookmyung-blue-600">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-white text-sookmyung-blue-600 flex items-center justify-center font-bold rounded-sm">
              <img src="/emblem1.png" alt="로고" className="h-6 w-auto" />
            </div>
            <span className="text-white font-medium">메뉴</span>
          </div>
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setMobileOpen(false)}
            className="p-2 rounded hover:bg-white/20 text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`block px-4 py-3 rounded-lg transition-colors ${isActive(item.path)
                ? 'bg-sookmyung-blue-600 text-white'
                : 'text-gray-700 hover:bg-sookmyung-blue-50'
                }`}
              onClick={() => setMobileOpen(false)}
            >
              {item.label}
            </Link>
          ))}
          <div className="border-t my-4" />
          {user && (
            <Link
              to="/mypage"
              className={`block px-4 py-3 rounded-lg transition-colors ${isActive('/mypage')
                ? 'bg-sookmyung-blue-600 text-white'
                : 'text-gray-700 hover:bg-sookmyung-blue-50'
                }`}
              onClick={() => setMobileOpen(false)}
            >
              마이페이지
            </Link>
          )}
        </nav>
        <div className="p-4 border-t bg-gray-50">
          {user ? (
            <div className="space-y-3">
              <Link to="/mypage" onClick={() => setMobileOpen(false)}>
                <Button variant="primary" fullWidth>마이페이지</Button>
              </Link>
              <button
                onClick={() => {
                  handleLogout()
                  setMobileOpen(false)
                }}
                type="button"
                className="w-full px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                로그아웃
              </button>
            </div>
          ) : (
            <Link to="/application" onClick={() => setMobileOpen(false)}>
              <Button variant="primary" fullWidth aria-label="참가신청">참가신청</Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  )

  return (
    <header className="bg-white shadow-md sticky top-0 z-50 border-b-4 border-sookmyung-blue-600">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center shrink-0 pr-4 md:pr-8">
          <img
            src="/emblem2.png"
            alt="숙명여자대학교 120주년 엠블럼"
            className="h-10 md:h-10 w-auto object-contain"
          />
        </Link>

        {/* Desktop nav */}
        {DesktopNav}

        {/* CTA Button on the right */}
        <div className="hidden lg:flex items-center gap-4">
          {user ? (
            <>
              <Link to="/mypage"><Button variant="primary">마이페이지</Button></Link>
              <button
                onClick={handleLogout}
                type="button"
                className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                로그아웃
              </button>
            </>
          ) : (
            <Link to="/application">
              <Button variant="primary" aria-label="참가신청">참가신청</Button>
            </Link>
          )}
        </div>

        {/* Mobile hamburger */}
        <div className="lg:hidden flex items-center">
          <button
            type="button"
            aria-label="Open menu"
            onClick={() => setMobileOpen(true)}
            className="p-2 rounded hover:bg-sookmyung-blue-50 text-sookmyung-blue-600"
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </div>

      {MobileDrawer}

      {/* Auth actions (logout) keep existing behavior */}
      <div className="sr-only" aria-live="polite">{location.pathname}</div>
    </header>
  )
}
