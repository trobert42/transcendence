import React, { createContext, useState, useContext, useEffect } from 'react';
import { Friend, User } from '../utils/interfaces';
import { axiosPrivate } from '../utils/api';
import useAuth from '../hooks/useAuth';

type UsersContextType = {
  users: User[];
  friends: Friend[];
  pendingFriends: Friend[];
  addFriend: (friend: Friend) => void;
  acceptFriend: (friendId: number) => void;
  rejectFriend: (friendId: number) => void;
  removeFriend: (friendId: number) => void;
  blockUser: (userId: number) => void;
  unblockUser: (userId: number) => void;
};

const UsersContext = createContext<UsersContextType | undefined>(undefined);

export const UsersProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { auth }: any = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [pendingFriends, setPendingFriends] = useState<Friend[]>([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axiosPrivate.get('/users');
        setUsers(response.data);
      } catch (err) {
        console.error(err);
      }
    };

    const fetchFriends = async () => {
      try {
        const response = await axiosPrivate.get('/users/get-friends');
        setFriends(response.data);
      } catch (err) {
        console.error(err);
      }
    };

    const fetchPendingFriends = async () => {
      try {
        const response = await axiosPrivate.get('/users/get-pending-friends');
        setPendingFriends(response.data);
      } catch (err) {
      }
    };

    fetchUsers();
    fetchFriends();
    fetchPendingFriends();
  }, []);

  const addFriend = async (friend: Friend) => {
    try {
      if (auth) {
        const response = await axiosPrivate?.post('/users/add-friend', {
          friendId: friend.id,
        });
        if (response.data) {
          const friendWithIsReceiver = { ...friend, isReceiver: true };
          setPendingFriends((prevPendingFriends) => [
            ...prevPendingFriends,
            friendWithIsReceiver,
          ]);
        }
      }
    } catch (err) {
      if ((err as any).name === 'CanceledError') {
        return;
      }
    }
  };

  const acceptFriend = async (friendId: number) => {
    try {
      const response = await axiosPrivate?.post('/users/accept-friend', {
        friendId: friendId,
      });
      if (response) {
        setFriends((prevFriends) => [
          ...prevFriends,
          pendingFriends.find((friend) => friend.id === friendId)!,
        ]);
        setPendingFriends((prevPendingFriends) =>
          prevPendingFriends.filter((friend) => friend.id !== friendId),
        );
      }
    } catch (err) {
    }
  };

  const rejectFriend = async (friendId: number) => {
    try {
      const response = await axiosPrivate?.post('/users/reject-friend', {
        friendId: friendId,
      });
      if (response) {
        setPendingFriends((prevPendingFriends) =>
          prevPendingFriends.filter((friend) => friend.id !== friendId),
        );
      }
    } catch (err) {
    }
  };

  const removeFriend = async (friendId: number) => {
    try {
      const response = await axiosPrivate?.post('/users/remove-friend', {
        friendId: friendId,
      });
      if (response) {
        setFriends((prevFriends) =>
          prevFriends.filter((friend) => friend.id !== friendId),
        );
      }
    } catch (err) {}
  };

  const blockUser = async (userId: number | undefined) => {
    if (!userId) return;
    try {
      const response = await axiosPrivate?.patch(`/users/block/${userId}`);
      if (response) {
        setUsers(
          users.map((user) =>
            user.id === userId ? { ...user, isBlocked: true } : user,
          ),
        );
      }
    } catch (err) {
    }
  };

  const unblockUser = async (userId: number | undefined) => {
    if (!userId) return;
    try {
      const response = await axiosPrivate?.patch(`/users/unblock/${userId}`);
      if (response) {
        setUsers(
          users.map((user) =>
            user.id === userId ? { ...user, isBlocked: false } : user,
          ),
        );
      }
    } catch (err) {
    }
  };

  return (
    <UsersContext.Provider
      value={{
        users,
        friends,
        pendingFriends,
        addFriend,
        acceptFriend,
        rejectFriend,
        removeFriend,
        blockUser,
        unblockUser,
      }}
    >
      {children}
    </UsersContext.Provider>
  );
};

export const useUsers = () => {
  const context = useContext(UsersContext);
  if (context === undefined) {
    throw new Error('useUsers must be used within a FriendsProvider');
  }
  return context;
};
