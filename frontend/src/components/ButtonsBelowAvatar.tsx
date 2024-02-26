import { Friend, User } from '../utils/interfaces';
import {
  BiSolidUserCheck,
  BiSolidUserPlus,
  BiSolidUserX,
} from 'react-icons/bi';
import { FiLoader } from 'react-icons/fi';
import ButtonUserAction from './ButtonUserAction';
import { useUsers } from '../context/UsersContext';

type ButtonsBelowAvatarProps = {
  auth: User;
  user: Friend;
  pendingFriends?: Friend[];
};

export const ButtonsBelowAvatar = ({ auth, user }: ButtonsBelowAvatarProps) => {
  const {
    friends,
    pendingFriends,
    addFriend,
    acceptFriend,
    rejectFriend,
  } = useUsers();

  const isFriend = friends.some((friend) => friend.id === user.id);
  const isUserPendingFriend = pendingFriends.some(
    (pendingFriend) => pendingFriend.id === user.id,
  );

  // eslint-disable-next-line
  const isUserPendingFriendReceiver = pendingFriends.some(
    (pendingFriend) => pendingFriend.id === user.id && pendingFriend.isReceiver,
  );

  const isUserPendingFriendInitiator = pendingFriends.some(
    (pendingFriend) =>
      pendingFriend.id === user.id && !pendingFriend.isReceiver,
  );

  let isAuthReceiver = false;
  if (!isFriend && isUserPendingFriend && isUserPendingFriendInitiator) {
    isAuthReceiver = true;
  }

  return (
    <>
      {auth.username !== user.username &&
        isAuthReceiver &&
        !isFriend &&
        isUserPendingFriend && (
          <>
            <ButtonUserAction
              className="button-form button-green"
              text="Accept invitation"
              onClick={() => acceptFriend(user?.id)}
              Icon={BiSolidUserCheck}
              styleIcon={{ fontSize: '25px' }}
            />
            <ButtonUserAction
              className="button-form button-red"
              text="Refuse invitation"
              onClick={() => {
                rejectFriend(user?.id);
              }}
              Icon={BiSolidUserX}
              styleIcon={{ fontSize: '25px' }}
            />
          </>
        )}
      {auth.username !== user.username &&
        isUserPendingFriend &&
        !isUserPendingFriendInitiator && (
          <ButtonUserAction
            className="button-form button-grey"
            text="Waiting for friendship"
            Icon={FiLoader}
          />
        )}

      {auth.username !== user.username && !isUserPendingFriend && !isFriend && (
        <ButtonUserAction
          className="button-form button-green"
          text="Add friend"
          onClick={() => {
            addFriend(user);
          }}
          Icon={BiSolidUserPlus}
          styleIcon={{ fontSize: '25px' }}
        />
      )}
    </>
  );
};
