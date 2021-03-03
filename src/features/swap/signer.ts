import {ethers} from "ethers";
import {TezosToolkit} from "@taquito/taquito";

interface SignerEventPayload {
  parameters: {
    amount: ethers.BigNumber
    blockHash: string,
    erc20: string,
    logIndex: number,
    owner: string
  },
  quorum: {
    minterContract: string,
    quorumContract: string
  },
  signatures: Array<{
    signerId: string,
    signature: string
  }>,
  transactionHash: string
}
/*"type":"Erc20MintingSigned"*/
/*
mint = {"amount": amount, "owner": owner,
                "erc_20": erc_20,
                "event_id": {
                    "block_hash": block_hash,
                    "log_index": log_index}}
        op = contract.minter(signatures=[[signer_id, signature]],
                    action={"target": f"{minter_contract}%signer",
                            "entry_point": {"mint_erc20": mint}},
                    ).inject()
 */
//["mint_erc20","bytes","bytes","nat","address","nat","address","list"]
//(or (pair %mint_erc20
//                         (bytes %erc_20)
//                         (pair (pair %event_id (bytes %block_hash) (nat %log_index))
//                               (pair (address %owner) (nat %amount))))
export async function mintErc20(client: TezosToolkit, {quorum, parameters, signatures, transactionHash}: SignerEventPayload = signerEventPayload): Promise<string> {
  const contract = await client.wallet.at(quorum.quorumContract);
  const {amount, owner, erc20, blockHash, logIndex} = parameters;
  const mintSignatures = signatures.map(({signature, signerId}) => ([signerId, signature]));
  await contract.methods.minter("mint_erc20", erc20.substring(2), blockHash.substring(2), logIndex, owner, amount.toString(), quorum.minterContract, mintSignatures).send();
  return "";
}

export {}
//mint_erc20(self, contract_id, minter_contract, owner, amount, block_hash, log_index, erc_20, signer_id, signature):
const signerEventPayload: SignerEventPayload = {
  "parameters": {
    "amount": ethers.BigNumber.from("20000000000000000"),
    "blockHash": "0x3aa08ed2c4724dcfcd61cbfb0c8f2b8182a64ba0a2d1c78b4409c28d1024bd6f",
    "erc20": "0xfab46e002bbf0b4509813474841e0716e6730136",
    "logIndex": 58,
    "owner": "tz1NmCpwzCHstDGoabUhDYjgBiuD5hV7TD96"
  },
  "quorum": {
    "minterContract": "KT1BYbUJhYbyWXMeV2eLSe3FEWg1NNumncne",
    "quorumContract": "KT1TxocDM18SveVYebhyjgSrRfde3SvFwEkq"
  },
  "signatures": [
    {
      "signerId": "k51qzi5uqu5dge5i7atd5503txbd10oqb4bfo4d0tk8tw7ka8bk4p7g7kt299r",
      "signature": "spsig16WidYDEtUfTZaW6rLYGKTJy14SULGBRMoguwEsUQckaBhVjKMkFB7QjYS7Y4FUFTqEfmnhD7UMCSdHzRWstKk3jMzhkLQ",
    }
  ],
  "transactionHash": "0xaf835dc0ce9e973e02c2487797fcdaee59dac76ad3ae41d69869612cd13b41e3"
}