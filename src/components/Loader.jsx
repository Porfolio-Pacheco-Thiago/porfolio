import Logo from './ui/Logo';
import './Loader.css';

export default function Loader({ hidden }) {
    return (
        <div className={`loader ${hidden ? 'is-hidden' : ''}`} aria-hidden={hidden}>
            <Logo className="loader-logo" alt="" />
            <div className="loader-bar" />
        </div>
    );
}
