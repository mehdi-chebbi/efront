import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Ecosystems - MISFR Geospatial Intelligence',
  description: 'Explore diverse African ecosystems through satellite imagery and geospatial analysis.',
}

export default function EcosystemsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}