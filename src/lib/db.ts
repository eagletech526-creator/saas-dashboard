import { neon } from '@neondatabase/serverless';

// This is a placeholder for your actual DATABASE_URL from Neon.
// You should set this in your environment variables.
const sql = neon(import.meta.env.DATABASE_URL || "");

/**
 * Example usage:
 * 
 * export async function getProjects() {
 *   const projects = await sql`SELECT * FROM projects`;
 *   return projects;
 * }
 */

export default sql;
