import { NAV, identity } from '../content';

interface RailProps {
  active: number;
  onNav: (index: number) => void;
}

/** Persistent index rail — board 2A, narrowed for 3B and 3C. */
export function Rail({ active, onNav }: RailProps) {
  return (
    <aside className="rail">
      <div className="rail__top">
        <div className="rail__name">
          <b>
            {identity.firstName}
            <br />
            {identity.lastName}
          </b>
          <span className="rail__disciplines">{identity.disciplines}</span>
        </div>

        <nav className="rail__nav" aria-label="Sections">
          {NAV.map((item, i) => (
            <button
              key={item.id}
              type="button"
              className="rail__item"
              aria-current={active === i}
              onClick={() => onNav(i)}
            >
              <span>{item.label}</span>
              <span aria-hidden="true">{item.num}</span>
            </button>
          ))}
        </nav>
      </div>

      <div className="rail__foot">
        <span className="rail__available">
          <span className="dot" aria-hidden="true" />
          <span className="rsp-wide">{identity.availability}</span>
          <span className="rsp-narrow">{identity.availabilityCompact}</span>
        </span>
        <span>{identity.location}</span>
        <a className="rail__email" href={`mailto:${identity.email}`}>
          {identity.email}
        </a>
      </div>
    </aside>
  );
}
