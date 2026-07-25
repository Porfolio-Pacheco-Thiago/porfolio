import { FiImage } from 'react-icons/fi';

// Marcador de posición hasta conectar src/assets/media/<sección>/<id>/ con import.meta.glob
export default function GalleryPlaceholder({ className, count = 3 }) {
    return (
        <div className={className}>
            {Array.from({ length: count }, (_, i) => (
                <div key={i} className={`${className}-item`}>
                    <FiImage />
                </div>
            ))}
        </div>
    );
}
