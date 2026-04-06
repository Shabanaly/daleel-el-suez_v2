"use client"
import NextLink, { LinkProps as NextLinkProps } from 'next/link'
import React, { FC, HTMLAttributes } from 'react'

type CustomLinkProps = NextLinkProps & {
  children: React.ReactNode;
  href: string;
  target?: string;
} & HTMLAttributes<HTMLAnchorElement>

/**
 * CustomLink Component:
 * Optimizes navigation by using 'prefetch={false}' which enables 
 * hover-based prefetching on desktop and touch-based prefetching on mobile.
 * This approach is more performant than manual React state updates.
 */
const CustomLink: FC<CustomLinkProps> = ({ href, children, prefetch = false, ...rest }) => {
  return (
    <NextLink 
      href={href} 
      prefetch={prefetch} 
      {...rest}
    >
      {children}
    </NextLink>
  )
}

export default CustomLink