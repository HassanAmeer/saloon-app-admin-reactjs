import React, { useState } from 'react';

const ImageWithFallback = ({
    src,
    alt,
    className,
    fallbackSrc = '/empty.png',
    fallbackClassName = "w-4/5 h-4/5 object-contain filter bg-tea-500",
    FallbackComponent,
    ...props
}) => {
    const [imgSrc, setImgSrc] = useState(src || (FallbackComponent ? null : fallbackSrc));
    const [isError, setIsError] = useState(!src);

    React.useEffect(() => {
        setImgSrc(src || (FallbackComponent ? null : fallbackSrc));
        setIsError(!src);
    }, [src, FallbackComponent, fallbackSrc]);

    const handleError = () => {
        if (!isError) {
            setImgSrc(FallbackComponent ? null : fallbackSrc);
            setIsError(true);
        }
    };

    if (isError && FallbackComponent) {
        return (
            <div className={fallbackClassName}>
                <FallbackComponent />
            </div>
        );
    }

    return (
        <img
            {...props}
            src={imgSrc}
            alt={alt}
            className={isError ? fallbackClassName : className}
            onError={handleError}
        />
    );
};

export default ImageWithFallback;
