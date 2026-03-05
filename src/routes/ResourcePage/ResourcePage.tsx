import React from 'react';
import { Box, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { ResourceType } from 'utils/resources';
import loaders from 'utils/loaders';
import { Markdown } from 'components/Markdown/Markdown';

type Props = {
  resource: ResourceType;
};

/**
 * Renders legal resource content (ToS or PP) fetched from a static URL.
 * Uses the useResourceContent hook from loaders for data fetching and caching.
 * The content is expected to be Markdown, rendered via the Markdown component
 * with sanitization (rehype-sanitize).
 */
const ResourcePage: React.FC<Props> = ({ resource }) => {
  const { t, i18n } = useTranslation();
  const { data: content, isError } = loaders.useResourceContent(resource, i18n.language);

  if (isError || !content) {
    return (
      <Box padding={3}>
        <Typography color="error">{t('errors.resourceNotAvailable')}</Typography>
      </Box>
    );
  }

  return (
    <Box padding={3}>
      <Markdown>{content}</Markdown>
    </Box>
  );
};

export default ResourcePage;
