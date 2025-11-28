import { User } from "./user.model";

interface Post {
  _id: string;
  content: string;
  author: User;
  createdAt: Date;
  updatedAt: Date;
  isTemp?: boolean;
}
