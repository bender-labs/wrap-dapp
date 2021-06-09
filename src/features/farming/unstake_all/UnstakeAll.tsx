import FarmingContractHeader from "../../../components/farming/FarmingContractHeader";
import {paths} from "../../../screens/routes";

export default function UnstakeAll() {

    return (
        <>
            <FarmingContractHeader title="All farms" path={paths.FARMING_ROOT}/>
        </>
    );
};