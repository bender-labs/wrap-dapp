import RestoreIcon from '@material-ui/icons/Restore';
import { Badge, IconButton } from '@material-ui/core';

export type OperationHistoryButtonProps = {
  count: number;
  onClick: () => void;
};

export default function OperationHistoryButton({
  count,
  onClick,
}: OperationHistoryButtonProps) {
  return (
    <IconButton 
      onClick={(e) => {
        e.preventDefault();
        onClick();
      }}
      color="inherit"
    >
      <Badge badgeContent={count} color={"default"} >
        <RestoreIcon />
      </Badge>
    </IconButton>
  );
}
