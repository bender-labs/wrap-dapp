import {FarmingContractInfoProps} from '../../features/farming/types';
import LabelAndValue from '../form/LabelAndValue';
import LabelAndAsset from '../form/LabelAndAsset';
import {PaperContent} from '../paper/Paper';
import {Link} from '@material-ui/core';

export default function FarmingContractInfo({farm, farmBalances}: FarmingContractInfoProps) {
    return (
        <PaperContent alternate>
            <LabelAndValue
                label={'Farm contract'}
                value={
                    <Link
                        target={'_blank'}
                        color={'textSecondary'}
                        rel={'noreferrer'}
                        href={farm.farmContractLink}
                    >
                        {farm.farmContractAddress}
                    </Link>
                }
            />
            <LabelAndAsset
                label={'Total staked'}
                value={farmBalances.totalSupply}
                emptyState={farmBalances.loading}
                emptyStatePlaceHolder={'Loading…'}
                decimals={farm.farmStakedToken.decimals}
                symbol={farm.farmStakedToken.symbol}
            />
            <LabelAndAsset
                label={'Your current share'}
                value={farmBalances.staked}
                emptyState={farmBalances.loading}
                emptyStatePlaceHolder={'Loading…'}
                decimals={farm.farmStakedToken.decimals}
                symbol={farm.farmStakedToken.symbol}
            />
            <LabelAndAsset
                label={'Your pending reward'}
                value={farmBalances.reward}
                emptyState={farmBalances.loading}
                emptyStatePlaceHolder={'Loading…'}
                decimals={farm.rewardTokenDecimals}
                symbol={farm.rewardTokenSymbol}
            />
        </PaperContent>
    );
}
