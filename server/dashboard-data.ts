import {neon} from '@neondatabase/serverless';
import type {IncomingMessage, ServerResponse} from 'node:http';

type ProjectStatus = 'Planning' | 'In Progress' | 'On Hold' | 'Completed';
type TaskStatus = 'To Do' | 'In Progress' | 'Completed';
type InvoiceStatus = 'Draft' | 'Sent' | 'Paid' | 'Overdue';
type TeamMemberStatus = 'Active' | 'Invited';
type TeamMemberRole = 'Admin' | 'Manager' | 'Member' | 'Viewer';

type DashboardUser = {
  clerkId?: string;
  name: string;
  firstName: string;
  email: string;
  imageUrl?: string;
  role?: string;
};

type Project = {
  id: string;
  name: string;
  client: string;
  status: ProjectStatus;
  progress: number;
  dueDate: string;
  color: string;
  icon: 'zap' | 'briefcase' | 'message' | 'clock' | 'inbox';
};

type Task = {
  id: string;
  title: string;
  projectId: string;
  status: TaskStatus;
  dueDate: string;
  assignee: string;
  hours: number;
};

type Invoice = {
  id: string;
  number: string;
  client: string;
  projectId: string;
  status: InvoiceStatus;
  amount: number;
  issueDate: string;
  dueDate: string;
};

type TeamMember = {
  id: string;
  name: string;
  email: string;
  role: TeamMemberRole;
  status: TeamMemberStatus;
  joinedAt: string;
};

type DashboardSnapshot = {
  user: DashboardUser;
  projects: Project[];
  tasks: Task[];
  invoices: Invoice[];
  teamMembers: TeamMember[];
};

type WorkspaceContext = {
  workspaceId: string;
  userId: string;
};

function sendJson(response: ServerResponse, statusCode: number, payload: unknown) {
  response.statusCode = statusCode;
  response.setHeader('Content-Type', 'application/json');
  response.end(JSON.stringify(payload));
}

function readJsonBody<T>(request: IncomingMessage) {
  return new Promise<T>((resolve, reject) => {
    let body = '';

    request.on('data', (chunk) => {
      body += chunk;
    });

    request.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (error) {
        reject(error);
      }
    });

    request.on('error', reject);
  });
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 48) || 'workspace';
}

function dateOnly(value: unknown) {
  if (!value) return '';
  if (typeof value === 'string') return value.slice(0, 10);
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  return String(value).slice(0, 10);
}

function numberValue(value: unknown) {
  return typeof value === 'number' ? value : Number(value || 0);
}

function createSql(databaseUrl: string) {
  return neon(databaseUrl);
}

async function ensureWorkspace(sql: ReturnType<typeof createSql>, user: DashboardUser): Promise<WorkspaceContext> {
  const userEmail = (user.email || 'guest@projecthub.local').toLowerCase();
  const workspaceSlug = slugify(userEmail.split('@')[1] || userEmail);
  const workspaceName = `${user.firstName || user.name || 'ProjectHub'}'s Workspace`;
  const clerkUserId = user.clerkId || `email:${userEmail}`;

  const [workspace] = await sql`
    insert into workspaces (name, slug)
    values (${workspaceName}, ${workspaceSlug})
    on conflict (slug) do update set
      name = excluded.name,
      updated_at = now()
    returning id
  `;

  const [dbUser] = await sql`
    insert into users (clerk_user_id, workspace_id, name, email, avatar_url, role)
    values (${clerkUserId}, ${workspace.id}, ${user.name || userEmail}, ${userEmail}, ${user.imageUrl || null}, ${user.role || 'Admin'})
    on conflict (clerk_user_id) do update set
      name = excluded.name,
      email = excluded.email,
      avatar_url = excluded.avatar_url,
      role = excluded.role,
      updated_at = now()
    returning id
  `;

  return {workspaceId: workspace.id, userId: dbUser.id};
}

async function ensureClient(sql: ReturnType<typeof createSql>, workspaceId: string, name: string) {
  const clientName = name.trim() || 'Internal';
  const [existingClient] = await sql`
    select id from clients
    where workspace_id = ${workspaceId} and lower(name) = lower(${clientName})
    order by created_at asc
    limit 1
  `;

  if (existingClient?.id) return existingClient.id as string;

  const [client] = await sql`
    insert into clients (workspace_id, name)
    values (${workspaceId}, ${clientName})
    returning id
  `;

  return client.id as string;
}

