import '~/app/App.scss';

import Menu from '~/app/components/Menu';
import Database from '~/app/page/Database';
import File from '~/app/page/File';
import Log from '~/app/page/Log';
import Setting from '~/app/page/Setting';
import { getPageTitle } from '~/app/util/utils';

import MenuIcon from '@mui/icons-material/Menu';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import { useEffect, useMemo, useState } from 'react';

import type { Page } from '~/app/util/type';

const App = () => {
    const [page, setPage] = useState<Page>('home');
    const [open, setOpen] = useState(false);

    const title = useMemo(() => {
        return getPageTitle(page);
    }, [page]);

    useEffect(() => {
        document.title = `IA Factory - Administration - ${title}`;
    }, [title]);

    const toggleDrawer = (newOpen: boolean) => () => {
        setOpen(newOpen);
    };

    const handlePageChange = (newPage: Page) => {
        setPage(newPage);
        setOpen(false);
    };

    return (
        <Box sx={{ flexGrow: 1 }}>
            <AppBar position="static">
                <Toolbar variant="dense">
                    <IconButton
                        onClick={toggleDrawer(true)}
                        edge="start"
                        color="inherit"
                        aria-label="menu"
                        sx={{ mr: 2 }}
                    >
                        <MenuIcon />
                    </IconButton>
                    <Typography variant="h6" color="inherit" component="div">
                        {title}
                    </Typography>
                </Toolbar>
            </AppBar>
            <Drawer open={open} onClose={toggleDrawer(false)}>
                <Menu onChange={handlePageChange} />
            </Drawer>

            <Container id="container" maxWidth="xl" sx={{ padding: '24px' }}>
                {page === 'database' ? <Database /> : null}
                {page === 'file' ? <File /> : null}
                {page === 'log' ? <Log /> : null}
                {page === 'setting' ? <Setting /> : null}
            </Container>
        </Box>
    );
};

export default App;
