import { now } from '../content';

export function Now() {
  return (
    <>
      <div className="sechead">
        <h2>05 / NOW</h2>
        <span className="sechead__aside">
          <span className="rsp-long">{now.updated}</span>
          <span className="rsp-short">{now.updatedShort}</span>
        </span>
      </div>

      <div className="now__list">
        {now.entries.map((entry) => (
          <div className="now__row" key={entry.label}>
            <span className="now__label">{entry.label}</span>
            <span className="now__value">{entry.value}</span>
          </div>
        ))}
      </div>
    </>
  );
}