async function getAssigneeId(sql: ReturnType<typeof createSql>, workspaceId: string, assigneeName: string) {
  const [assignee] = await sql`
    select id from users
    where workspace_id = ${workspaceId} and name = ${assigneeName}
    limit 1
  `;

  return assignee?.id || null;
}

async function getDashboardData(sql: ReturnType<typeof createSql>, context: WorkspaceContext) {
  const [projects, tasks, invoices, users, invitations] = await Promise.all([
    sql`
      select p.id, p.name, coalesce(c.name, 'Internal') as client, p.status, p.progress, p.due_date, p.color, p.icon
      from projects p
      left join clients c on c.id = p.client_id
      where p.workspace_id = ${context.workspaceId}
      order by p.created_at desc
    `,
    sql`
      select t.id, t.title, t.project_id, t.status, t.due_date, coalesce(u.name, 'Unassigned') as assignee, t.hours
      from tasks t
      left join users u on u.id = t.assignee_id
      where t.workspace_id = ${context.workspaceId}
      order by t.created_at desc
    `,
    sql`
      select i.id, i.number, coalesce(c.name, 'Internal') as client, i.project_id, i.status, i.amount, i.issue_date, i.due_date
      from invoices i
      left join clients c on c.id = i.client_id
      where i.workspace_id = ${context.workspaceId}
      order by i.created_at desc
    `,
    sql`
      select id, name, email, role, created_at
      from users
      where workspace_id = ${context.workspaceId}
      order by created_at asc
    `,
    sql`
      select id, email, role, status, created_at
      from team_invitations
      where workspace_id = ${context.workspaceId}
      order by created_at desc
    `,
  ]);

  return {
    projects: projects.map((project) => ({
      id: project.id,
      name: project.name,
      client: project.client,
      status: project.status,
      progress: numberValue(project.progress),
      dueDate: dateOnly(project.due_date),
      color: project.color || 'indigo',
      icon: project.icon || 'briefcase',
    })),
    tasks: tasks.map((task) => ({
      id: task.id,
      title: task.title,
      projectId: task.project_id || '',
      status: task.status,
      dueDate: dateOnly(task.due_date),
      assignee: task.assignee,
      hours: numberValue(task.hours),
    })),
    invoices: invoices.map((invoice) => ({
      id: invoice.id,
      number: invoice.number,
      client: invoice.client,
      projectId: invoice.project_id || '',
      status: invoice.status,
      amount: numberValue(invoice.amount),
      issueDate: dateOnly(invoice.issue_date),
      dueDate: dateOnly(invoice.due_date),
    })),
    teamMembers: [
      ...users.map((member) => ({
        id: member.id,
        name: member.name,
        email: member.email,
        role: member.role,
        status: 'Active' as TeamMemberStatus,
        joinedAt: dateOnly(member.created_at),
      })),
      ...invitations.map((invite) => ({
        id: invite.id,
        name: invite.email.split('@')[0],
        email: invite.email,
        role: invite.role,
        status: invite.status === 'accepted' ? 'Active' : 'Invited' as TeamMemberStatus,
        joinedAt: dateOnly(invite.created_at),
      })),
    ],
  };
}

