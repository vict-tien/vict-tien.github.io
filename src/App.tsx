import type { ReactNode } from 'react';
import { MobileHeader, TabBar } from './components/MobileChrome';
import { PlaceholderFlag } from './components/PlaceholderFlag';
import { Rail } from './components/Rail';
import { NAV } from './content';
import { useDossierNav } from './hooks/useDossierNav';
import { About } from './sections/About';
import { CaseFiles } from './sections/CaseFiles';
import { Contact } from './sections/Contact';
import { Experience } from './sections/Experience';
import { Intro } from './sections/Intro';
import { Now } from './sections/Now';

const SECTIONS: { id: string; dark?: boolean; render: () => ReactNode }[] = [
  { id: 'intro', render: () => <Intro /> },
  { id: 'cases', render: () => <CaseFiles /> },
  { id: 'about', render: () => <About /> },
  { id: 'experience', dark: true, render: () => <Experience /> },
  { id: 'now', render: () => <Now /> },
  { id: 'contact', render: () => <Contact /> },
];

export default function App() {
  const { paneRef, registerPanel, active, goTo } = useDossierNav(SECTIONS.length);

  return (
    <div className="app">
      <PlaceholderFlag />

      <div className="shell">
        <MobileHeader />
        <Rail active={active} onNav={goTo} />

        <main className="pane" ref={paneRef}>
          {SECTIONS.map((section, i) => (
            <section
              key={section.id}
              id={section.id}
              ref={(el) => registerPanel(i, el)}
              className={`panel${section.dark ? ' panel--dark' : ''} ${section.id}-panel`}
              aria-label={NAV[i].label}
            >
              {section.render()}
            </section>
          ))}
        </main>

        <TabBar active={active} onNav={goTo} />
      </div>
    </div>
  );
}
