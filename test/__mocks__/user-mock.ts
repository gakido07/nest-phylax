import { User, UserRepository } from '../../src/common/types';

export const ADMIN_USER_MOCK: User = {
  id: 'fcf5bb57-7641-4a70-a121-9194e9abc530',
  password: 'rick_password',
  getRefreshTokens() {
    return [
      {
        jti: '123',
        exp: '123',
        sub: '123',
        role: 'admin',
        value: '123',
      },
    ];
  },
  getUsername: () => 'ricksanchez@gmail.com',
};

export const USER_MOCK: User = {
  id: 'fcf5bb57-7641-4a70-a121-9194e9abc530',
  getUsername: () => 'mortysmith@gmail.com',
  password: 'morty_password',
};

const USERS = [
  ADMIN_USER_MOCK,
  USER_MOCK,
  ...Array(8)
    .fill(8)
    .map((_, index) => ({
      id: `fcf5bb57-7641-4a70-a121-9194e9abc53${index}`,
      getUsername: () => `user${index}@gmail.com`,
      password: `user_password_${index}`,
    })),
];

export const USER_REPOSITORY_MOCK: UserRepository = {
  findOneById(id) {
    return Promise.resolve(USERS.find(user => user.id === id));
  },
  saveRefreshToken() {
    return Promise.resolve();
  },
  getUserRole(_) {
    return Promise.resolve('user');
  },
  findUserByUsername(username) {
    return Promise.resolve(USERS.find(user => user.getUsername() === username));
  },
};
