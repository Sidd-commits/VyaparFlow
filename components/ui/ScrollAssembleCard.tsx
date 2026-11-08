'use client';

import React from 'react';
import { motion, type HTMLMotionProps, type Variants } from 'framer-motion';

export type AssembleDirection =
  | 'left'
  | 'right'
  | 'top'
  | 'bottom'
  | 'pop'
  | 'unfold-3d'
  | 'tilt-left'
  | 'tilt-right'
  | 'puzzle-tl'
  | 'puzzle-tr'
  | 'puzzle-bl'
  | 'puzzle-br'
  | 'stamp'
  | 'domino'
  | 'scale-pulse'
  | 'dock-drawer'
  | 'float-expand'
  | 'fade';

interface ScrollAssembleCardProps extends Omit<HTMLMotionProps<'div'>, 'children'> {
  children: React.ReactNode;
  direction?: AssembleDirection;
  delay?: number;
  duration?: number;
  distance?: number;
  once?: boolean;
  amount?: number | 'some' | 'all';
  className?: string;
}

const getVariants = (direction: AssembleDirection, distance: number, delay: number, duration?: number): Variants => {
  const springVisible = {
    type: 'spring' as const,
    stiffness: 260,
    damping: 24,
    delay,
    ...(duration ? { duration } : {}),
  };

  const smoothHidden = {
    duration: 0.32,
    ease: [0.32, 0, 0.67, 0] as const, // Organic cubic ease-in for disassembly
  };

  switch (direction) {
    case 'left':
      return {
        hidden: { opacity: 0, x: -distance, scale: 0.95, transition: smoothHidden },
        visible: { opacity: 1, x: 0, scale: 1, transition: springVisible },
      };

    case 'right':
      return {
        hidden: { opacity: 0, x: distance, scale: 0.95, transition: smoothHidden },
        visible: { opacity: 1, x: 0, scale: 1, transition: springVisible },
      };

    case 'top':
      return {
        hidden: { opacity: 0, y: -distance, scale: 0.96, transition: smoothHidden },
        visible: { opacity: 1, y: 0, scale: 1, transition: springVisible },
      };

    case 'bottom':
      return {
        hidden: { opacity: 0, y: distance, scale: 0.96, transition: smoothHidden },
        visible: { opacity: 1, y: 0, scale: 1, transition: springVisible },
      };

    case 'pop':
      return {
        hidden: { opacity: 0, scale: 0.82, y: 24, transition: smoothHidden },
        visible: {
          opacity: 1,
          scale: 1,
          y: 0,
          transition: { type: 'spring', stiffness: 320, damping: 20, delay },
        },
      };

    case 'unfold-3d':
      return {
        hidden: { opacity: 0, rotateX: 28, y: 45, scale: 0.9, transition: smoothHidden },
        visible: {
          opacity: 1,
          rotateX: 0,
          y: 0,
          scale: 1,
          transition: { type: 'spring', stiffness: 230, damping: 25, delay },
        },
      };

    case 'tilt-left':
      return {
        hidden: { opacity: 0, x: -distance, rotateZ: -4, scale: 0.94, transition: smoothHidden },
        visible: { opacity: 1, x: 0, rotateZ: 0, scale: 1, transition: springVisible },
      };

    case 'tilt-right':
      return {
        hidden: { opacity: 0, x: distance, rotateZ: 4, scale: 0.94, transition: smoothHidden },
        visible: { opacity: 1, x: 0, rotateZ: 0, scale: 1, transition: springVisible },
      };

    // Bento 4-Corner Puzzle Assembly
    case 'puzzle-tl':
      return {
        hidden: {
          opacity: 0,
          x: -distance * 0.9,
          y: -distance * 0.7,
          rotateZ: -5,
          scale: 0.88,
          transition: smoothHidden,
        },
        visible: {
          opacity: 1,
          x: 0,
          y: 0,
          rotateZ: 0,
          scale: 1,
          transition: { type: 'spring', stiffness: 280, damping: 22, delay },
        },
      };

    case 'puzzle-tr':
      return {
        hidden: {
          opacity: 0,
          x: distance * 0.9,
          y: -distance * 0.7,
          rotateZ: 5,
          scale: 0.88,
          transition: smoothHidden,
        },
        visible: {
          opacity: 1,
          x: 0,
          y: 0,
          rotateZ: 0,
          scale: 1,
          transition: { type: 'spring', stiffness: 280, damping: 22, delay },
        },
      };

    case 'puzzle-bl':
      return {
        hidden: {
          opacity: 0,
          x: -distance * 0.9,
          y: distance * 0.7,
          rotateZ: 4,
          scale: 0.88,
          transition: smoothHidden,
        },
        visible: {
          opacity: 1,
          x: 0,
          y: 0,
          rotateZ: 0,
          scale: 1,
          transition: { type: 'spring', stiffness: 280, damping: 22, delay },
        },
      };

    case 'puzzle-br':
      return {
        hidden: {
          opacity: 0,
          x: distance * 0.9,
          y: distance * 0.7,
          rotateZ: -4,
          scale: 0.88,
          transition: smoothHidden,
        },
        visible: {
          opacity: 1,
          x: 0,
          y: 0,
          rotateZ: 0,
          scale: 1,
          transition: { type: 'spring', stiffness: 280, damping: 22, delay },
        },
      };

    // Physical Document Verification Stamp
    case 'stamp':
      return {
        hidden: {
          opacity: 0,
          scale: 1.4,
          rotateZ: -12,
          y: -35,
          transition: { duration: 0.22, ease: 'easeIn' },
        },
        visible: {
          opacity: 1,
          scale: 1,
          rotateZ: 0,
          y: 0,
          transition: { type: 'spring', stiffness: 360, damping: 18, delay },
        },
      };

    // Kinetic Domino Milestone Sequence
    case 'domino':
      return {
        hidden: {
          opacity: 0,
          rotateY: -65,
          x: -25,
          scale: 0.9,
          transition: smoothHidden,
        },
        visible: {
          opacity: 1,
          rotateY: 0,
          x: 0,
          scale: 1,
          transition: { type: 'spring', stiffness: 280, damping: 22, delay },
        },
      };

    // Radiant Preferential Tariff Scale-Pulse
    case 'scale-pulse':
      return {
        hidden: {
          opacity: 0,
          scale: 0.76,
          filter: 'blur(5px)',
          transition: smoothHidden,
        },
        visible: {
          opacity: 1,
          scale: 1,
          filter: 'blur(0px)',
          transition: { type: 'spring', stiffness: 310, damping: 21, delay },
        },
      };

    // Drawer / Workspace Bottom Dock
    case 'dock-drawer':
      return {
        hidden: {
          opacity: 0,
          rotateX: 30,
          y: 50,
          scale: 0.92,
          transition: smoothHidden,
        },
        visible: {
          opacity: 1,
          rotateX: 0,
          y: 0,
          scale: 1,
          transition: { type: 'spring', stiffness: 240, damping: 26, delay },
        },
      };

    // Floating National Metrics Expansion
    case 'float-expand':
      return {
        hidden: {
          opacity: 0,
          y: 35,
          scale: 0.92,
          transition: smoothHidden,
        },
        visible: {
          opacity: 1,
          y: 0,
          scale: 1,
          transition: { type: 'spring', stiffness: 270, damping: 22, delay },
        },
      };

    case 'fade':
    default:
      return {
        hidden: { opacity: 0, y: 15, transition: smoothHidden },
        visible: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.38, ease: [0.16, 1, 0.3, 1], delay },
        },
      };
  }
};

export default function ScrollAssembleCard({
  children,
  direction = 'bottom',
  delay = 0,
  duration,
  distance = 45,
  once = false, // Bidirectional by default: Assembles on scroll-in, disassembles on scroll-out!
  amount = 0.15,
  className = '',
  ...rest
}: ScrollAssembleCardProps) {
  const variants = getVariants(direction, distance, delay, duration);

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once, amount }}
      variants={variants}
      className={`transform-gpu ${className}`}
      style={{ perspective: 1200 }}
      {...rest}
    >
      {children}
    </motion.div>
  );
}
