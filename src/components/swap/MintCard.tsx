import {Card, CardContent, makeStyles} from "@material-ui/core";
import React, {useEffect, useState} from "react";
import {useConfig} from "../config/ConfigContext";

const useStyles = makeStyles((theme) => ({
  swapContainer: {
    flex: 1
  }
}));

type Props = {

};

export function MintCard() {
  const classes = useStyles();
  const {indexerUrl} = useConfig();
  const [pendingWrap, setPendingWrap] = useState();

  useEffect(() => {
    const loadPendingWrap = async () => {
      //indexerApi(indexerUrl).fetchPendingWrap()
    }
  }, [])

  return (
    <Card className={classes.swapContainer}>
      <CardContent>
      </CardContent>
    </Card>
  );
}