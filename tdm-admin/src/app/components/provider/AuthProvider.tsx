import { login } from '~/app/services/admin/login';
import { setAuth } from '~/app/services/Environment';

import { Button, CircularProgress } from '@mui/material';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useState } from 'react';

import type { PropsWithChildren, ChangeEvent, FormEvent } from 'react';

const text = {
    title: 'Connecté vous',
    label: {
        username: 'Username',
        password: 'Password',
    },
    button: 'Connection',
};

const AuthProvider = ({ children }: PropsWithChildren) => {
    const [isWaiting, setIsWaiting] = useState(false);
    const [isValide, setIsValide] = useState(true);
    const [isLogged, setIsLogged] = useState(false);
    const [username, setUsername] = useState('user');
    const [password, setPassword] = useState('');

    const handleLogin = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setAuth(username, password);
        setIsWaiting(true);
        login().then((logged) => {
            setIsWaiting(false);
            if (logged) {
                setIsValide(true);
                setIsLogged(true);
            } else {
                setIsValide(false);
                setIsLogged(false);
            }
        });
    };

    const handleUsernameChange = (event: ChangeEvent<HTMLInputElement>) => {
        setUsername(event.target.value);
    };

    const handlePasswordChange = (event: ChangeEvent<HTMLInputElement>) => {
        setPassword(event.target.value);
    };

    if (isLogged && isValide) {
        return children;
    }

    return (
        <Box mt={6}>
            <Container maxWidth="xs">
                <Paper>
                    <form
                        style={{
                            padding: '24px',
                            display: 'flex',
                            gap: '8px',
                            flexDirection: 'column',
                            alignItems: 'center',
                        }}
                        onSubmit={handleLogin}
                    >
                        <Typography variant="h6">{text.title}</Typography>
                        <TextField
                            size="small"
                            fullWidth
                            label={text.label.username}
                            value={username}
                            onChange={handleUsernameChange}
                            error={!isValide}
                        />
                        <TextField
                            size="small"
                            fullWidth
                            label={text.label.password}
                            value={password}
                            onChange={handlePasswordChange}
                            error={!isValide}
                        />
                        <Button variant="contained" fullWidth type="submit">
                            {isWaiting ? <CircularProgress size="1.75em" color="inherit" /> : text.button}
                        </Button>
                    </form>
                </Paper>
            </Container>
        </Box>
    );
};

export default AuthProvider;
