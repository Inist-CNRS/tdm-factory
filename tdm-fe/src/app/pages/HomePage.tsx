import DescriptionIcon from '@mui/icons-material/Description';
import FileCopyIcon from '@mui/icons-material/FileCopy';
import { Container } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import './scss/HomePage.scss';

const HomePage = () => {
    const navigate = useNavigate();

    const handleChoice = (type: 'article' | 'corpus') => {
        navigate(`/process/${type}`);
    };

    return (
        <Container className="home-page">
            <h1>
                Chargez vos données et découvrez les résultats
                <br />
                des services TDM
            </h1>

            <div className="choices-container">
                <button
                    className="choice-card"
                    onClick={() => {
                        handleChoice('article');
                    }}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                            handleChoice('article');
                        }
                    }}
                    tabIndex={0}
                    aria-label="Traiter un article scientifique"
                >
                    <div className="card-content">
                        <div className="icon-container">
                            <DescriptionIcon className="card-icon" />
                        </div>
                        <div className="bottom-container">
                            <span className="title-text">Traiter un article scientifique</span>
                            <span className="start-button">Commencer →</span>
                        </div>
                    </div>
                </button>

                <button
                    className="choice-card"
                    onClick={() => {
                        handleChoice('corpus');
                    }}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                            handleChoice('corpus');
                        }
                    }}
                    tabIndex={0}
                    aria-label="Traiter un corpus d'articles scientifiques"
                >
                    <div className="card-content">
                        <div className="icon-container">
                            <FileCopyIcon className="card-icon" />
                        </div>
                        <div className="bottom-container">
                            <span className="title-text">
                                Traiter un corpus
                                <br />
                                d&lsquo;articles scientifiques
                            </span>
                            <span className="start-button">Commencer →</span>
                        </div>
                    </div>
                </button>
            </div>
        </Container>
    );
};

export default HomePage;
