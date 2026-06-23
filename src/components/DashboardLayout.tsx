'use client';

import { useState, useEffect, ReactNode } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  Compass, Heart, FileText, Bookmark, GitBranch, User as UserIcon, Settings, 
  Plus, Target, Flame, GitMerge, Database, Sun, Moon, ChevronDown, Bell, Search,
  Award, Sparkles
} from 'lucide-react';

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  
  const [sessionUser, setSessionUser] = useState<any>(null);
  const [recentMatches, setRecentMatches] = useState<any[]>([]);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [themeDropdownOpen, setThemeDropdownOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Initialize theme from localStorage and apply
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme as 'light' | 'dark');
    if (savedTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const handleThemeChange = (newTheme: 'light' | 'dark') => {
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    setThemeDropdownOpen(false);
  };

  // Fetch session details and matches
  const fetchSessionAndMatches = async () => {
    try {
      const sessionRes = await fetch('/api/auth/session');
      if (sessionRes.ok) {
        const sessionData = await sessionRes.json();
        if (sessionData.authenticated) {
          setSessionUser(sessionData.user);
        }
      }
      
      const matchesRes = await fetch('/api/matches');
      if (matchesRes.ok) {
        const matchesData = await matchesRes.json();
        setRecentMatches(matchesData.slice(0, 3)); // show top 3
      }
    } catch (err) {
      console.error('Error fetching layout data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessionAndMatches();
    
    // Listen for custom events to refresh stats on actions
    window.addEventListener('pathnameChange', fetchSessionAndMatches);
    window.addEventListener('xpUpdated', fetchSessionAndMatches);
    return () => {
      window.removeEventListener('pathnameChange', fetchSessionAndMatches);
      window.removeEventListener('xpUpdated', fetchSessionAndMatches);
    };
  }, [pathname]);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/');
      router.refresh();
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  // Safe JSON Parsing helper
  const parseJson = (str: string | null, fallback: any = []) => {
    if (!str) return fallback;
    try {
      return JSON.parse(str);
    } catch (e) {
      return fallback;
    }
  };

  // Navigation Links
  const navLinks = [
    { name: 'Discover', href: '/swipe', icon: Compass },
    { name: 'Matches', href: '/matches', icon: Heart },
    { name: 'Applications', href: '/matches', icon: FileText },
    { name: 'Saved', href: '/matches', icon: Bookmark },
    { name: 'My Contributions', href: '/profile', icon: GitBranch },
    { name: 'Profile', href: '/profile', icon: UserIcon },
    { name: 'Settings', href: '/profile', icon: Settings },
  ];

  const defaultUser = {
    username: 'johanliebert',
    name: 'Johan Liebert',
    avatarUrl: 'https://avatars.githubusercontent.com/u/583231?v=4',
    bio: 'Building annoying things and open sourcing them.',
    languages: JSON.stringify(['Python', 'FastAPI', 'Docker', 'PostgreSQL', 'Linux', 'AWS', 'CI/CD']),
    xp: 250,
    streak: 12,
    rank: 'Issue Hunter',
  };

  const user = sessionUser || defaultUser;
  const userLanguages = parseJson(user.languages, ['Python', 'FastAPI', 'Docker', 'PostgreSQL']);
  const userInterests = parseJson(user.interests, ['Frontend', 'Backend']);
  const allSkills = Array.from(new Set([...userLanguages, ...userInterests, 'Linux', 'AWS', 'CI/CD']));

  return (
    <div className="min-h-screen bg-dark-bg text-text-primary flex transition-colors duration-200">
      
      {/* 1. Left Sidebar */}
      <aside className="w-64 bg-dark-card border-r border-dark-border flex flex-col justify-between shrink-0 hidden lg:flex sticky top-0 h-screen p-5">
        <div className="space-y-6 overflow-y-auto pr-1">
          {/* Logo Brand */}
          <div className="flex items-center space-x-2 px-1">
            <div className="p-2 rounded-xl bg-brand-purple/10 text-brand-purple">
              <svg className="h-6 w-6 stroke-current" fill="none" viewBox="0 0 24 24" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
              </svg>
            </div>
            <div className="leading-tight">
              <h1 className="text-sm font-bold text-text-primary tracking-tight">Open Source</h1>
              <p className="text-lg font-black text-brand-purple tracking-tight leading-none">Tinder</p>
            </div>
          </div>

          {/* Navigation Menu */}
          <nav className="space-y-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href && (
                link.name === 'Discover' && pathname === '/swipe' ||
                link.name === 'Matches' && pathname === '/matches' ||
                link.name === 'Profile' && pathname === '/profile' ||
                link.name !== 'Discover' && link.name !== 'Matches' && link.name !== 'Profile'
              );
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-bold tracking-wide transition-all ${
                    isActive
                      ? 'bg-bg-highlight text-brand-purple'
                      : 'text-text-secondary hover:bg-bg-pill hover:text-text-primary'
                  }`}
                >
                  <Icon className={`h-4 w-4 ${isActive ? 'stroke-[2.5px]' : ''}`} />
                  <span>{link.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Add GitHub Button */}
          <Link
            href="/api/auth/github"
            className="flex items-center justify-center space-x-2 w-full py-3 rounded-xl bg-brand-purple hover:bg-brand-purple/90 text-white font-bold text-sm shadow-md transition-all active:scale-98"
          >
            <Plus className="h-4 w-4" />
            <span>Add GitHub</span>
          </Link>

          {/* Your Skills Card */}
          <div className="bg-dark-card border border-dark-border rounded-2xl p-4 space-y-3">
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider">Your Skills</h3>
              <Link href="/profile" className="text-xs font-bold text-brand-purple hover:underline">Edit</Link>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {allSkills.slice(0, 8).map((skill: any) => (
                <span
                  key={skill}
                  className="px-2.5 py-1 rounded-lg bg-bg-pill text-text-secondary text-[11px] font-semibold border border-dark-border/40"
                >
                  {skill}
                </span>
              ))}
              <Link
                href="/profile"
                className="px-2.5 py-1 rounded-lg bg-bg-pill text-brand-purple text-[11px] font-bold border border-dark-border/40 hover:underline"
              >
                + Add more
              </Link>
            </div>
          </div>

          {/* Your Stats Card */}
          <div className="bg-dark-card border border-dark-border rounded-2xl p-4 space-y-3">
            <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider">Your Stats</h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2 text-text-secondary text-xs font-bold">
                  <Target className="h-3.5 w-3.5 text-red-500" />
                  <span>Issues Solved</span>
                </div>
                <span className="text-xs font-black text-text-primary">47</span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2 text-text-secondary text-xs font-bold">
                  <GitMerge className="h-3.5 w-3.5 text-brand-purple" />
                  <span>PRs Merged</span>
                </div>
                <span className="text-xs font-black text-text-primary">23</span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2 text-text-secondary text-xs font-bold">
                  <Database className="h-3.5 w-3.5 text-blue-500" />
                  <span>Repositories</span>
                </div>
                <span className="text-xs font-black text-text-primary">8</span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2 text-text-secondary text-xs font-bold">
                  <Flame className="h-3.5 w-3.5 text-orange-500 fill-orange-500" />
                  <span>Streak</span>
                </div>
                <span className="text-xs font-black text-text-primary">{user.streak || 12} days</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Theme Dropdown */}
        <div className="relative pt-3 border-t border-dark-border">
          <button
            onClick={() => setThemeDropdownOpen(!themeDropdownOpen)}
            className="flex items-center justify-between w-full px-3 py-2 rounded-xl bg-bg-pill text-text-secondary hover:text-text-primary text-xs font-bold border border-dark-border/60 cursor-pointer transition-all"
          >
            <div className="flex items-center space-x-2">
              {theme === 'light' ? <Sun className="h-4 w-4 text-orange-500" /> : <Moon className="h-4 w-4 text-brand-purple" />}
              <span className="capitalize">{theme} Theme</span>
            </div>
            <ChevronDown className="h-3 w-3 opacity-60" />
          </button>

          {themeDropdownOpen && (
            <div className="absolute bottom-12 left-0 right-0 bg-dark-card border border-dark-border rounded-xl shadow-lg p-1.5 space-y-1 z-50">
              <button
                onClick={() => handleThemeChange('light')}
                className="flex items-center space-x-2 w-full px-2.5 py-2 rounded-lg hover:bg-bg-pill text-xs font-bold text-text-secondary hover:text-text-primary text-left"
              >
                <Sun className="h-4 w-4 text-orange-500" />
                <span>Light</span>
              </button>
              <button
                onClick={() => handleThemeChange('dark')}
                className="flex items-center space-x-2 w-full px-2.5 py-2 rounded-lg hover:bg-bg-pill text-xs font-bold text-text-secondary hover:text-text-primary text-left"
              >
                <Moon className="h-4 w-4 text-brand-purple" />
                <span>Dark</span>
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* 2. Middle Content Column */}
      <main className="flex-grow flex flex-col min-w-0">
        
        {/* Top Header Bar */}
        <header className="h-16 border-b border-dark-border bg-dark-card/85 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-40">
          {/* Mobile hamburger placeholder or spacer */}
          <div className="flex items-center lg:hidden">
            <span className="font-extrabold text-brand-purple">OS Tinder</span>
          </div>

          {/* Search bar inputs */}
          <div className="relative w-80 max-w-xs sm:max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-text-tertiary" />
            <input
              type="text"
              placeholder="Search projects, tech, or keywords..."
              className="w-full pl-9 pr-10 py-1.5 rounded-xl bg-bg-pill text-xs text-text-primary border border-dark-border focus:border-brand-purple outline-none transition-colors"
            />
            <span className="absolute right-3 top-1/2 transform -translate-y-1/2 px-1 py-0.5 rounded bg-dark-card border border-dark-border text-[9px] text-text-tertiary font-bold tracking-tight">
              ⌘ K
            </span>
          </div>

          {/* User Widgets */}
          <div className="flex items-center space-x-4">
            {/* Notification Bell */}
            <button className="relative p-2 rounded-xl text-text-secondary hover:text-text-primary hover:bg-bg-pill transition-all relative">
              <Bell className="h-4.5 w-4.5" />
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-brand-red ring-2 ring-dark-card" />
            </button>

            {/* Profile Avatar Widget */}
            <div className="relative">
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center space-x-2 p-1 rounded-full hover:bg-bg-pill transition-all cursor-pointer"
              >
                {user.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt={user.username}
                    className="h-8 w-8 rounded-full border border-dark-border"
                  />
                ) : (
                  <div className="h-8 w-8 rounded-full bg-brand-purple/10 text-brand-purple flex items-center justify-center font-bold text-xs">
                    {user.username[0]?.toUpperCase()}
                  </div>
                )}
                <ChevronDown className="h-3 w-3 text-text-tertiary hidden sm:block" />
              </button>

              {profileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-dark-card border border-dark-border rounded-xl shadow-lg py-1.5 space-y-1 z-50">
                  <div className="px-3 py-1.5 border-b border-dark-border mb-1">
                    <p className="text-xs font-bold text-text-primary">@{user.username}</p>
                    <p className="text-[10px] text-text-tertiary">{user.rank}</p>
                  </div>
                  <Link
                    href="/profile"
                    onClick={() => setProfileDropdownOpen(false)}
                    className="flex items-center space-x-2 w-full px-3 py-2 text-xs font-bold text-text-secondary hover:bg-bg-pill hover:text-text-primary text-left"
                  >
                    <UserIcon className="h-3.5 w-3.5" />
                    <span>My Profile</span>
                  </Link>
                  <Link
                    href="/matches"
                    onClick={() => setProfileDropdownOpen(false)}
                    className="flex items-center space-x-2 w-full px-3 py-2 text-xs font-bold text-text-secondary hover:bg-bg-pill hover:text-text-primary text-left"
                  >
                    <Heart className="h-3.5 w-3.5" />
                    <span>My Matches</span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-2 w-full px-3 py-2 text-xs font-bold text-brand-red hover:bg-brand-red/10 text-left border-t border-dark-border"
                  >
                    <span>Log Out</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Content Viewport */}
        <div className="flex-grow overflow-y-auto bg-dark-bg">
          {children}
        </div>
      </main>

      {/* 3. Right Sidebar Column */}
      <aside className="w-80 bg-dark-card border-l border-dark-border shrink-0 hidden xl:flex flex-col sticky top-0 h-screen p-5 space-y-5 overflow-y-auto">
        
        {/* Developer Profile card */}
        <div className="bg-dark-card border border-dark-border rounded-2xl p-4 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider">Your Developer Profile</h3>
            <Link href="/profile" className="text-xs font-bold text-brand-purple hover:underline flex items-center space-x-0.5">
              <span>View on GitHub</span>
              <svg className="h-3 w-3 stroke-current" fill="none" viewBox="0 0 24 24" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
              </svg>
            </Link>
          </div>

          <div className="flex items-start space-x-3">
            {user.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={user.username}
                className="h-12 w-12 rounded-full border border-dark-border"
              />
            ) : (
              <div className="h-12 w-12 rounded-full bg-brand-purple/10 text-brand-purple flex items-center justify-center font-bold text-sm">
                {user.username[0]?.toUpperCase()}
              </div>
            )}
            <div className="space-y-1 flex-grow">
              <div className="flex items-center space-x-1.5">
                <h4 className="text-sm font-bold text-text-primary">@{user.username}</h4>
                <span className="px-1.5 py-0.5 rounded bg-brand-purple text-white text-[9px] font-bold uppercase leading-none">
                  Pro
                </span>
              </div>
              <p className="text-[11px] text-brand-purple font-semibold">Full Stack Developer</p>
              <p className="text-[11px] text-text-secondary leading-normal">
                {user.bio || 'Building annoying things and open sourcing them.'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-3 border-t border-dark-border/60 pt-3 text-center gap-1">
            <div>
              <p className="text-sm font-black text-brand-purple">95%</p>
              <p className="text-[9px] text-text-tertiary uppercase font-bold">Match Score</p>
            </div>
            <div className="border-x border-dark-border/60">
              <p className="text-sm font-black text-brand-purple">Top 12%</p>
              <p className="text-[9px] text-text-tertiary uppercase font-bold">Rank</p>
            </div>
            <div>
              <p className="text-sm font-black text-brand-purple">{recentMatches.length || 23}</p>
              <p className="text-[9px] text-text-tertiary uppercase font-bold">Matches</p>
            </div>
          </div>
        </div>

        {/* Recent Matches card */}
        <div className="bg-dark-card border border-dark-border rounded-2xl p-4 space-y-3">
          <div className="flex justify-between items-center">
            <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider">Recent Matches</h3>
            <Link href="/matches" className="text-xs font-bold text-brand-purple hover:underline">View all</Link>
          </div>

          <div className="space-y-2.5">
            {recentMatches.length > 0 ? (
              recentMatches.map((match: any) => (
                <div key={match.savedId} className="flex justify-between items-center">
                  <div className="flex items-center space-x-2.5 truncate">
                    <div className="h-6.5 w-6.5 rounded-lg bg-black border border-dark-border flex items-center justify-center font-bold text-[10px] text-white shrink-0">
                      {match.issue.repository.owner[0]?.toUpperCase()}
                    </div>
                    <div className="truncate">
                      <p className="text-xs font-bold text-text-primary truncate">
                        {match.issue.repository.owner}/{match.issue.repository.name}
                      </p>
                      <p className="text-[10px] text-brand-green font-bold leading-none mt-0.5">98% match</p>
                    </div>
                  </div>
                  <Heart className="h-3.5 w-3.5 text-brand-green fill-brand-green shrink-0 cursor-pointer" />
                </div>
              ))
            ) : (
              <>
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-2.5">
                    <div className="h-6.5 w-6.5 rounded bg-black border border-dark-border flex items-center justify-center font-bold text-[9px] text-white shrink-0">▲</div>
                    <div>
                      <p className="text-xs font-bold text-text-primary">vercel/next.js</p>
                      <p className="text-[10px] text-brand-green font-bold">98% match</p>
                    </div>
                  </div>
                  <Heart className="h-3.5 w-3.5 text-brand-green fill-brand-green shrink-0" />
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-2.5">
                    <div className="h-6.5 w-6.5 rounded bg-black border border-dark-border flex items-center justify-center font-bold text-[9px] text-white shrink-0">⚗️</div>
                    <div>
                      <p className="text-xs font-bold text-text-primary">pallets/flask</p>
                      <p className="text-[10px] text-brand-green font-bold">92% match</p>
                    </div>
                  </div>
                  <Heart className="h-3.5 w-3.5 text-brand-green fill-brand-green shrink-0" />
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-2.5">
                    <div className="h-6.5 w-6.5 rounded bg-black border border-dark-border flex items-center justify-center font-bold text-[9px] text-white shrink-0">🛢️</div>
                    <div>
                      <p className="text-xs font-bold text-text-primary">tidb/tidb</p>
                      <p className="text-[10px] text-brand-green font-bold">89% match</p>
                    </div>
                  </div>
                  <Heart className="h-3.5 w-3.5 text-brand-green fill-brand-green shrink-0" />
                </div>
              </>
            )}
          </div>
        </div>

        {/* Activity Feed card */}
        <div className="bg-dark-card border border-dark-border rounded-2xl p-4 space-y-3">
          <div className="flex justify-between items-center">
            <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider">Activity Feed</h3>
            <Link href="/profile" className="text-xs font-bold text-brand-purple hover:underline">View all</Link>
          </div>

          <div className="space-y-3">
            <div className="flex items-start space-x-2.5 text-xs text-text-secondary leading-snug">
              <div className="p-1 rounded bg-brand-purple/10 text-brand-purple mt-0.5">
                <GitBranch className="h-3 w-3" />
              </div>
              <div>
                <p>You submitted a PR to <span className="font-bold text-text-primary">telegram/telegram</span></p>
                <p className="text-[10px] text-text-tertiary mt-0.5">2 hours ago</p>
              </div>
            </div>

            <div className="flex items-start space-x-2.5 text-xs text-text-secondary leading-snug">
              <div className="p-1 rounded bg-brand-green/10 text-brand-green mt-0.5">
                <GitMerge className="h-3 w-3" />
              </div>
              <div>
                <p>Your PR was merged in <span className="font-bold text-text-primary">codesandbox/sandpack</span></p>
                <p className="text-[10px] text-text-tertiary mt-0.5">1 day ago</p>
              </div>
            </div>

            <div className="flex items-start space-x-2.5 text-xs text-text-secondary leading-snug">
              <div className="p-1 rounded bg-blue-500/10 text-blue-500 mt-0.5">
                <svg className="h-3 w-3 fill-current" viewBox="0 0 24 24">
                  <path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 9h12v2H6V9zm8 5H6v-2h8v2zm4-6H6V6h12v2z"/>
                </svg>
              </div>
              <div>
                <p>You commented on <span className="font-bold text-text-primary">linux/kernel</span></p>
                <p className="text-[10px] text-text-tertiary mt-0.5">2 days ago</p>
              </div>
            </div>

            <div className="flex items-start space-x-2.5 text-xs text-text-secondary leading-snug">
              <div className="p-1 rounded bg-orange-500/10 text-orange-500 mt-0.5">
                <svg className="h-3 w-3 fill-current" viewBox="0 0 24 24">
                  <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
                </svg>
              </div>
              <div>
                <p>You starred <span className="font-bold text-text-primary">tailwindlabs/tailwindcss</span></p>
                <p className="text-[10px] text-text-tertiary mt-0.5">3 days ago</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tip Box */}
        <div className="p-4 rounded-2xl bg-bg-highlight border border-brand-purple/20 text-brand-purple space-y-1">
          <div className="flex items-center space-x-1.5">
            <Sparkles className="h-4 w-4" />
            <h4 className="text-xs font-extrabold uppercase tracking-wide">Tip</h4>
          </div>
          <p className="text-[11px] font-medium leading-relaxed">
            Be consistent! Regular contributions increase your match score and visibility to maintainers.
          </p>
        </div>
      </aside>

    </div>
  );
}
