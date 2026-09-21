import { experience } from '../content';
import { useMediaQuery } from '../hooks/useMediaQuery';

/**
 * 04 / EXPERIENCE — parallel tracks.
 *
 *   phone / tablet  tracks stack, each one a labelled list
 *   landscape / up  tracks sit side by side, work on the left
 *
 * This is the section most likely to outgrow its panel: a working résumé runs
 * five to eight roles against the three that fit a 1024px board. So from 768px
 * up the résumé button is rendered into the section header rather than after
 * the tracks, where it would drift below the fold with them. It is rendered
 * once either way — two copies hidden by CSS would mean two identical controls
 * in the accessibility tree.
 */
function ResumeCta({ className }: { className: string }) {
  const { resumeUrl } = experience;

  if (resumeUrl) {
    return (
      <a className={className} href={resumeUrl} download>
        DOWNLOAD RÉSUMÉ →
      </a>
    );
  }

  return (
    <span
      className={className}
      aria-disabled="true"
      title="Add a PDF to public/ and set experience.resumeUrl in src/content.ts"
    >
      RÉSUMÉ — NOT WIRED UP YET
    </span>
  );
}

export function Experience() {
  const { tracks } = experience;
  const wide = useMediaQuery('(min-width: 768px)');

  return (
    <>
      <div className="sechead">
        <h2>04 / EXPERIENCE</h2>
        {wide ? (
          <ResumeCta className="sechead__cta" />
        ) : (
          <span className="sechead__aside">RÉSUMÉ · PDF</span>
        )}
      </div>

      <div className="exp__tracks">
        {tracks.map((track) => (
          <section className="exp__track" key={track.key} aria-label={track.label}>
            <h3 className="exp__tracklabel">
              {track.label}
              {track.aside ? (
                <span className="exp__trackaside" aria-hidden="true">
                  {track.aside}
                </span>
              ) : null}
            </h3>

            <div className="exp__list">
              {track.entries.map((entry) => (
                <div className="exp__row" key={`${track.key}-${entry.org}-${entry.period}`}>
                  <span className="exp__period">{entry.period}</span>
                  <span className="exp__title">{entry.title}</span>
                  <span className="exp__org">{entry.org}</span>
                  {entry.meta ? <span className="exp__meta">{entry.meta}</span> : null}
                  {Array.isArray(entry.blurb) ? (
                    <ul className="exp__blurb exp__blurb--list">
                      {entry.blurb.map((line, i) => (
                        <li className="exp__line" key={i}>
                          {line}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <span className="exp__blurb">{entry.blurb}</span>
                  )}
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>

      {wide ? null : <ResumeCta className="exp__cta" />}
    </>
  );
}
