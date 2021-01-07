import {SvgIcon, SvgIconProps} from "@material-ui/core";
import {ReactComponent as Eth} from "cryptocurrency-icons/svg/black/eth.svg";

export default (props: SvgIconProps) => <SvgIcon {...props} component={Eth} viewBox="0 0 32 32"/>;