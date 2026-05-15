import User, { IUser } from '../models/User';

export async function createUser(userData: Partial<IUser>): Promise<IUser> {
  const row = new User(userData);
  await row.save();
  return row;
}

export async function findUserById(primaryKey: string) {
  return User.findById(primaryKey);
}
