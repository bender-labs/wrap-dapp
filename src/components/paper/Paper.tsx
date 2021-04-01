import { Box, Paper, PaperProps } from '@material-ui/core';
import * as React from 'react';

export type WrapPaperProps = PaperProps;

export function WrapPaper(props: WrapPaperProps) {
  return <Paper {...props} />;
}

export function PaperContent(props: React.HTMLAttributes<HTMLDivElement>) {
  return <Box p={2} {...props} />;
}
