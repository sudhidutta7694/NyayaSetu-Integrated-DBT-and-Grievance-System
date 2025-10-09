'use client'
import React from 'react'

export const Skeleton: React.FC<{ className?: string }> = ({ className='' }) => (
  <div className={`animate-pulse rounded-md bg-gray-200 ${className}`} aria-hidden="true" />
)

export const SkeletonLines: React.FC<{ lines?: number; className?: string }> = ({ lines=3, className='' }) => (
  <div className={`space-y-2 ${className}`}> {Array.from({length:lines}).map((_,i)=> <Skeleton key={i} className="h-3 w-full" />)} </div>
)
