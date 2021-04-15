import React from 'react';
import Divider from '@material-ui/core/Divider';
import Drawer from '@material-ui/core/Drawer';
import Hidden from '@material-ui/core/Hidden';
import InboxIcon from '@material-ui/icons/MoveToInbox';
import CloseIcon from '@material-ui/icons/Close';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import MailIcon from '@material-ui/icons/Mail';
import { makeStyles, useTheme, Theme, createStyles } from '@material-ui/core/styles';

const drawerWidth = 240;

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      display: 'flex',
    },
    drawer: {
      [theme.breakpoints.up('sm')]: {
        width: drawerWidth,
        flexShrink: 0,
        
      },
      
    },
    
    menuButton: {
      marginRight: theme.spacing(2),
      [theme.breakpoints.up('sm')]: {
        display: 'none',
      },
    },
    // necessary for content to be below app bar
    toolbar: theme.mixins.toolbar,
    drawerPaper: {
      width: drawerWidth,
      background: "#E5E5E5"
    },
    button: {
      border: 'none',
      background: "#E5E5E5",
      '&:focus': {
        outline: 0
      }
    },
    content: {
      flexGrow: 1,
      padding: theme.spacing(3),
    },
  }),
);

interface Props {
  /**
   * Injected by the documentation to work in an iframe.
   * You won't need it on your project.
   */
  window?: () => Window;
  open: boolean;
  onClose: () => void
}


export default function DrawerComp(props: Props) {
  const { window, open, onClose } = props;
  const classes = useStyles();
  const infoText = "Unfortunately our app does not work on mobile just yet, For the best experience, use desktop"

  const drawer = (
    <div>
      <div className={classes.toolbar} />
      <button className={classes.button} onClick={onClose}><CloseIcon /></button>
      <List>
        {['WRAP', 'HISTORY'].map((text, index) => (
          <ListItem button key={text}>

            <ListItemText primary={text} />
          </ListItem>
        ))}
      </List>
      <Divider />
      <ListItem>
        <ListItemText>{infoText}</ListItemText>
      </ListItem>
      <List>

      </List>
    </div>
  );

  const container = window !== undefined ? () => window().document.body : undefined;

  return (
    <div className={classes.root}>

      <nav className={classes.drawer} aria-label="mailbox folders">
        {/* The implementation can be swapped with js to avoid SEO duplication of links. */}
        <Hidden smUp implementation="css">
          <Drawer
            container={container}
            variant="temporary"
            open={!open}
            onClose={onClose}
            classes={{
              paper: classes.drawerPaper,
            }}
            ModalProps={{
              keepMounted: true, // Better open performance on mobile.
            }}
          >
            {drawer}
          </Drawer>
        </Hidden>
      
      </nav>

    </div>
  );
}
