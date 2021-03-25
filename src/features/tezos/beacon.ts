import { BeaconWallet } from '@taquito/beacon-wallet';

export function getLibrary() {
  return new BeaconWallet({ name: 'BenderLabs' });
}
