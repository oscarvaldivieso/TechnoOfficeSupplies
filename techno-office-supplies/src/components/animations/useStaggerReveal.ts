import { useEffect, useRef } from "react";
import gsap from "gsap";

interface UseStaggerRevealOptions {
    /** Set to true while data is still loading — animation fires once this becomes false */
    loading: boolean;
    /** Stagger delay between each child (seconds). Default 0.06 */
    stagger?: number;
    /** Y offset to start from (px). Default 30 */
    yFrom?: number;
    /** Animation duration (seconds). Default 0.45 */
    duration?: number;
}

/**
 * Animates the direct children of `containerRef` with a stagger entrance
 * once `loading` flips from true → false.
 *
 * Usage:
 *   const gridRef = useStaggerReveal({ loading: isLoading });
 *   <div ref={gridRef}> ... cards ... </div>
 */
export function useStaggerReveal({
    loading,
    stagger = 0.06,
    yFrom = 30,
    duration = 0.45,
}: UseStaggerRevealOptions) {
    const containerRef = useRef<HTMLDivElement>(null);
    const hasAnimated = useRef(false);

    useEffect(() => {
        // Only run once when loading transitions to false
        if (loading || hasAnimated.current) return;
        const container = containerRef.current;
        if (!container) return;

        const children = Array.from(container.children) as HTMLElement[];
        if (children.length === 0) return;

        // Set starting state
        gsap.set(children, { opacity: 0, y: yFrom });

        // Animate in with stagger
        gsap.to(children, {
            opacity: 1,
            y: 0,
            duration,
            stagger,
            ease: "power2.out",
            onComplete: () => {
                // Clean up inline styles so CSS can take over
                gsap.set(children, { clearProps: "transform,opacity" });
            },
        });

        hasAnimated.current = true;
    }, [loading, stagger, yFrom, duration]);

    return containerRef;
}
