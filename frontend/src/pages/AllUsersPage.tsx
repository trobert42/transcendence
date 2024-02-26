import DisplayUsers from '../components/DisplayUsers';
import Menu from '../components/Menu';

const AllUsersPage = () => {
  return (
    <div className="page">
      <div className="main-container">
        <div className="div-transparent"></div>
        <div className="main-container-element">
          <div>
            <p className="text-title-h1">All users</p>
          </div>
          <DisplayUsers />
        </div>
      </div>
      <Menu />
    </div>
  );
};

export default AllUsersPage;
