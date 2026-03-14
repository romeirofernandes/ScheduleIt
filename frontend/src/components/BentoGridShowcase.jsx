'use client';

import { motion } from 'motion/react';
import { cn } from '@/lib/utils';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 100,
      damping: 10,
    },
  },
};

export function BentoGridShowcase({
  integration,
  trackers,
  statistic,
  focus,
  productivity,
  shortcuts,
  className,
}) {
  return (
    <motion.section
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-80px' }}
      className={cn(
        'grid w-full grid-cols-1 gap-5 auto-rows-[minmax(180px,auto)] md:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)_minmax(0,1fr)] md:[grid-template-areas:"integration_trackers_statistic""integration_focus_productivity""shortcuts_shortcuts_shortcuts"]',
        className
      )}
    >
      <motion.div variants={itemVariants} className="md:[grid-area:integration]">
        {integration}
      </motion.div>
      <motion.div variants={itemVariants} className="md:[grid-area:trackers]">
        {trackers}
      </motion.div>
      <motion.div variants={itemVariants} className="md:[grid-area:statistic]">
        {statistic}
      </motion.div>
      <motion.div variants={itemVariants} className="md:[grid-area:focus]">
        {focus}
      </motion.div>
      <motion.div variants={itemVariants} className="md:[grid-area:productivity]">
        {productivity}
      </motion.div>
      <motion.div variants={itemVariants} className="md:[grid-area:shortcuts]">
        {shortcuts}
      </motion.div>
    </motion.section>
  );
}
