"use client";

import React, { Children, cloneElement, forwardRef, isValidElement, useEffect, useMemo, useRef } from 'react';
import gsap from 'gsap';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
    customClass?: string;
}

export const Card = forwardRef<HTMLDivElement, CardProps>(({ customClass, ...rest }, ref) => (
    <div ref={ref} {...rest} className={`gsap-card ${customClass ?? ''} ${rest.className ?? ''}`.trim()} />
));
Card.displayName = 'Card';

// Scale and Opacity decay factors
const SCALE_DECAY = 0.05; // 5% shrinkage per card
const OPACITY_DECAY = 0.15; // 15% opacity drop (brighter background cards)

const makeSlot = (i: number, distX: number, distY: number, total: number) => {
    // Determine visual index (0 = front, 1 = second, etc.)
    // i is the index in the current rotated order, so i=0 is front
    const scale = 1 - i * SCALE_DECAY;
    const opacity = i === 0 ? 1 : Math.max(0.1, 1 - i * OPACITY_DECAY);

    return {
        x: i * distX,
        y: i * distY, // Positive integer moves DOWN, matching the "Stack Down" direction
        z: 0, // Disable Z-translation to prevent double-scaling (use explicit scale prop instead)
        scale,
        opacity,
        zIndex: total - i
    };
};

const placeNow = (el: HTMLElement, slot: any, skew: number) =>
    gsap.set(el, {
        x: slot.x,
        y: slot.y,
        z: slot.z,
        scale: slot.scale,
        opacity: slot.opacity,
        xPercent: -50,
        yPercent: -50,
        skewY: skew,
        transformOrigin: 'center center',
        zIndex: slot.zIndex,
        force3D: true,
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' // Shadow on ALL cards for depth
    });

interface CardSwapProps {
    width?: number | string;
    height?: number | string;
    cardDistance?: number;
    verticalDistance?: number;
    delay?: number;
    pauseOnHover?: boolean;
    onCardClick?: (index: number) => void;
    skewAmount?: number;
    easing?: string;
    children: React.ReactNode;
}

const CardSwap = ({
    width = 500,
    height = 400,
    cardDistance = 60,
    verticalDistance = 70,
    delay = 2500,
    pauseOnHover = false,
    onCardClick,
    skewAmount = 6,
    easing = 'elastic',
    children
}: CardSwapProps) => {

    const config =
        easing === 'elastic'
            ? {
                ease: 'elastic.out(0.6,0.9)',
                durDrop: 2,
                durMove: 2,
                durReturn: 2,
                promoteOverlap: 0.9,
                returnDelay: 0.05
            }
            : {
                ease: 'power1.inOut',
                durDrop: 0.8,
                durMove: 0.8,
                durReturn: 0.8,
                promoteOverlap: 0.45,
                returnDelay: 0.2
            };

    const childArr = useMemo(() => Children.toArray(children), [children]);
    const refs = useMemo(
        () => childArr.map(() => React.createRef<HTMLDivElement>()),
        [childArr.length]
    ); // eslint-disable-next-line react-hooks/exhaustive-deps

    // Use map logic instead of Array.from to avoid any iteration/lib issues
    const order = useRef<number[]>(childArr.map((_, i) => i));

    const tlRef = useRef<gsap.core.Timeline | null>(null);
    const intervalRef = useRef<number | undefined>(undefined);
    const container = useRef<HTMLDivElement>(null);

    const executeSwap = (targetIndex?: number) => {
        // Logic for swapping front to back (cycling)
        if (order.current.length < 2) return;
        if (tlRef.current && tlRef.current.isActive()) return;

        const [front, ...rest] = order.current;

        // Ensure element exists
        const elFront = refs[front]?.current;
        if (!elFront) return;

        const tl = gsap.timeline();
        tlRef.current = tl;

        tl.to(elFront, {
            y: '+=500',
            duration: config.durDrop,
            ease: config.ease
        });

        tl.addLabel('promote', `-=${config.durDrop * config.promoteOverlap}`);
        rest.forEach((idx, i) => {
            const el = refs[idx]?.current;
            if (!el) return;
            const slot = makeSlot(i, cardDistance, verticalDistance, refs.length);
            tl.set(el, { zIndex: slot.zIndex }, 'promote');
            tl.to(
                el,
                {
                    x: slot.x,
                    y: slot.y,
                    z: slot.z,
                    scale: slot.scale,
                    opacity: slot.opacity,
                    duration: config.durMove,
                    ease: config.ease
                },
                `promote+=${i * 0.15}`
            );
        });

        const backSlot = makeSlot(refs.length - 1, cardDistance, verticalDistance, refs.length);
        tl.addLabel('return', `promote+=${config.durMove * config.returnDelay}`);
        tl.call(
            () => {
                gsap.set(elFront, { zIndex: backSlot.zIndex });
            },
            undefined,
            'return'
        );
        tl.to(
            elFront,
            {
                x: backSlot.x,
                y: backSlot.y,
                z: backSlot.z,
                scale: backSlot.scale,
                opacity: backSlot.opacity,
                duration: config.durReturn,
                ease: config.ease
            },
            'return'
        );

        tl.call(() => {
            order.current = [...rest, front];
        });
    };

    useEffect(() => {
        const total = refs.length;
        refs.forEach((r, i) => {
            if (r.current) placeNow(r.current, makeSlot(i, cardDistance, verticalDistance, total), skewAmount);
        });

        // Start auto swap
        const autoSwap = () => executeSwap();
        intervalRef.current = window.setInterval(autoSwap, delay);

        if (pauseOnHover) {
            const node = container.current;
            if (node) {
                const pause = () => {
                    clearInterval(intervalRef.current);
                };
                const resume = () => {
                    intervalRef.current = window.setInterval(autoSwap, delay);
                };
                node.addEventListener('mouseenter', pause);
                node.addEventListener('mouseleave', resume);
                return () => {
                    node.removeEventListener('mouseenter', pause);
                    node.removeEventListener('mouseleave', resume);
                    clearInterval(intervalRef.current);
                };
            }
        }
        return () => clearInterval(intervalRef.current);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [cardDistance, verticalDistance, delay, pauseOnHover, skewAmount, easing]);

    const rendered = childArr.map((child, i) => {
        if (!isValidElement(child)) return child;

        // Explicitly cast to any to allow accessing props/ref without strict checks
        // This resolves the TS errors about ref not existing on unknown type or child.props
        return cloneElement(child as any, {
            key: i,
            ref: refs[i],
            style: { width, height, ...((child.props as any).style ?? {}) },
            onClick: (e: React.MouseEvent) => {
                (child.props as any).onClick?.(e);
                onCardClick?.(i);

                // Interaction Logic:
                // If clicked card is NOT the front one (visual index 0), trigger a swap to cycle it forward.
                // We check current visual position
                const visualPos = order.current.indexOf(i);
                if (visualPos !== 0) {
                    // Reset timer and swap
                    clearInterval(intervalRef.current);
                    executeSwap();
                    // NOTE: A single swap brings the next card to front. If clicked card is further back, 
                    // it will take multiple swaps. But usually in a stack, users click the one behind 
                    // the current front. So single swap is usually sufficient and feels responsive.
                    intervalRef.current = window.setInterval(() => executeSwap(), delay);
                }
            }
        });
    });

    return (
        <div ref={container} className="card-swap-container" style={{ width, height }}>
            {rendered}
        </div>
    );
};

export default CardSwap;