async function saveDashboardData(sql: ReturnType<typeof createSql>, context: WorkspaceContext, snapshot: DashboardSnapshot) {
  for (const member of snapshot.teamMembers) {
    if (member.status === 'Active') {
      await sql`delete from team_invitations where id = ${member.id} and workspace_id = ${context.workspaceId}`;
      await sql`
        insert into users (id, clerk_user_id, workspace_id, name, email, role)
        values (${member.id}, ${`manual:${member.id}`}, ${context.workspaceId}, ${member.name}, ${member.email.toLowerCase()}, ${member.role})
        on conflict (id) do update set
          name = excluded.name,
          email = excluded.email,
          role = excluded.role,
          updated_at = now()
      `;
    } else {
      await sql`
        insert into team_invitations (id, workspace_id, invited_by, email, role, status)
        values (${member.id}, ${context.workspaceId}, ${context.userId}, ${member.email.toLowerCase()}, ${member.role}, 'pending')
        on conflict (id) do update set
          email = excluded.email,
          role = excluded.role,
          status = excluded.status
      `;
    }
  }

  for (const project of snapshot.projects) {
    const clientId = await ensureClient(sql, context.workspaceId, project.client);

    await sql`
      insert into projects (id, workspace_id, client_id, name, status, progress, due_date, color, icon, created_by)
      values (${project.id}, ${context.workspaceId}, ${clientId}, ${project.name}, ${project.status}, ${project.progress}, ${project.dueDate || null}, ${project.color}, ${project.icon}, ${context.userId})
      on conflict (id) do update set
        client_id = excluded.client_id,
        name = excluded.name,
        status = excluded.status,
        progress = excluded.progress,
        due_date = excluded.due_date,
        color = excluded.color,
        icon = excluded.icon,
        updated_at = now()
    `;
  }

  for (const task of snapshot.tasks) {
    const assigneeId = await getAssigneeId(sql, context.workspaceId, task.assignee);

    await sql`
      insert into tasks (id, workspace_id, project_id, title, status, due_date, assignee_id, hours, created_by)
      values (${task.id}, ${context.workspaceId}, ${task.projectId || null}, ${task.title}, ${task.status}, ${task.dueDate || null}, ${assigneeId}, ${task.hours}, ${context.userId})
      on conflict (id) do update set
        project_id = excluded.project_id,
        title = excluded.title,
        status = excluded.status,
        due_date = excluded.due_date,
        assignee_id = excluded.assignee_id,
        hours = excluded.hours,
        updated_at = now()
    `;
  }

  for (const invoice of snapshot.invoices) {
    const clientId = await ensureClient(sql, context.workspaceId, invoice.client);

    await sql`
      insert into invoices (id, workspace_id, client_id, project_id, number, status, amount, issue_date, due_date)
      values (${invoice.id}, ${context.workspaceId}, ${clientId}, ${invoice.projectId || null}, ${invoice.number}, ${invoice.status}, ${invoice.amount}, ${invoice.issueDate || null}, ${invoice.dueDate || null})
      on conflict (id) do update set
        client_id = excluded.client_id,
        project_id = excluded.project_id,
        number = excluded.number,
        status = excluded.status,
        amount = excluded.amount,
        issue_date = excluded.issue_date,
        due_date = excluded.due_date,
        updated_at = now()
    `;
  }
}

function getUserFromUrl(request: IncomingMessage): DashboardUser {
  const url = new URL(request.url || '/', 'http://projecthub.local');

  return {
    clerkId: url.searchParams.get('clerkId') || undefined,
    name: url.searchParams.get('name') || 'ProjectHub User',
    firstName: url.searchParams.get('firstName') || 'there',
    email: url.searchParams.get('email') || 'guest@projecthub.local',
    imageUrl: url.searchParams.get('imageUrl') || undefined,
    role: url.searchParams.get('role') || 'Admin',
  };
}

export function createDashboardDataHandler(env: Record<string, string>) {
  const databaseUrl = env.DATABASE_URL;

  return async (request: IncomingMessage, response: ServerResponse) => {
    if (!databaseUrl) {
      sendJson(response, 500, {error: 'Missing DATABASE_URL on the server.'});
      return;
    }

    const sql = createSql(databaseUrl);

    try {
      if (request.method === 'GET') {
        const user = getUserFromUrl(request);
        const context = await ensureWorkspace(sql, user);
        const data = await getDashboardData(sql, context);
        sendJson(response, 200, data);
        return;
      }

      if (request.method === 'PUT') {
        const snapshot = await readJsonBody<DashboardSnapshot>(request);
        const context = await ensureWorkspace(sql, snapshot.user);
        await saveDashboardData(sql, context, snapshot);
        const data = await getDashboardData(sql, context);
        sendJson(response, 200, data);
        return;
      }

      sendJson(response, 405, {error: 'Method not allowed.'});
    } catch (error) {
      sendJson(response, 500, {
        error: error instanceof Error ? error.message : 'Dashboard database request failed.',
      });
    }
  };
}
