import {DAppClient} from "@airgap/beacon-sdk";


export function getLibrary() {
  return new DAppClient({name: 'BenderLabs'});
}