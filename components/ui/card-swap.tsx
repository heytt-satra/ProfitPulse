"use client";

import React, {
    Children,
    cloneElement,
    forwardRef,
    isValidElement,
    useCallback,
    useEffect,
    useMemo,
    useRef,
} from "react";
import gsap from "gsap";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
    customClass?: string;
}

export const Card = forwardRef<HTMLDivElement, CardProps>(({ customClass, ...rest }, ref) => (
    <div ref={ref} {...rest} className={`gsap-card ${customClass ?? ""} ${rest.className ?? ""}`.trim()} />
));
Card.displayName = "Card";

const SCALE_DECAY = 0.05;
const OPACITY_DECAY = 0.15;

interface Slot {
    x: number;
    y: number;
    z: number;
    scale: number;
    opacity: number;
    zIndex: number;
}

const makeSlot = (index: number, distX: number, distY: number, total: number): Slot => {
    const scale = 1 - index * SCALE_DECAY;
    const opacity = index === 0 ? 1 : Math.max(0.1, 1 - index * OPACITY_DECAY);

    return {
        x: index * distX,
        y: index * distY,
        z: 0,
        scale,
        opacity,
        zIndex: total - index,
    };
};

const placeNow = (element: HTMLElement, slot: Slot, skew: number) => {
    gsap.set(element, {
        x: slot.x,
        y: slot.y,
        z: slot.z,
        scale: slot.scale,
        opacity: slot.opacity,
        xPercent: -50,
        yPercent: -50,
        skewY: skew,
        transformOrigin: "center center",
        zIndex: slot.zIndex,
        force3D: true,
        boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
    });
};

interface CardSwapProps {
    width?: number | string;
    height?: number | string;
    cardDistance?: number;
    verticalDistance?: number;
    delay?: number;
    pauseOnHover?: boolean;
    onCardClick?: (index: number) => void;
    skewAmount?: number;
    easing?: "elastic" | "smooth";
    children: React.ReactNode;
}

interface SwappableCardProps {
    style?: React.CSSProperties;
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
    easing = "elastic",
    children,
}: CardSwapProps) => {
    const childArr = useMemo(() => Children.toArray(children), [children]);
    const containerRef = useRef<HTMLDivElement>(null);
    const orderRef = useRef<number[]>(childArr.map((_, index) => index));
    const timelineRef = useRef<gsap.core.Timeline | null>(null);
    const intervalRef = useRef<number | undefined>(undefined);

    const config = useMemo(
        () =>
            easing === "elastic"
                ? {
                      ease: "elastic.out(0.6,0.9)",
                      durDrop: 2,
                      durMove: 2,
                      durReturn: 2,
                      promoteOverlap: 0.9,
                      returnDelay: 0.05,
                  }
                : {
                      ease: "power1.inOut",
                      durDrop: 0.8,
                      durMove: 0.8,
                      durReturn: 0.8,
                      promoteOverlap: 0.45,
                      returnDelay: 0.2,
                  },
        [easing],
    );

    const getCards = useCallback(() => {
        if (!containerRef.current) {
            return [];
        }
        return Array.from(containerRef.current.querySelectorAll<HTMLElement>(".gsap-card"));
    }, []);

    const executeSwap = useCallback(() => {
        const cards = getCards();
        if (cards.length < 2) {
            return;
        }
        if (timelineRef.current?.isActive()) {
            return;
        }

        const [front, ...rest] = orderRef.current;
        const frontCard = cards[front];
        if (!frontCard) {
            return;
        }

        const timeline = gsap.timeline();
        timelineRef.current = timeline;

        timeline.to(frontCard, {
            y: "+=500",
            duration: config.durDrop,
            ease: config.ease,
        });

        timeline.addLabel("promote", `-=${config.durDrop * config.promoteOverlap}`);
        rest.forEach((index, visualIndex) => {
            const card = cards[index];
            if (!card) {
                return;
            }
            const slot = makeSlot(visualIndex, cardDistance, verticalDistance, cards.length);
            timeline.set(card, { zIndex: slot.zIndex }, "promote");
            timeline.to(
                card,
                {
                    x: slot.x,
                    y: slot.y,
                    z: slot.z,
                    scale: slot.scale,
                    opacity: slot.opacity,
                    duration: config.durMove,
                    ease: config.ease,
                },
                `promote+=${visualIndex * 0.15}`,
            );
        });

        const backSlot = makeSlot(cards.length - 1, cardDistance, verticalDistance, cards.length);
        timeline.addLabel("return", `promote+=${config.durMove * config.returnDelay}`);
        timeline.call(
            () => {
                gsap.set(frontCard, { zIndex: backSlot.zIndex });
            },
            undefined,
            "return",
        );
        timeline.to(
            frontCard,
            {
                x: backSlot.x,
                y: backSlot.y,
                z: backSlot.z,
                scale: backSlot.scale,
                opacity: backSlot.opacity,
                duration: config.durReturn,
                ease: config.ease,
            },
            "return",
        );
        timeline.call(() => {
            orderRef.current = [...rest, front];
        });
    }, [cardDistance, config, getCards, verticalDistance]);

    useEffect(() => {
        const containerNode = containerRef.current;
        if (!containerNode) {
            return;
        }

        const cards = getCards();
        orderRef.current = cards.map((_, index) => index);
        cards.forEach((card, index) => {
            placeNow(card, makeSlot(index, cardDistance, verticalDistance, cards.length), skewAmount);
        });

        intervalRef.current = window.setInterval(executeSwap, delay);

        const clickHandlers = cards.map((card, index) => {
            const onCardSelected = () => {
                onCardClick?.(index);
                const visualPosition = orderRef.current.indexOf(index);
                if (visualPosition !== 0) {
                    clearInterval(intervalRef.current);
                    executeSwap();
                    intervalRef.current = window.setInterval(executeSwap, delay);
                }
            };

            card.addEventListener("click", onCardSelected);
            return { card, onCardSelected };
        });

        const pause = () => clearInterval(intervalRef.current);
        const resume = () => {
            intervalRef.current = window.setInterval(executeSwap, delay);
        };

        if (pauseOnHover) {
            containerNode.addEventListener("mouseenter", pause);
            containerNode.addEventListener("mouseleave", resume);
        }

        return () => {
            clickHandlers.forEach(({ card, onCardSelected }) => {
                card.removeEventListener("click", onCardSelected);
            });
            if (pauseOnHover) {
                containerNode.removeEventListener("mouseenter", pause);
                containerNode.removeEventListener("mouseleave", resume);
            }
            clearInterval(intervalRef.current);
        };
    }, [cardDistance, childArr.length, delay, executeSwap, getCards, onCardClick, pauseOnHover, skewAmount, verticalDistance]);

    const renderedCards = childArr.map((child, index) => {
        if (!isValidElement<SwappableCardProps>(child)) {
            return child;
        }

        return cloneElement(child, {
            key: index,
            style: { width, height, ...(child.props.style ?? {}) },
        });
    });

    return (
        <div ref={containerRef} className="card-swap-container" style={{ width, height }}>
            {renderedCards}
        </div>
    );
};

export default CardSwap;
