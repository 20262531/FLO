import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
export const members = sqliteTable('members', {email:text('email').primaryKey(), name:text('name').notNull(), role:text('role').notNull(), department:text('department').notNull(), active:integer('active').notNull().default(1)});
export const tasks = sqliteTable('tasks', {id:text('id').primaryKey(), data:text('data').notNull(), version:integer('version').notNull().default(1)});
export const rooms = sqliteTable('rooms', {id:text('id').primaryKey(), data:text('data').notNull(), version:integer('version').notNull().default(1)});
export const events = sqliteTable('events', {id:text('id').primaryKey(), taskId:text('task_id').notNull(), actor:text('actor').notNull(), at:text('at').notNull(), message:text('message').notNull()});
export const attachments = sqliteTable('attachments', {id:text('id').primaryKey(), taskId:text('task_id').notNull(), name:text('name').notNull(), actor:text('actor').notNull(), at:text('at').notNull(), mime:text('mime').notNull()});
