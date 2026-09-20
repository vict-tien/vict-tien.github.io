import { NAV, identity } from '../content';

/** Board 3A: the rail collapses into a header plus a bottom index bar. */
export function MobileHeader() {
  return (
    <header className="mhead">
      <div className="mhead__row">
        <span className="mhead__name">
          <b>
            {identity.firstName} {identity.lastName}
          </b>
          <span className="mhead__disciplines">{identity.disciplines.join(' · ')}</span>
        </span>
        {identity.availability && (
          <span className="mhead__status">
            <span className="dot" aria-hidden="true" />
            {identity.availability.short}
          </span>
        )}
      </div>
    </header>
  );
}

interface TabBarProps {
  active: number;
  onNav: (index: number) => void;
}

export function TabBar({ active, onNav }: TabBarProps) {
  return (
    <nav className="tabbar" aria-label="Sections">
      {NAV.map((item, i) => (
        <button
          key={item.id}
          type="button"
          className="tabbar__item"
          aria-current={active === i}
          onClick={() => onNav(i)}
        >
          <span className="tabbar__num" aria-hidden="true">
            {item.num}
          </span>
          {item.short}
        </button>
      ))}
    </nav>
  );
}
