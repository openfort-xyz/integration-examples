import { Container, Typography } from '@mui/material'
import { ReactElement, useEffect, useState } from 'react'
import { SCWProvider } from '@openfort-sdk/scw'
import { WalletConnected } from '../wallet-connected'
import { Button } from '../button'
import { useWeb3AuthContext } from "../../contexts/SocialLoginContext";

import { Signer, ethers } from 'ethers';



export const Demo = (): ReactElement => {

  const {
    address,
    loading: eoaLoading,
    userInfo,
    provider,
    connect,
    disconnect,
    getUserInfo,
  } = useWeb3AuthContext();
  const [scwProvider, setSCWProvider] = useState<SCWProvider | null>(null)

  useEffect(():void => {

    if (provider) {
      // get base provider from ethers
      const providerBase = ethers.getDefaultProvider('goerli')



      const walletProvider = new ethers.providers.Web3Provider(provider);
      // get signer
      const signer = walletProvider.getSigner();

      SCWProvider.getSCWForOwner(providerBase, signer)
        .then((scwProvider: SCWProvider) => {
          console.log('SCW set')
          setSCWProvider(scwProvider)
        })
        .catch((e: Error) => console.log(e))
    }
  }, [provider])

  return (
    <Container sx={{ pt: 6 }}>
      <Typography component="h4" variant="h4" sx={{ pb: 2 }}>
        Demo - Social Login
      </Typography>

      <div >
        {!address &&<Button
          action={connect}
          title={!address ? "Log in" : "Log out"}
        />}



      {address!=='' ? (
        <WalletConnected scwProvider={scwProvider} disconnectWalletAndDestructSCW={disconnect} />
      ) : null}
      {address!=='' ? 
      <div style={{ marginTop:'24px'}}>
        <Button loading={eoaLoading} title='Get user info' action={async () => await getUserInfo()}/>  </div>: null}
      </div>
      {userInfo && (
        <div style={{ maxWidth: 800,wordBreak: "break-all" }}>
          <h2>User Info</h2>
          <pre style={{ whiteSpace: "pre-wrap" }}>
            {JSON.stringify(userInfo, null, 2)}
          </pre>
        </div>
      )}
    </Container>
  )
}
