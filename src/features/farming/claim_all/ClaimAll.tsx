import FarmingContractHeader from "../../../components/farming/FarmingContractHeader";
import {paths} from "../../../screens/routes";

export default function ClaimAll() {

    return (
        <>
            <FarmingContractHeader title="All farms" path={paths.FARMING_ROOT}/>
        </>
    );
};