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

const getVariants = (direction: AssembleDirection, distance: number): Variants => {
  switch (direction) {
    case 'left':
      return {
        hidden: { opacity: 0, x: -distance, scale: 0.96 },
        visible: {
          opacity: 1,
          x: 0,
          scale: 1,
          transition: { type: 'spring', stiffness: 260, damping: 24 },
        },
      };
    case 'right':
      return {
        hidden: { opacity: 0, x: distance, scale: 0.96 },
        visible: {
          opacity: 1,
          x: 0,
          scale: 1,
          transition: { type: 'spring', stiffness: 260, damping: 24 },
        },
      };
    case 'top':
      return {
        hidden: { opacity: 0, y: -distance, scale: 0.96 },
        visible: {
          opacity: 1,
          y: 0,
          scale: 1,
          transition: { type: 'spring', stiffness: 260, damping: 24 },
        },
      };
    case 'bottom':
      return {
        hidden: { opacity: 0, y: distance, scale: 0.96 },
        visible: {
          opacity: 1,
          y: 0,
          scale: 1,
          transition: { type: 'spring', stiffness: 260, damping: 24 },
        },
      };
    case 'pop':
      return {
        hidden: { opacity: 0, scale: 0.85, y: 30 },
        visible: {
          opacity: 1,
          scale: 1,
          y: 0,
          transition: { type: 'spring', stiffness: 320, damping: 22 },
        },
      };
    case 'unfold-3d':
      return {
        hidden: { opacity: 0, rotateX: 25, y: 40, scale: 0.92 },
        visible: {
          opacity: 1,
          rotateX: 0,
          y: 0,
          scale: 1,
          transition: { type: 'spring', stiffness: 240, damping: 26 },
        },
      };
    case 'tilt-left':
      return {
        hidden: { opacity: 0, x: -distance, rotateZ: -3, scale: 0.95 },
        visible: {
          opacity: 1,
          x: 0,
          rotateZ: 0,
          scale: 1,
          transition: { type: 'spring', stiffness: 250, damping: 25 },
        },
      };
    case 'tilt-right':
      return {
        hidden: { opacity: 0, x: distance, rotateZ: 3, scale: 0.95 },
        visible: {
          opacity: 1,
          x: 0,
          rotateZ: 0,
          scale: 1,
          transition: { type: 'spring', stiffness: 250, damping: 25 },
        },
      };
    case 'fade':
    default:
      return {
        hidden: { opacity: 0, y: 20 },
        visible: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] },
        },
      };
  }
};

export default function ScrollAssembleCard({
  children,
  direction = 'bottom',
  delay = 0,
  duration,
  distance = 50,
  once = true,
  amount = 0.15,
  className = '',
  ...rest
}: ScrollAssembleCardProps) {
  const variants = getVariants(direction, distance);

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once, amount }}
      variants={variants}
      transition={{ delay, ...(duration ? { duration } : {}) }}
      className={`transform-gpu ${className}`}
      style={{ perspective: 1000 }}
      {...rest}
    >
      {children}
    </motion.div>
  );
}

