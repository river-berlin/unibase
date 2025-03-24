// Export all models
import Conversations, { ConversationData } from './conversations';
import Folders, { FolderData } from './folders';
import Messages, { MessageData, MessageWithObject } from './messages';
import Objects, { ObjectData, ObjectWithMessageData } from './objects';
import OrganizationMembers, { OrganizationMemberData, OrganizationMemberWithUser } from './organization-members';
import Organizations, { OrganizationData } from './organizations';
import Projects, { ProjectData } from './projects';
import Users, { UserData } from './users';

// Export the database connection
import { db, DB } from '../db';

// Export all models
export {
  // Models
  Conversations,
  Folders,
  Messages,
  Objects,
  OrganizationMembers,
  Organizations,
  Projects,
  Users,
  
  // Interfaces
  ConversationData,
  FolderData,
  MessageData,
  MessageWithObject,
  ObjectData,
  ObjectWithMessageData,
  OrganizationMemberData,
  OrganizationMemberWithUser,
  OrganizationData,
  ProjectData,
  UserData,
  
  // Database
  db,
  DB
};
