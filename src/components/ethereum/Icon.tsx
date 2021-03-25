import { SvgIcon, SvgIconProps } from '@material-ui/core';
import { ReactComponent as Eth } from 'cryptocurrency-icons/svg/black/eth.svg';

const Icon = (props: SvgIconProps) => (
  <SvgIcon {...props} component={Eth} viewBox="0 0 32 32" />
);
export default Icon;
