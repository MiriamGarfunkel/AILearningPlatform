import User, { IUser } from '../models/User';

export async function registerIdentityRecord(userData: Partial<IUser>): Promise<IUser> {
  const row = new User(userData);
  await row.save();
  return row;
}

export async function locateIdentityByPrimaryKey(primaryKey: string) {
  return User.findById(primaryKey);
}
