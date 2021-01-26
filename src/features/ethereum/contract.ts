import {Web3Provider} from '@ethersproject/providers';
import {ethers} from "ethers";

export class EthereumERC20ContractApi {

  constructor(contract: ethers.Contract, benderContractAddress: string, accountAddress: string) {
    this.contract = contract;
    this.benderContractAddress = benderContractAddress;
    this.accountAddress = accountAddress;
  }

  async balanceOf() {
    return this.contract.balanceOf(this.accountAddress);
  }

  async allowance() {
    return this.contract.allowance(this.accountAddress, this.benderContractAddress);
  }

  async approve(amount: ethers.BigNumber) {
    return this.contract.approve(this.benderContractAddress, amount);
  }

  private readonly contract: ethers.Contract;
  private readonly benderContractAddress: string;
  private readonly accountAddress: string;

  static withProvider(provider: Web3Provider) {
    return (contractAddress: string, benderContractAddress: string, accountAddress: string) =>
      new EthereumERC20ContractApi(
        new ethers.Contract(contractAddress, new ethers.utils.Interface(ERC20_ABI), provider.getSigner()),
        benderContractAddress,
        accountAddress
      )
  }
}

export function benderContractFactory(provider: Web3Provider) {
  return (address: string) => new ethers.Contract(address, new ethers.utils.Interface(BENDER_ABI), provider);
}

const BENDER_ABI = [{
  "inputs": [],
  "payable": false,
  "stateMutability": "nonpayable",
  "type": "constructor"
}, {
  "anonymous": false,
  "inputs": [{"indexed": false, "internalType": "address", "name": "owner", "type": "address"}],
  "name": "AddedOwner",
  "type": "event"
}, {
  "anonymous": false,
  "inputs": [{"indexed": false, "internalType": "uint256", "name": "threshold", "type": "uint256"}],
  "name": "ChangedThreshold",
  "type": "event"
}, {
  "anonymous": false,
  "inputs": [{"indexed": false, "internalType": "bytes32", "name": "txHash", "type": "bytes32"}],
  "name": "ExecutionFailure",
  "type": "event"
}, {
  "anonymous": false,
  "inputs": [{"indexed": false, "internalType": "bytes32", "name": "txHash", "type": "bytes32"}],
  "name": "ExecutionSuccess",
  "type": "event"
}, {
  "anonymous": false,
  "inputs": [{"indexed": false, "internalType": "address", "name": "owner", "type": "address"}],
  "name": "RemovedOwner",
  "type": "event"
}, {
  "anonymous": false,
  "inputs": [{"indexed": false, "internalType": "address", "name": "user", "type": "address"}, {
    "indexed": false,
    "internalType": "uint256",
    "name": "amount",
    "type": "uint256"
  }, {"indexed": false, "internalType": "address", "name": "token", "type": "address"}, {
    "indexed": false,
    "internalType": "bytes",
    "name": "tezosDestinationAddress",
    "type": "bytes"
  }],
  "name": "WrapAsked",
  "type": "event"
}, {
  "constant": true,
  "inputs": [],
  "name": "NAME",
  "outputs": [{"internalType": "string", "name": "", "type": "string"}],
  "payable": false,
  "stateMutability": "view",
  "type": "function"
}, {
  "constant": true,
  "inputs": [],
  "name": "VERSION",
  "outputs": [{"internalType": "string", "name": "", "type": "string"}],
  "payable": false,
  "stateMutability": "view",
  "type": "function"
}, {
  "constant": false,
  "inputs": [{"internalType": "address", "name": "owner", "type": "address"}, {
    "internalType": "uint256",
    "name": "_threshold",
    "type": "uint256"
  }],
  "name": "addOwnerWithThreshold",
  "outputs": [],
  "payable": false,
  "stateMutability": "nonpayable",
  "type": "function"
}, {
  "constant": false,
  "inputs": [{"internalType": "uint256", "name": "_threshold", "type": "uint256"}],
  "name": "changeThreshold",
  "outputs": [],
  "payable": false,
  "stateMutability": "nonpayable",
  "type": "function"
}, {
  "constant": true,
  "inputs": [],
  "name": "domainSeparator",
  "outputs": [{"internalType": "bytes32", "name": "", "type": "bytes32"}],
  "payable": false,
  "stateMutability": "view",
  "type": "function"
}, {
  "constant": true,
  "inputs": [],
  "name": "getAdministrator",
  "outputs": [{"internalType": "address", "name": "", "type": "address"}],
  "payable": false,
  "stateMutability": "view",
  "type": "function"
}, {
  "constant": true,
  "inputs": [],
  "name": "getOwners",
  "outputs": [{"internalType": "address[]", "name": "", "type": "address[]"}],
  "payable": false,
  "stateMutability": "view",
  "type": "function"
}, {
  "constant": true,
  "inputs": [],
  "name": "getThreshold",
  "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
  "payable": false,
  "stateMutability": "view",
  "type": "function"
}, {
  "constant": true,
  "inputs": [{"internalType": "address", "name": "owner", "type": "address"}],
  "name": "isOwner",
  "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
  "payable": false,
  "stateMutability": "view",
  "type": "function"
}, {
  "constant": true,
  "inputs": [],
  "name": "nonce",
  "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
  "payable": false,
  "stateMutability": "view",
  "type": "function"
}, {
  "constant": false,
  "inputs": [{"internalType": "address", "name": "prevOwner", "type": "address"}, {
    "internalType": "address",
    "name": "owner",
    "type": "address"
  }, {"internalType": "uint256", "name": "_threshold", "type": "uint256"}],
  "name": "removeOwner",
  "outputs": [],
  "payable": false,
  "stateMutability": "nonpayable",
  "type": "function"
}, {
  "constant": false,
  "inputs": [{"internalType": "address", "name": "prevOwner", "type": "address"}, {
    "internalType": "address",
    "name": "oldOwner",
    "type": "address"
  }, {"internalType": "address", "name": "newOwner", "type": "address"}],
  "name": "swapOwner",
  "outputs": [],
  "payable": false,
  "stateMutability": "nonpayable",
  "type": "function"
}, {
  "constant": false,
  "inputs": [{"internalType": "address", "name": "_administrator", "type": "address"}, {
    "internalType": "address[]",
    "name": "_owners",
    "type": "address[]"
  }, {"internalType": "uint256", "name": "_threshold", "type": "uint256"}],
  "name": "setup",
  "outputs": [],
  "payable": false,
  "stateMutability": "nonpayable",
  "type": "function"
}, {
  "constant": false,
  "inputs": [{"internalType": "uint256", "name": "amount", "type": "uint256"}, {
    "internalType": "address",
    "name": "contractAddress",
    "type": "address"
  }, {"internalType": "bytes", "name": "tezosAddress", "type": "bytes"}],
  "name": "wrap",
  "outputs": [{"internalType": "bool", "name": "success", "type": "bool"}],
  "payable": false,
  "stateMutability": "nonpayable",
  "type": "function"
}, {
  "constant": false,
  "inputs": [{"internalType": "address", "name": "to", "type": "address"}, {
    "internalType": "uint256",
    "name": "value",
    "type": "uint256"
  }, {"internalType": "bytes", "name": "data", "type": "bytes"}, {
    "internalType": "bytes",
    "name": "signatures",
    "type": "bytes"
  }],
  "name": "execTransaction",
  "outputs": [{"internalType": "bool", "name": "success", "type": "bool"}],
  "payable": false,
  "stateMutability": "nonpayable",
  "type": "function"
}, {
  "constant": true,
  "inputs": [{"internalType": "bytes", "name": "message", "type": "bytes"}],
  "name": "getMessageHash",
  "outputs": [{"internalType": "bytes32", "name": "", "type": "bytes32"}],
  "payable": false,
  "stateMutability": "view",
  "type": "function"
}, {
  "constant": true,
  "inputs": [{"internalType": "address", "name": "to", "type": "address"}, {
    "internalType": "uint256",
    "name": "value",
    "type": "uint256"
  }, {"internalType": "bytes", "name": "data", "type": "bytes"}, {
    "internalType": "uint256",
    "name": "_nonce",
    "type": "uint256"
  }],
  "name": "encodeTransactionData",
  "outputs": [{"internalType": "bytes", "name": "", "type": "bytes"}],
  "payable": false,
  "stateMutability": "view",
  "type": "function"
}, {
  "constant": true,
  "inputs": [{"internalType": "address", "name": "to", "type": "address"}, {
    "internalType": "uint256",
    "name": "value",
    "type": "uint256"
  }, {"internalType": "bytes", "name": "data", "type": "bytes"}, {
    "internalType": "uint256",
    "name": "_nonce",
    "type": "uint256"
  }],
  "name": "getTransactionHash",
  "outputs": [{"internalType": "bytes32", "name": "", "type": "bytes32"}],
  "payable": false,
  "stateMutability": "view",
  "type": "function"
}];

