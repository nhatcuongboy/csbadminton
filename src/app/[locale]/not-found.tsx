import { useTranslations } from 'next-intl';
import { Box, Container, Heading, Text } from '@chakra-ui/react';
import { Link as IntlLink } from '@/i18n/config';
import { Button } from '@chakra-ui/react';

export default function NotFound() {
  const common = useTranslations('common');
  
  return (
    <Container maxW="lg" py={20}>
      <Box textAlign="center">
        <Heading size="2xl" mb={4}>
          404
        </Heading>
        <Text fontSize="xl" color="gray.600" mb={8}>
          Page not found
        </Text>
        <IntlLink href="/">
          <Button size="lg">
            {common('back')} to Home
          </Button>
        </IntlLink>
      </Box>
    </Container>
  );
}
