import {
  Button,
  TableContainer,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  styled,
} from '@mui/material'
import { Fragment, ReactElement, useEffect, useState } from 'react'
import { SCWProvider } from '@openfort-sdk/scw'
import { BigNumber, utils } from 'ethers'
import { TestTransaction } from '../test-transaction'
import {
  batchTransaction,
  bundleTransactionsExecution,
  paymasterTransactionExecution,
  singleTransaction,
  singleTransactionExecution,
} from '../test-transaction/TestTransaction'

const BoldTypography = styled(Typography)`
  font-weight: 600;
`

export const WalletConnected = ({
  disconnectWalletAndDestructSCW,
  scwProvider,
}: {
  disconnectWalletAndDestructSCW: () => void
  scwProvider: SCWProvider | null
}): ReactElement => {
  const [loading, setLoading] = useState<boolean>(true)
  const [deployed, setDeployed] = useState<boolean>(true)
  const [address, setAddress] = useState<string>('')
  const [scwAddress, setScwAddress] = useState<string>('')
  const [balance, setBalance] = useState<BigNumber>(BigNumber.from(0))

  useEffect(() => {
    const getTableDetails = async (): Promise<void> => {
      if (scwProvider != null) {
        const owner = scwProvider.getSCWOwner()
        const scwSigner = scwProvider.getSigner()

        const address = await owner.getAddress()
        const scwAddress = await scwSigner.getAddress()
        const balance = await scwSigner.getBalance()
        const deployed = await scwProvider.isSCWDeployed()

        setAddress(address)
        setScwAddress(scwAddress)
        setBalance(balance)
        setLoading(false)
        setDeployed(deployed)
      }
    }

    getTableDetails().catch((e: Error) => console.log(e))
  }, [scwProvider])

  return (
    <Fragment>
      <Typography variant="h6" sx={{ pb: 1 }}>
        Your SCW
      </Typography>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell variant="head">Property</TableCell>
              <TableCell variant="head">Value</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell variant="body">Owner of SCW</TableCell>
              <TableCell>
                {/*
              // @ts-expect-error */}
                <BoldTypography variant="body">{loading ? 'loading...' : address}</BoldTypography>
              </TableCell>
            </TableRow>

            <TableRow>
              <TableCell variant="body">Your SCW address</TableCell>
              <TableCell>
                {/*
              // @ts-expect-error */}
                <BoldTypography variant="body">{loading ? 'loading...' : scwAddress}</BoldTypography>
              </TableCell>
            </TableRow>

            <TableRow>
              <TableCell variant="body">SCW Deployment Status</TableCell>
              <TableCell>
                {/*
              // @ts-expect-error */}
                <BoldTypography variant="body">
                  {loading ? 'loading...' : deployed ? 'Deployed' : 'Not Deployed'}
                </BoldTypography>
              </TableCell>
            </TableRow>

            <TableRow>
              <TableCell variant="body">Balance</TableCell>
              <TableCell>
                {/*
              // @ts-expect-error */}
                <BoldTypography variant="body">
                  {loading ? 'loading...' : `${utils.formatEther(balance)} ETH`}
                </BoldTypography>
              </TableCell>
            </TableRow>

            <TableRow>
              <TableCell variant="body">Single Transaction</TableCell>
              <TableCell>
                {loading || scwProvider === null ? (
                  <Button disabled={loading} variant="outlined">
                    View Transaction
                  </Button>
                ) : (
                  <TestTransaction
                    transactionExecutioner={singleTransactionExecution}
                    transaction={singleTransaction}
                    buttonLabel="View Transaction"
                    scwProvider={scwProvider}
                  />
                )}
              </TableCell>
            </TableRow>

            <TableRow>
              <TableCell variant="body">Bundled Transaction</TableCell>
              <TableCell>
                {loading || scwProvider === null ? (
                  <Button disabled={loading} variant="outlined">
                    View Transaction
                  </Button>
                ) : (
                  <TestTransaction
                    transactionExecutioner={bundleTransactionsExecution}
                    transaction={batchTransaction}
                    buttonLabel="View Transaction"
                    scwProvider={scwProvider}
                  />
                )}
              </TableCell>
            </TableRow>

            <TableRow>
              <TableCell variant="body">Sponsored Single Transaction</TableCell>
              <TableCell>
                {loading || scwProvider === null ? (
                  <Button disabled={loading} variant="outlined">
                    View Transaction
                  </Button>
                ) : (
                  <TestTransaction
                    transactionExecutioner={paymasterTransactionExecution}
                    transaction={singleTransaction}
                    buttonLabel="View Transaction"
                    scwProvider={scwProvider}
                  />
                )}
              </TableCell>
            </TableRow>

            <TableRow>
              <TableCell variant="body">Disconnect EOA</TableCell>
              <TableCell>
                <Button disabled={loading} variant="contained" onClick={() => disconnectWalletAndDestructSCW()}>
                  Disconnect
                </Button>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    </Fragment>
  )
}
