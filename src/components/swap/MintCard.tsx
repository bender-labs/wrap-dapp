import {Card, CardContent, makeStyles} from "@material-ui/core";
import React, {useEffect, useState} from "react";

const useStyles = makeStyles((theme) => ({
  swapContainer: {
    flex: 1
  }
}));

export function MintCard() {
  const classes = useStyles();
  const [pendingWrap, setPendingWrap] = useState();

  useEffect(() => {

  }, [])

  return (
    <Card className={classes.swapContainer}>
      <CardContent>
      </CardContent>
    </Card>
  );
}