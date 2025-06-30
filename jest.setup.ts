// jest.setup.ts

jest.mock('@/middleware/bearAuth', () => ({
  adminRoleAuth: (req, res, next) => next(),
  adminOrMemberAuth: (req, res, next) => next(),
}));

jest.mock('@/middleware/googleMailer', () => ({
  sendNotificationEmail: jest.fn(() => Promise.resolve()),
}));
