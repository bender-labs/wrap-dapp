import {Card, CardContent, CardHeader, makeStyles, Typography} from "@material-ui/core";
import SwapHorizontalCircleIcon from "@material-ui/icons/SwapHorizontalCircle";
import React from "react";
import {blueGrey, grey} from "@material-ui/core/colors";

const useStyles = makeStyles((theme) => ({
  swapContainer:{
    flex: 1,
    backgroundColor: grey[300]
  },
  content: {
    backgroundColor: grey[300]
  }
}));

export default function SwapCardEmptyState() {
  const classes = useStyles();
  return (
    <Card className={classes.swapContainer}>
    <CardHeader
      title="Swap"
      avatar={<SwapHorizontalCircleIcon/>}
      subheader="A BenderLabs 🤖 project"/>
    <CardContent className={classes.content}>
      <Typography variant="body1">
        Please connect your accounts before we can proceed.
      </Typography>
    </CardContent>
  </Card>
  );

}