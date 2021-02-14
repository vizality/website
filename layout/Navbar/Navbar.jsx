import { AnimateSharedLayout, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

import Icon from '@components/Icon';

import NavItem from './NavItem';

export default function Navbar () {
  const router = useRouter();
  const routes = [ 'Plugins', 'Themes', 'Docs', 'Learn', 'About', 'FAQ' ];
  const [ selected, setSelected ] = useState(router?.pathname);

  useEffect(() => {
    const handleRouteChange = url => setSelected(url);
    router.events.on('routeChangeStart', handleRouteChange);
    return () => router.events.off('routeChangeStart', handleRouteChange);
  }, []);

  return (
    <>
      {/* // @todo Remove this check after coming soon is over. */}
      {router.pathname === '/'
        ? null
        : (
          <nav className='vz-nav-wrapper'>
            <div className='vz-nav'>
              <div className='vz-nav-logo'>
                <Link href='/'>
                  <a>
                    Home
                    <Icon name='Vizality' size='50' />
                  </a>
                </Link>
              </div>
              <AnimateSharedLayout>
                <ul className='vz-nav-ul'>
                  <AnimatePresence>
                    {routes.map(route => {
                      const isSelected = selected.startsWith(`/${route.toLowerCase()}`) || (selected === '/' && route === 'Home');
                      const r = route === 'Home' ? '/' : `/${route.toLowerCase()}`;
                      return (
                        <Link key={route.toLowerCase()} href={r} passHref>
                          <NavItem
                            key={route.toLowerCase()}
                            route={route}
                            isSelected={isSelected}
                          />
                        </Link>
                      );
                    })}
                  </AnimatePresence>
                </ul>
              </AnimateSharedLayout>
            </div>
          </nav>
        )
      }
    </>
  );
}
