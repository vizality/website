import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

import { Icon } from '@components';

import NavItem from './NavItem';

export default function Navbar () {
  const router = useRouter();
  const routes = [ 'Plugins', 'Themes', 'Docs', 'Learn', 'About', 'FAQ' ];
  const [ selected, setSelected ] = useState(router?.pathname);

  useEffect(() => {
    const handleRouteChange = url => {
      console.log(url);
      console.log(router?.pathname);
      setSelected(url);
    };
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
              <ul className='vz-nav-ul'>
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
              </ul>
            </div>
          </nav>
        )
      }
    </>
  );
}
