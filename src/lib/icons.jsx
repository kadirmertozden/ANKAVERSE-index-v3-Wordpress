import React from 'react';
import {
  Activity,
  Box,
  BrainCircuit,
  Code2,
  Database,
  Layers,
  Server,
  ShieldCheck,
  ShoppingCart,
  Workflow,
} from 'lucide-react';

/**
 * Lucide icon names stored in WordPress ACF fields, resolved to components.
 * Unknown names fall back to Code2 rather than rendering nothing.
 */
const ICONS = {
  Activity,
  Box,
  BrainCircuit,
  Code: Code2,
  Code2,
  Database,
  Layers,
  Server,
  ShieldCheck,
  ShoppingCart,
  Workflow,
};

export function ServiceIcon({ name, className = 'h-8 w-8' }) {
  const Icon = ICONS[(name ?? '').trim()] ?? Code2;
  return <Icon className={className} aria-hidden="true" />;
}

export default ServiceIcon;
