// app/layout.js
'use client';

import NextLink from 'next/link';
import { Box, Link as ChakraLink, Button } from '@chakra-ui/react';
import { LuSettings } from 'react-icons/lu';
import { usePathname } from 'next/navigation';
import { Provider } from '@/components/ui/provider';

export default function RootLayout({ children }) {
  const pathname = usePathname();

  return (
    <html suppressHydrationWarning>
      <body>
        <Provider>
          {/* Global Navigation Header */}
          <header>
            <Box
              mb={4}
              display="flex"
              justifyContent="center"
              alignItems="center"
              p={4}
              shadow="md"
            >
              <ChakraLink
                mr={4}
                asChild
                colorPalette={pathname === '/' ? 'accent' : 'gray'}
                variant={pathname === '/' ? 'underline' : 'plain'}
                fontWeight={pathname === '/' ? 'bold' : 'normal'}
              >
                <NextLink href="/">Pomodoro</NextLink>
              </ChakraLink>
              <ChakraLink
                mr={4}
                asChild
                colorPalette={pathname === '/free-time' ? 'accent' : 'gray'}
                variant={pathname === '/free-time' ? 'underline' : 'plain'}
                fontWeight={pathname === '/free-time' ? 'bold' : 'normal'}
              >
                <NextLink href="/free-time">Free time</NextLink>
              </ChakraLink>
              <ChakraLink
                mr={4}
                asChild
                colorPalette={pathname === '/settings' ? 'accent' : 'gray'}
                variant={pathname === '/settings' ? 'underline' : 'plain'}
                fontWeight={pathname === '/settings' ? 'bold' : 'normal'}
              >
                <NextLink href="/settings">Settings</NextLink>
              </ChakraLink>
              <ChakraLink
                asChild
                colorPalette={pathname === '/timeline' ? 'accent' : 'gray'}
                variant={pathname === '/timeline' ? 'underline' : 'plain'}
                fontWeight={pathname === '/timeline' ? 'bold' : 'normal'}
              >
                <NextLink href="/timeline">Timeline</NextLink>
              </ChakraLink>
            </Box>
          </header>
          {children}
        </Provider>
      </body>
    </html>
  );
}
