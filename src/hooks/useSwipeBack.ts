import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

interface SwipeBackOptions {
  threshold?: number; // Minimum distance for swipe to be considered
  velocityThreshold?: number; // Minimum velocity for swipe to be considered
}

export const useSwipeBack = (options: SwipeBackOptions = {}) => {
  const router = useRouter();
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  const touchStartTime = useRef(0);
  
  const { 
    threshold = 50, 
    velocityThreshold = 0.3 
  } = options;

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleTouchStart = (e: TouchEvent) => {
      touchStartX.current = e.touches[0].clientX;
      touchStartY.current = e.touches[0].clientY;
      touchStartTime.current = Date.now();
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (!touchStartX.current) return;

      const touchEndX = e.changedTouches[0].clientX;
      const touchEndY = e.changedTouches[0].clientY;
      const touchEndTime = Date.now();

      const deltaX = touchEndX - touchStartX.current;
      const deltaY = Math.abs(touchEndY - touchStartY.current);
      const deltaTime = touchEndTime - touchStartTime.current;
      
      // Calculate velocity (pixels per millisecond)
      const velocity = Math.abs(deltaX) / deltaTime;

      // Check if it's a right swipe (positive deltaX)
      // and meets our threshold and velocity requirements
      // Also ensure vertical movement is minimal (to distinguish from scroll)
      if (
        deltaX > threshold && 
        velocity > velocityThreshold && 
        deltaY < threshold / 2
      ) {
        // Navigate back
        router.back();
      }

      // Reset touch start position
      touchStartX.current = 0;
    };

    // Add event listeners
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });

    // Cleanup event listeners
    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [router, threshold, velocityThreshold]);
};