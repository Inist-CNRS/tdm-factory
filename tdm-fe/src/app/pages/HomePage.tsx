import { useNavigate } from 'react-router-dom';
import { Container } from '@mui/material';
import DescriptionIcon from '@mui/icons-material/Description';
import FileCopyIcon from '@mui/icons-material/FileCopy';
import './scss/HomePage.scss';

const HomePage = () => {
    const navigate = useNavigate();

    const handleChoice = (type: 'article' | 'corpus') => {
        navigate(`/process/${type}`);
    };

    return (
        <Container className="home-page">
            <h1>
                Chargez vos corpus et découvrez les résultats<br />
                des services TDM
            </h1>
            
            <h2>Commencer un traitement</h2>
            
            <div className="choices-container">
                <div 
                    className="choice-card"
                    onClick={() => handleChoice('article')}
                >
                    <div className="card-content">
                        <div className="icon-container">
                            <DescriptionIcon className="card-icon" />
                        </div>
                        <div className="bottom-container">
                            <span className="title-text">Traiter un article scientifique</span>
                            <span className="start-button">
                                Commencer →
                            </span>
                        </div>
                    </div>
                </div>

                <div 
                    className="choice-card"
                    onClick={() => handleChoice('corpus')}
                >
                    <div className="card-content">
                        <div className="icon-container">
                            <FileCopyIcon className="card-icon" />
                        </div>
                        <div className="bottom-container">
                            <span className="title-text">Traiter un corpus<br />d'articles scientifiques</span>
                            <span className="start-button">
                                Commencer →
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </Container>
    );
};

export default HomePage;
