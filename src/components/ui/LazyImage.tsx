import { useState, useEffect, useRef } from 'react';
import { cn } from '../../lib/utils';
import { ImageIcon } from 'lucide-react';

interface LazyImageProps {
    src: string;
    alt: string;
    className?: string;
    placeholderClassName?: string;
    onClick?: () => void;
}

export function LazyImage({
    src,
    alt,
    className,
    placeholderClassName,
    onClick,
}: LazyImageProps) {
    const [isLoaded, setIsLoaded] = useState(false);
    const [isInView, setIsInView] = useState(false);
    const [hasError, setHasError] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const el = containerRef.current;
        if (!el) return;

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting) {
                    setIsInView(true);
                    observer.disconnect();
                }
            },
            { rootMargin: '50px', threshold: 0.01 }
        );

        observer.observe(el);
        return () => observer.disconnect();
    }, []);

    return (
        <div ref={containerRef} className={cn('relative overflow-hidden w-full h-full', className)}>
            {/* 로딩 플레이스홀더 */}
            {!isLoaded && !hasError && (
                <div className={cn('absolute inset-0 animate-pulse bg-gray-200', placeholderClassName)} />
            )}

            {/* 에러 상태 */}
            {hasError && (
                <div className={cn('absolute inset-0 flex flex-col items-center justify-center bg-gray-100 text-gray-400', placeholderClassName)}>
                    <ImageIcon className="w-8 h-8 mb-1" />
                    <span className="text-xs">이미지 없음</span>
                </div>
            )}

            {/* 실제 이미지 - 뷰포트 진입 시에만 로드 */}
            {isInView && !hasError && (
                <img
                    src={src}
                    alt={alt}
                    className={cn(
                        'absolute inset-0 w-full h-full object-cover transition-opacity duration-300',
                        isLoaded ? 'opacity-100' : 'opacity-0'
                    )}
                    onLoad={() => setIsLoaded(true)}
                    onError={() => setHasError(true)}
                    onClick={onClick}
                />
            )}
        </div>
    );
}