const ERC20_ABI = [
  {
    "constant": true,
    "inputs": [],
    "name": "name",
    "outputs": [
      {
        "name": "",
        "type": "string"
      }
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [
      {
        "name": "_spender",
        "type": "address"
      },
      {
        "name": "_value",
        "type": "uint256"
      }
    ],
    "name": "approve",
    "outputs": [
      {
        "name": "",
        "type": "bool"
      }
    ],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "totalSupply",
    "outputs": [
      {
        "name": "",
        "type": "uint256"
      }
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [
      {
        "name": "_from",
        "type": "address"
      },
      {
        "name": "_to",
        "type": "address"
      },
      {
        "name": "_value",
        "type": "uint256"
      }
    ],
    "name": "transferFrom",
    "outputs": [
      {
        "name": "",
        "type": "bool"
      }
    ],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "decimals",
    "outputs": [
      {
        "name": "",
        "type": "uint8"
      }
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [
      {
        "name": "_owner",
        "type": "address"
      }
    ],
    "name": "balanceOf",
    "outputs": [
      {
        "name": "balance",
        "type": "uint256"
      }
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "symbol",
    "outputs": [
      {
        "name": "",
        "type": "string"
      }
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [
      {
        "name": "_to",
        "type": "address"
      },
      {
        "name": "_value",
        "type": "uint256"
      }
    ],
    "name": "transfer",
    "outputs": [
      {
        "name": "",
        "type": "bool"
      }
    ],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [
      {
        "name": "_owner",
        "type": "address"
      },
      {
        "name": "_spender",
        "type": "address"
      }
    ],
    "name": "allowance",
    "outputs": [
      {
        "name": "",
        "type": "uint256"
      }
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "payable": true,
    "stateMutability": "payable",
    "type": "fallback"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "name": "owner",
        "type": "address"
      },
      {
        "indexed": true,
        "name": "spender",
        "type": "address"
      },
      {
        "indexed": false,
        "name": "value",
        "type": "uint256"
      }
    ],
    "name": "Approval",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "name": "from",
        "type": "address"
      },
      {
        "indexed": true,
        "name": "to",
        "type": "address"
      },
      {
        "indexed": false,
        "name": "value",
        "type": "uint256"
      }
    ],
    "name": "Transfer",
    "type": "event"
  }
];