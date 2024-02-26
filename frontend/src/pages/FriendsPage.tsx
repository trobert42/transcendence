import Menu from '../components/Menu';
import DisplayFriends from '../components/DisplayFriends';
import DisplayPendingFriends from '../components/DisplayPendingFriends';

const FriendsPage = () => {
  return (
    <div className="page">
      <div className="main-container">
        <div className="div-transparent"></div>
        <div className="main-container-element">
          <div>
            <p className="text-title-h1">Friends</p>
          </div>
          <DisplayFriends />
          <DisplayPendingFriends />
        </div>
      </div>
      <Menu />
    </div>
  );
};

export default FriendsPage;
