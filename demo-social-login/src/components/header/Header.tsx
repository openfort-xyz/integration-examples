import { ReactElement } from 'react';

import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Link from '@mui/material/Link';



export const Header = (): ReactElement => {
  return (
    <AppBar position="static" color="transparent">
      <Toolbar>
        <Typography variant="h6" component="div" mr={4}>
          openfort
        </Typography>
        <Link href='https://openfort.xyz/docs'>Documentation</Link>
      </Toolbar>
    </AppBar>
  );
};
