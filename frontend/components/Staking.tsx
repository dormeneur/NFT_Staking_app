'use client'

import { TransactionButton, useActiveAccount, useReadContract } from "thirdweb/react"
import { CuboidIcon as Cube } from 'lucide-react'
import { claimTo, getNFTs, ownerOf, totalSupply } from "thirdweb/extensions/erc721"
import { NFT_CONTRACT, STAKING_CONTRACT } from "../utils/contracts"
import { useState } from "react"
import { NFT } from "thirdweb"
import { useEffect } from "react"
import NFTCard from "./NFTCard"
import StakedNFTCard from "./StakedNFTCard"
import { StakeRewards } from "./StakeRewards"

const Staking = () => {
  const account = useActiveAccount()

  const [ownedNFTs, setOwnedNFTs] = useState<NFT[]>([])

  const getOwnedNFTs = async () => {
    let ownedNFTs:NFT[] = []
    
    const totalNftSupply = await totalSupply({
        contract:NFT_CONTRACT
    })

    const nfts=await getNFTs({
        contract:NFT_CONTRACT,
        start:0,
        count:parseInt(totalNftSupply.toString())
    })
    
    for (let nft of nfts) {
        const owner = await ownerOf({
            contract: NFT_CONTRACT,
            tokenId: nft.id,
        });
        if (owner === account?.address) {
            ownedNFTs.push(nft);
        }
    }
    setOwnedNFTs(ownedNFTs);
  }
  
  useEffect(() => {
    if(account) {
        getOwnedNFTs();
    }
}, [account]);

const {
    data:stakedInfo,
    refetch:refetchStakedInfo,
}=useReadContract({
    contract:STAKING_CONTRACT,
    method:"getStakeInfo",
    params:[account?.address || ""]
})

  if (account) {
    return (
      <div className="bg-white/5 rounded-lg p-6 border border-white/10">
        <div className="max-w-md flex justify-between ">
            <h1 className="text-3xl  tracking-tighter">Claim NFT to Stake</h1>
              <TransactionButton 
              onTransactionConfirmed={()=>{
                alert("NFT Claimed")
                getOwnedNFTs()
            }}
              transaction={()=>
                claimTo({
                  contract:NFT_CONTRACT,
                  to:account?.address || "",
                  quantity:BigInt(1),

                }) 
                
              }>
                  Claim NFT
              </TransactionButton>
        </div>
            
        <div className="mt-2">
        <h1 className="title">Owned NFT's</h1>
      <div className="nft-container">
  {ownedNFTs && ownedNFTs.length > 0 ? (
    ownedNFTs.map((nft, index) => (
      <div key={index} className="nft-card">
        <NFTCard
          nft={nft}
          refetch={getOwnedNFTs}
          refetchStakedInfo={refetchStakedInfo}
        />
      </div>
    ))
  ) : (
    <p className="text-gray-500">Mint some NFTs, you don’t own any right now.</p>
  )}
</div>

<div>
    <h1 className="title">Staked NFT's</h1>
    <div className="nft-container">
    {stakedInfo && stakedInfo[0].length > 0 ? (
        stakedInfo[0].map((tokenId: bigint,index) => (
           <div key={index} className="nft-card">
            <StakedNFTCard tokenId={tokenId} refetchStakedInfo={refetchStakedInfo} refetchOwnedNFTs={getOwnedNFTs}/>
           </div>
        ))
    ) : (
        <p className="text-gray-500">You don't have any NFTs staked right now.</p>
        
    )}
    </div>
</div>

    <div>
        <StakeRewards/>
    </div>

      </div>
      </div>
    )
  }

  return (
    <div className="bg-white/5 rounded-lg p-6 border border-white/10">
      <div className="max-w-md">
        <h2 className="text-xl font-semibold mb-4">Welcome to NFT Staking</h2>
        <p className="text-gray-400 mb-6">
          Connect your wallet to start staking your NFTs and earning rewards. Track your staked assets and manage your earnings all in one place.
        </p>
        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
              <Cube className="w-4 h-4 text-purple-400" />
            </div>
            <span className="text-sm text-gray-300 mt-6">Stake your NFTs securely</span>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
              <Cube className="w-4 h-4 text-purple-400" />
            </div>
            <span className="text-sm text-gray-300">Earn rewards automatically</span>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
              <Cube className="w-4 h-4 text-purple-400" />
            </div>
            <span className="text-sm text-gray-300">Track your earnings in real-time</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Staking

