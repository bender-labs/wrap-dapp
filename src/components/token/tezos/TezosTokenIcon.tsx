type Props = {
  ipfsUrl: string;
};

const EthereumTokenIcon = (props: Props) => {
  return (
    <img
      {...props}
      style={{ width: 28, height: 28, marginRight: 5, verticalAlign: 'middle' }}
      src={`https://cloudflare-ipfs.com/ipfs/${
        props.ipfsUrl ? props.ipfsUrl.replace('ipfs://', '') : ''
      }`}
      alt={''}
    />
  );
};
export default EthereumTokenIcon;
