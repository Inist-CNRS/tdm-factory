import { getPageTitle } from '~/app/util/utils';

import FolderIcon from '@mui/icons-material/Folder';
import HomeIcon from '@mui/icons-material/Home';
import ScienceIcon from '@mui/icons-material/Science';
import TerminalIcon from '@mui/icons-material/Terminal';
import Box from '@mui/material/Box';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';

import type { Page } from '~/app/util/type';

type MenuProps = {
    onChange: (page: Page) => void;
};

const Menu = ({ onChange }: MenuProps) => {
    const handleClick = (page: Page) => () => {
        onChange(page);
    };

    return (
        <Box sx={{ width: 250 }} role="presentation">
            <List>
                <ListItem disablePadding>
                    <ListItemButton onClick={handleClick('home')}>
                        <ListItemIcon>
                            <HomeIcon />
                        </ListItemIcon>
                        <ListItemText primary={getPageTitle('home')} />
                    </ListItemButton>
                </ListItem>

                <ListItem disablePadding>
                    <ListItemButton onClick={handleClick('database')}>
                        <ListItemIcon>
                            <ScienceIcon />
                        </ListItemIcon>
                        <ListItemText primary={getPageTitle('database')} />
                    </ListItemButton>
                </ListItem>

                <ListItem disablePadding>
                    <ListItemButton onClick={handleClick('file')}>
                        <ListItemIcon>
                            <FolderIcon />
                        </ListItemIcon>
                        <ListItemText primary={getPageTitle('file')} />
                    </ListItemButton>
                </ListItem>

                <ListItem disablePadding>
                    <ListItemButton onClick={handleClick('log')}>
                        <ListItemIcon>
                            <TerminalIcon />
                        </ListItemIcon>
                        <ListItemText primary={getPageTitle('log')} />
                    </ListItemButton>
                </ListItem>
            </List>
        </Box>
    );
};

export default Menu;
