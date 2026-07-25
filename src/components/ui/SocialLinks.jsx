import { socials } from '../../data/socials';

export default function SocialLinks({ className, style, size = 20 }) {
    return (
        <div className={className} style={style}>
            {socials.map(({ id, label, href, Icon }) => (
                <a
                    key={id}
                    href={href}
                    target={href.startsWith('mailto:') ? undefined : '_blank'}
                    rel="noopener noreferrer"
                    className="social-link"
                    aria-label={label}
                    title={label}
                >
                    <Icon size={size} />
                </a>
            ))}
        </div>
    );
}
