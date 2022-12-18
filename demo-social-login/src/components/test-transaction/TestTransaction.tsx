import { Alert, Button, Dialog, DialogActions, DialogContent, DialogTitle, styled, Typography } from '@mui/material'
import { Fragment, ReactElement, useEffect, useMemo, useState } from 'react'
import { BigNumber, ethers } from 'ethers'
import { SCWProvider, PaymasterAPI } from '@openfort-sdk/scw'

import GreeterArtifact from '../../assets/abi/Greeter.json'
import { GREETER_ADDR } from '../constants'
import { LoadingButton } from '@mui/lab'

export interface TestTransactionProps {
  scwProvider: SCWProvider
  buttonLabel: string
  transaction: any
  transactionExecutioner: (scwProvider: SCWProvider) => Promise<void>
  shouldPrefund?: boolean
}

const BoldTypography = styled(Typography)`
  font-weight: 600;
`

export const singleTransaction = {
  to: GREETER_ADDR,
  value: '0.0001 ETH',
  data: 'Function Call addGreet',
}

export const batchTransaction = [
  {
    to: GREETER_ADDR,
    value: '002 ETH',
    data: 'Function Call withdrawGreet',
  },
  {
    to: GREETER_ADDR,
    value: '0002 ETH',
    data: 'Function Call addGreet',
  },
]

export const singleTransactionExecution = async (scwProvider: SCWProvider): Promise<any> => {
  const scwSigner = scwProvider.getSigner()
  const greeter = new ethers.Contract(GREETER_ADDR, GreeterArtifact.abi, scwSigner)

  const tx = await greeter.addGreet({
    value: ethers.utils.parseEther('0'),
  })
  const receipt = await tx.wait()
  return receipt
}

export const bundleTransactionsExecution = async (scwProvider: SCWProvider): Promise<any> => {
  const scwSigner = scwProvider.getSigner()

  const greeter = new ethers.Contract(GREETER_ADDR, GreeterArtifact.abi, scwSigner)

  // const transactionData_withdraw = greeter.interface.encodeFunctionData('withdrawGreet',[ethers.utils.parseEther('0.01')])
  const transactionData_add = greeter.interface.encodeFunctionData('addGreet')

  const tx = await scwProvider.sendTransactions([
    {
      to: GREETER_ADDR,
      value: ethers.utils.parseEther('0.001'),
      data: transactionData_add,
    },
    {
      to: GREETER_ADDR,
      value: ethers.utils.parseEther('0.0002'),
      data: transactionData_add,
    },
  ])
  const receipt = await tx.wait()
  return receipt

}

export const paymasterTransactionSingleExecution = async (scwProvider: SCWProvider): Promise<any> => {
  const paymasterAPI = new PaymasterAPI(
    process.env.REACT_APP_API_URL ?? '',
    process.env.REACT_APP_API_KEY ?? ''
  )
  scwProvider.connectPaymaster(paymasterAPI)
  const receipt = await singleTransactionExecution(scwProvider)
  console.log(receipt)
  console.log(`https://goerli.etherscan.io/tx/${receipt.logs[0].transactionHash}`)
  scwProvider.disconnectPaymaster()
  return receipt
}

export const paymasterTransactionExecution = async (scwProvider: SCWProvider): Promise<void> => {
  const paymasterAPI = new PaymasterAPI(
    process.env.REACT_APP_API_URL ?? '',
    process.env.REACT_APP_API_KEY ?? ''
  )
  scwProvider.connectPaymaster(paymasterAPI)
  const receipt = await bundleTransactionsExecution(scwProvider)
  console.log(`https://goerli.etherscan.io/tx/${receipt.logs[0].transactionHash}`)
  scwProvider.disconnectPaymaster()
  return receipt
}

