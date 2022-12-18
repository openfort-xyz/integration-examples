import { ReactElement } from 'react';

import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';


export const Header = (): ReactElement => {
  return (
    <AppBar position="static" color="transparent">
      <Toolbar>

        <Typography variant="h6" component="div" mr={4}>
          Openfort
        </Typography>

      </Toolbar>
    </AppBar>
  );
};
