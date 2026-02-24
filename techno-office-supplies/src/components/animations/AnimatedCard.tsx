"use client";

import { forwardRef, useEffect, useImperativeHandle, useRef, ReactNode } from "react";
import gsap from "gsap";

export interface AnimatedCardHandle {
    /** Call before removing item from state — plays exit animation then calls onComplete */
    triggerExit: (onComplete: () => void) => void;
}

interface AnimatedCardProps {
    children: ReactNode;
    /** Position in the list — drives stagger delay on mount entrance */
    index?: number;
    /** When true, skips stagger and plays a pop-in instead (newly created item) */
    isNew?: boolean;
    className?: string;
}

export const AnimatedCard = forwardRef<AnimatedCardHandle, AnimatedCardProps>(
    ({ children, index = 0, isNew = false, className }, ref) => {
        const cardRef = useRef<HTMLDivElement>(null);

        // ── Entrance animation on mount ───────────────────────────────────────
        useEffect(() => {
            const el = cardRef.current;
            if (!el) return;

            if (isNew) {
                // Pop-in for freshly created cards
                gsap.fromTo(el,
                    { scale: 0.75, opacity: 0, y: 16 },
                    { scale: 1, opacity: 1, y: 0, duration: 0.5, ease: "back.out(1.6)" }
                );
            } else {
                // Stagger slide-up entrance — delay grows with index
                const delay = Math.min(index * 0.055, 0.8); // cap at 0.8s for long lists
                gsap.fromTo(el,
                    { opacity: 0, y: 28 },
                    { opacity: 1, y: 0, duration: 0.45, delay, ease: "power2.out" }
                );
            }
            // eslint-disable-next-line react-hooks/exhaustive-deps
        }, []); // only on mount

        // ── Exit animation (called by parent before removing from store) ───────
        useImperativeHandle(ref, () => ({
            triggerExit(onComplete) {
                const el = cardRef.current;
                if (!el) { onComplete(); return; }
                gsap.to(el, {
                    x: 40,
                    opacity: 0,
                    scale: 0.94,
                    duration: 0.28,
                    ease: "power2.in",
                    onComplete,
                });
            },
        }));

        return (
            <div ref={cardRef} className={className} style={{ opacity: 0 }}>
                {children}
            </div>
        );
    }
);

AnimatedCard.displayName = "AnimatedCard";
