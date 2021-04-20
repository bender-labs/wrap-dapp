import { Button, CircularProgress, makeStyles } from '@material-ui/core';
import { grey } from '@material-ui/core/colors';
import React, { PropsWithChildren } from 'react';

export type LoadableButtonProps = {
  loading: boolean;
  onClick: () => void;
  disabled: boolean;
  text: string;
  color: string;
  variant?: 'text' | 'outlined' | 'contained';
  size?: 'small' | 'medium' | 'large';
};

const useStyles = makeStyles((theme) => ({
  helperText: {
    color: grey[600],
    display: 'block',
    margin: '5 0',
  },
  buttonProgress: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: -12,
    marginLeft: -12,
    zIndex: 99,
  },
  wrapper: {
    margin: theme.spacing(1),
    backgroundColor: '#F7CB16',
    position: 'relative',
  },
}));

export default function LoadableButton({
  loading,
  disabled,
  text,
  onClick,
  children,
  color,
  variant = 'outlined',
  size,
}: PropsWithChildren<LoadableButtonProps>) {
  const classes = useStyles();

  const handleOnClick = (event: React.MouseEvent<HTMLElement>) => {
    event.preventDefault();
    onClick();
  };

  return (
    <div>
      <div className={classes.wrapper}>
        <Button
          variant={variant}
          fullWidth
          disabled={disabled || loading}
          color={color as any}
          onClick={handleOnClick}
          size={size}
        >
          {text}
        </Button>
        {loading && (
          <CircularProgress size={24} className={classes.buttonProgress} />
        )}
      </div>
      {children}
    </div>
  );
}
