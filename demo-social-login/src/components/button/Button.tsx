import { ReactElement } from 'react'
import LoadingButton from '@mui/lab/LoadingButton'

// default loading false
export const Button = ({action, title, loading}: {
  action: () => void
  title: string
  loading?: boolean
}): ReactElement => {


  return (
    <LoadingButton
      loading={loading}
      loadingPosition="end"
      variant="contained"
      onClick={() => action()}
    >
      
      {title}
    </LoadingButton>
  )
}
