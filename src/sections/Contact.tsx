import { contact, identity } from '../content';

export function Contact() {
  return (
    <>
      <div className="contact__main">
        <h2 className="eyebrow">06 / CONTACT</h2>

        <a className="contact__email" href={`mailto:${identity.email}`}>
          {identity.email}
        </a>

        <p className="prose contact__body">{contact.body}</p>

        <div className="contact__links">
          {contact.links.map((link) => (
            <a
              key={link.label}
              href={link.href}
              rel={link.href.startsWith('http') ? 'noreferrer' : undefined}
              target={link.href.startsWith('http') ? '_blank' : undefined}
            >
              {link.label}
            </a>
          ))}
        </div>
      </div>

      <div className="contact__foot">
        <span>{identity.footerLeft}</span>
        <span>{identity.footerRight}</span>
      </div>
    </>
  );
}
