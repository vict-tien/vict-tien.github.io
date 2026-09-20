import { experience } from '../content';

export function Experience() {
  const { resumeUrl } = experience;

  return (
    <>
      <div className="sechead">
        <h2>04 / EXPERIENCE</h2>
        <span className="sechead__aside">RÉSUMÉ · PDF</span>
      </div>

      <div className="exp__list">
        {experience.roles.map((role) => (
          <div className="exp__row" key={role.org}>
            <span className="exp__period">{role.period}</span>
            <span className="exp__title">{role.title}</span>
            <span className="exp__org">{role.org}</span>
            <span className="exp__blurb">{role.blurb}</span>
          </div>
        ))}
      </div>

      {resumeUrl ? (
        <a className="exp__cta" href={resumeUrl} download>
          DOWNLOAD RÉSUMÉ →
        </a>
      ) : (
        <span
          className="exp__cta"
          aria-disabled="true"
          title="Add a PDF to public/ and set experience.resumeUrl in src/content.ts"
        >
          RÉSUMÉ — NOT WIRED UP YET
        </span>
      )}
    </>
  );
}
