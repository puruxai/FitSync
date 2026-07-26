// FitSync Hook: useLazyLoad
// Detects visibility status of heavy UI nodes using browser IntersectionObserver API

import { useState, useEffect, useRef } from 'react';

export const useLazyLoad = (options?: IntersectionObserverInit) => {
  const [isVisible, setIsVisible] = useState(false);
  const elementRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const el = elementRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsVisible(true);
        observer.unobserve(el); // Only trigger load once
      }
    }, options);

    observer.observe(el);
    return () => {
      if (el) observer.unobserve(el);
    };
  }, [options]);

  return [elementRef, isVisible] as const;
};

export default useLazyLoad;
