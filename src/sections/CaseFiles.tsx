import { useState } from 'react';
import { Plate } from '../components/Plate';
import { Stat } from '../components/Stat';
import { cases } from '../content';

/**
 * 02 / CASE FILES — master/detail.
 *
 *   phone           2×2 grid of cases, detail stacked underneath
 *   tablet portrait 4-across grid of cases, detail stacked underneath
 *   landscape / up  case list on the left, detail beside it
 */
export function CaseFiles() {
  const [selected, setSelected] = useState(0);
  const active = cases[selected];

  return (
    <>
      <div className="sechead">
        <h2>02 / CASE FILES</h2>
        <span className="sechead__aside">
          <span className="rsp-wide">SELECT A PROJECT</span>
          <span className="rsp-narrow">TAP A PROJECT</span>
        </span>
      </div>

      <div className="cases">
        <div className="caselist">
          {cases.map((item, i) => {
            const num = String(i + 1).padStart(2, '0');
            return (
              <button
                key={item.key}
                type="button"
                className="case"
                aria-pressed={selected === i}
                onClick={() => setSelected(i)}
              >
                <span className="case__idx" aria-hidden="true">
                  {num}
                </span>
                <span className="case__body">
                  <span className="case__meta">
                    {num} · {item.year}
                  </span>
                  <span className="case__name">{item.name}</span>
                  <span className="case__role">
                    {item.role}
                    <span className="case__role-year"> · {item.year}</span>
                  </span>
                </span>
              </button>
            );
          })}
        </div>

        <div className="detail">
          <Plate
            className="detail__plate"
            src={active.image}
            alt={active.imageAlt ?? `${active.name} — product still`}
            caption={`[ ${active.name.toUpperCase()} — PRODUCT STILL, 16:9 ]`}
          />

          <p className="detail__kicker">{active.kicker}</p>

          <dl className="detail__cols">
            <div className="detail__field">
              <dt>THE PROBLEM</dt>
              <dd>{active.problem}</dd>
            </div>
            <div className="detail__field">
              <dt>WHAT I DID</dt>
              <dd>{active.did}</dd>
            </div>
          </dl>

          <div className="detail__metrics">
            {active.metrics.map((metric) => (
              <Stat key={metric.label} value={metric.value} label={metric.label} />
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
