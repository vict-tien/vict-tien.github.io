import { useState } from 'react';
import { IS_PLACEHOLDER, identity } from '../content';

/**
 * Honest label on the front of the site: every word of the content is filler
 * from the design mockup. Disappears on its own once you set IS_PLACEHOLDER to
 * false in src/content.ts.
 */
export function PlaceholderFlag() {
  const [dismissed, setDismissed] = useState(false);

  if (!IS_PLACEHOLDER || dismissed) return null;

  const name = `${identity.firstName} ${identity.lastName}`;

  return (
    <div className="flag" role="note">
      <span className="flag__tag">PLACEHOLDER</span>
      <span className="flag__text">
        <span className="flag__long">
          <b>{name}</b> is a fictional persona from the design mockup — every name, number and
          case study here is invented. Replace them in <code>src/content.ts</code>.
        </span>
        <span className="flag__short">
          Demo content — <b>{name}</b> is not a real person.
        </span>
      </span>
      <button
        type="button"
        className="flag__dismiss"
        onClick={() => setDismissed(true)}
        aria-label="Dismiss placeholder notice"
      >
        ✕
      </button>
    </div>
  );
}
