import {AppBar, createStyles, IconButton, makeStyles, Theme, Toolbar, Typography} from "@material-ui/core";
import MenuIcon from '@material-ui/icons/Menu';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    menuButton: {
      marginRight: theme.spacing(2),
    },
    title: {
      flexGrow: 1,
    },
  }),
);

export default () => {
  const classes = useStyles();

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" component="h1" className={classes.title}>
          🤖 BenderLabs
        </Typography>
      </Toolbar>
    </AppBar>
  );
}