import { SvgIcon, SvgIconProps } from '@material-ui/core';
import { ReactComponent as Tezos } from 'cryptocurrency-icons/svg/black/xtz.svg';

const Icon = (props: SvgIconProps) => (
  <SvgIcon {...props} component={Tezos} viewBox="0 0 32 32" />
);
export default Icon;