export const TestTransaction = ({
  scwProvider,
  buttonLabel,
  transaction,
  transactionExecutioner,
  shouldPrefund = true,
}: TestTransactionProps): ReactElement => {
  const [showDialog, setShowDialog] = useState<boolean>(false)
  const [loading, setLoading] = useState<boolean>(true)
  const [sendingTestTransaction, setSendingTestTransaction] = useState<boolean>(false)
  const [balance, setBalance] = useState<BigNumber>(BigNumber.from(0))
  const [deployed, setDeployed] = useState<boolean>(true)
  const [minFundsEstimate, setMinFundsEstimate] = useState<BigNumber>(BigNumber.from(0))
  const [success, setSuccess] = useState<boolean>(false)

  const preFund = useMemo(() => {
    // balance of SCW
    // how much the transaction will cost
    // re: if positive, not enough in SCW and need to prefund
    const preFund = minFundsEstimate.sub(balance)

    return preFund.gte(0) ? preFund : BigNumber.from(0)
  }, [minFundsEstimate, balance])

  useEffect(() => {
    const getTableDetails = async (): Promise<void> => {
      const scwSigner = scwProvider.getSigner()
      const greeter = new ethers.Contract(GREETER_ADDR, GreeterArtifact.abi, scwSigner)
      const feedData = await scwProvider.getFeeData()
      const gasPrice = feedData.maxFeePerGas?.mul(2) // take gas price deviations in mind

      const estimate = await greeter.estimateGas.addGreet()

      const balance = await scwSigner.getBalance()
      const deployed = await scwProvider.isSCWDeployed()

      setBalance(balance)
      setDeployed(deployed)
      setMinFundsEstimate(estimate.mul(gasPrice ?? 1).add(ethers.utils.parseEther('0.0001')))

      setLoading(false)
    }

    if (scwProvider != null) {
      getTableDetails().catch((e: Error) => console.log(e))
    }
  }, [scwProvider])

  const sendTestTransaction = async (): Promise<void> => {
    setSendingTestTransaction(true)
    await transactionExecutioner(scwProvider)
    setSendingTestTransaction(false)
  }



  const prefundOrSendTestTransaction = (): void => {
    setSuccess(false)
    sendTestTransaction().then((e) => {
      setSuccess(true)
    }).catch((e) => {
      console.log(e)
        setSendingTestTransaction(false)
    })
  }

  return (
    <Fragment>
      <Button variant="outlined" onClick={() => setShowDialog(true)}>
        {buttonLabel}
      </Button>
      <Dialog disableEscapeKeyDown={false} fullWidth={true} maxWidth={'lg'} open={showDialog}>
        <DialogTitle>{buttonLabel}</DialogTitle>
        <DialogContent dividers>
          <Typography sx={{ mb: 1 }}>We will be sending the following test transaction to Greeter contract:</Typography>
          {transaction != null ? <pre>{JSON.stringify(transaction, null, 2)}</pre> : null}

          <Typography sx={{ mt: 2 }} variant={'body1'}>
            Balance of SCW:{' '}
            {/*
              // @ts-expect-error */}
            <BoldTypography variant="body1" component={'span'}>
              {loading ? 'loading...' : `${ethers.utils.formatEther(balance)} ETH`}
            </BoldTypography>
          </Typography>
          <Typography variant={'body1'}>
            Deployment status of SCW:{' '}
            {/*
              // @ts-expect-error */}
            <BoldTypography variant="body1" component={'span'}>
              {loading ? 'loading...' : deployed ? 'Deployed' : 'Not Deployed'}
            </BoldTypography>
          </Typography>
          {!loading && shouldPrefund && preFund.gt(0) ? (
            <Typography variant="subtitle1" sx={{ mt: 2, color: 'red' }}>
              You need funds to perform the test transaction!
            </Typography>
          ) : null}

          {!loading && shouldPrefund && preFund.gt(0) ? (
            <Typography variant="subtitle1" sx={{ mt: 2 }}>
              Minimum funds requirement for test transaction ={' '}
              {/*
              // @ts-expect-error */}
              <BoldTypography component="span">{ethers.utils.formatEther(minFundsEstimate)} ETH</BoldTypography>
            </Typography>
          ) : null}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowDialog(false)}>cancel</Button>
          <LoadingButton
            loading={
              loading ||
              sendingTestTransaction 
            }
            disabled={
              loading ||
              sendingTestTransaction 
            }
            variant="contained"
            autoFocus
            onClick={() => prefundOrSendTestTransaction()}
          >
            {loading ? 'Loading...' : 'Execute Transaction'}
          </LoadingButton>
        </DialogActions>
        {success&& <Alert severity="success">
          Success
        </Alert>}
      </Dialog>
    </Fragment>
  )
}
