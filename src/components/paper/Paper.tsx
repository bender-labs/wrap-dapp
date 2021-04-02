import { Box, Paper, PaperProps, styled } from '@material-ui/core';
import * as React from 'react';

export type WrapPaperProps = PaperProps;

export function WrapPaper(props: WrapPaperProps) {
  return <Paper {...props} />;
}

export const PaperHeader = styled('header')((theme) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  paddingTop: theme.theme.spacing(),
  paddingBottom: theme.theme.spacing(),
  paddingLeft: theme.theme.spacing(),
  paddingRight: theme.theme.spacing(),
}));

export const PaperTitle = styled('div')({
  justifySelf: 'center',
  textAlign: 'center',
  width: '100%',
});

export const PaperNav = styled('div')({
  justifySelf: 'flex-start',
  minWidth: 72,
});

export const PaperActions = styled('div')({
  justifySelf: 'flex-end',
  minWidth: 72,
  '& > *': {
    margin: '0 4px',
    '&:first-child': {
      marginLeft: 0,
    },
    '&:last-child': {
      marginRight: 0,
    },
  },
});

export function PaperContent(props: React.HTMLAttributes<HTMLDivElement>) {
  return <Box p={2} {...props} />;
}

export function PaperSection() {}
