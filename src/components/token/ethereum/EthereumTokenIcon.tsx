type Props = {
  contractAddress: string;
};

const EthereumTokenIcon = (props: Props) => {
  return (
    <img
      style={{ width: 28, height: 28, marginRight: 5, verticalAlign: 'middle' }}
      src={`${process.env.PUBLIC_URL}/icons/ethereum/${props.contractAddress}.png`}
      alt={''}
    />
  );
};
export default EthereumTokenIcon;
