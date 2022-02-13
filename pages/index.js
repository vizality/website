import { Canvas, Icon } from '@components';

export default function Home () {
  return (
    <>
      <Canvas />
      <main className='vz-app-wrapper'>
        <div
          className='vz-coming-soon-banner'
        >
          Coming Soon...
          <span className='vz-coming-soon-info'>
            Join our Discord server to get all of the latest community news, updates, previews, and become an alpha tester!
          </span>
        </div>
        <div className='vz-coming-soon'>
          <h1
            className='vz-coming-soon-logo'
          >
            <Icon size='100%' name='VizalityVZ' />
          </h1>
          <div
            className='vz-coming-soon-social-items'>
            <div className='vz-coming-soon-social-item'>
              <a href='https://invite.vizality.com'>
                Discord
                <Icon name='Discord' size='36' />
              </a>
            </div>
            <div className='vz-coming-soon-social-item'>
              <a href='https://github.com/vizality'>
                GitHub
                <Icon name='GitHub' size='36' />
              </a>
            </div>
            <div className='vz-coming-soon-social-item'>
              <a href='https://twitter.com/vizality'>
                Twitter
                <Icon name='Twitter' size='36' />
              </a>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
