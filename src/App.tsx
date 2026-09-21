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

/**
 * How each panel behaves when its content outgrows the viewport
 * (docs/DESIGN-SPEC-OVERFLOW.md §2). It rides on the panel as `data-mode`, so
 * the assignment is legible in the DOM as well as in the stylesheet.
 *
 *   fit    guaranteed one screenful; content budget in §5 of the spec
 *   flow   grows past the viewport, with a continuation affordance
 *   frame  holds one screenful and scrolls inside itself
 */
type PanelMode = 'fit' | 'flow' | 'frame';

const SECTIONS: { id: string; mode: PanelMode; render: () => ReactNode }[] = [
  { id: 'intro', mode: 'fit', render: () => <Intro /> },
  { id: 'cases', mode: 'frame', render: () => <CaseFiles /> },
  { id: 'about', mode: 'flow', render: () => <About /> },
  { id: 'experience', mode: 'flow', render: () => <Experience /> },
  { id: 'now', mode: 'flow', render: () => <Now /> },
  { id: 'contact', mode: 'fit', render: () => <Contact /> },
];

/** Module scope, so the dev-time overflow guard isn't handed a new array each render. */
const FIT_PANELS = SECTIONS.reduce<number[]>(
  (acc, section, i) => (section.mode === 'fit' ? [...acc, i] : acc),
  [],
);

export default function App() {
  const { paneRef, shellRef, registerPanel, active, goTo, overflowing } = useDossierNav(
    SECTIONS.length,
    FIT_PANELS,
  );

  return (
    <div className="app">
      <PlaceholderFlag />

      <div className="shell" ref={shellRef}>
        <MobileHeader />
        <Rail active={active} onNav={goTo} />

        <main className="pane" ref={paneRef}>
          {SECTIONS.map((section, i) => (
            <section
              key={section.id}
              id={section.id}
              ref={(el) => registerPanel(i, el)}
              className={`panel ${section.id}-panel`}
              data-mode={section.mode}
              data-overflow={overflowing[i] ? 'true' : 'false'}
              aria-label={NAV[i].label}
            >
              {section.render()}
            </section>
          ))}
        </main>

        {/* "Continued overleaf". Decorative — the content it points at is
            reached by scrolling, which needs no announcement. */}
        <div className="fold" aria-hidden="true">
          CONT. ↓
        </div>

        <TabBar active={active} onNav={goTo} />
      </div>
    </div>
  );
}
