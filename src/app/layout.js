// app/layout.js
'use client';

import NextLink from 'next/link';
import { Box, Link as ChakraLink, Button } from '@chakra-ui/react';
import { LuSettings } from 'react-icons/lu';
import { Provider } from '@/components/ui/provider';

export default function RootLayout({ children }) {
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
              <ChakraLink mr={4} asChild>
                <NextLink href="/">Pomodoro</NextLink>
              </ChakraLink>
              <ChakraLink mr={4} asChild>
                <NextLink href="/free-time">Free time</NextLink>
              </ChakraLink>
              <ChakraLink asChild>
                <NextLink href="/settings" passHref>
                  <Button leftIcon={<LuSettings />} size="sm" variant="ghost">
                    Settings
                  </Button>
                </NextLink>
              </ChakraLink>
            </Box>
          </header>
          {children}
        </Provider>
      </body>
    </html>
  );
}
