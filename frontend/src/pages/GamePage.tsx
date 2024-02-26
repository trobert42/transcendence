import Menu from '../components/Menu';
import Pong from '../components/Pong';

const GamePage = () => {
  return (
    <div className="page">
      <div className="main-container">
        <div className="div-transparent"></div>
        <div className="main-container-element">
          <div>
            <p className="text-title-h1">Pong</p>
          </div>
          <Pong />
        </div>
      </div>
      <Menu />
    </div>
  );
};

export default GamePage;
