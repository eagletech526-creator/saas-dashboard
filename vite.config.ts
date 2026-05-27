import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import type {IncomingMessage, ServerResponse} from 'node:http';
import path from 'path';
import {defineConfig, loadEnv} from 'vite';

type DashboardAiRequest = {
  message?: string;
  messages?: Array<{role: 'user' | 'assistant'; content: string}>;
  context?: {
    user?: {firstName?: string};
    summary?: {
      totalProjects?: number;
      totalTasks?: number;
      completedTasks?: number;
      overdueTasks?: number;
      hoursTracked?: number;
    };
    projects?: Array<{
      name?: string;
      status?: string;
      progress?: number;
      dueIn?: string;
    }>;
    tasks?: Array<{
      title?: string;
      status?: string;
      dueIn?: string;
      project?: string;
    }>;
  };
};

function readJsonBody(request: IncomingMessage) {
  return new Promise<DashboardAiRequest>((resolve, reject) => {
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

function sendJson(response: ServerResponse, statusCode: number, payload: unknown) {
  response.statusCode = statusCode;
  response.setHeader('Content-Type', 'application/json');
  response.end(JSON.stringify(payload));
}

function createLocalDashboardReply(body: DashboardAiRequest) {
  const firstName = body.context?.user?.firstName || 'there';
  const summary = body.context?.summary || {};
  const projects = body.context?.projects || [];
  const tasks = body.context?.tasks || [];
  const openTasks = tasks.filter((task) => task.status !== 'Completed');
  const riskyProjects = projects
    .filter((project) => project.status !== 'Completed')
    .slice(0, 3);
  const nextTasks = openTasks.slice(0, 3);

  return [
    `${firstName}, I can still help from the dashboard data while the hosted AI service is unavailable.`,
    `You have ${summary.totalProjects ?? projects.length} projects, ${summary.completedTasks ?? 0} of ${summary.totalTasks ?? tasks.length} tasks completed, and ${summary.hoursTracked ?? 0} tracked hours.`,
    riskyProjects.length
      ? `Watch these projects first: ${riskyProjects.map((project) => `${project.name} (${project.progress ?? 0}%, ${project.dueIn})`).join('; ')}.`
      : 'No active project risk is visible from the current data.',
    nextTasks.length
      ? `Next useful actions: ${nextTasks.map((task) => `${task.title} for ${task.project} (${task.dueIn})`).join('; ')}.`
      : 'There are no open tasks in the current dashboard data.',
  ].join(' ');
}

function uniqueValues(values: Array<string | undefined>) {
  return values.filter((value, index, array): value is string => Boolean(value) && array.indexOf(value) === index);
}

function getChatCompletionUrls(baseUrl: string) {
  const cleanBaseUrl = baseUrl.replace(/\/$/, '');
  const paths = cleanBaseUrl.endsWith('/api/v1') || cleanBaseUrl.endsWith('/v1')
    ? ['/chat/completions']
    : ['/api/v1/chat/completions', '/chat/completions', '/v1/chat/completions'];

  return paths.map((pathName) => `${cleanBaseUrl}${pathName}`);
}

function createDashboardAiHandler(env: Record<string, string>) {
  return async (request: IncomingMessage, response: ServerResponse) => {
    if (request.method !== 'POST') {
      sendJson(response, 405, {error: 'Method not allowed.'});
      return;
    }

    try {
      const body = await readJsonBody(request);
      const message = body.message?.trim();

      if (!message) {
        sendJson(response, 400, {error: 'Message is required.'});
        return;
      }

      const apiKey = env.TOROUTER_API_KEY || env.DEEPSEEK_API_KEY;

      if (!apiKey) {
        sendJson(response, 200, {
          mode: 'local',
          reply: createLocalDashboardReply(body),
        });
        return;
      }

      const baseUrl =
        env.TOROUTER_OPENAI_BASE_URL ||
        env.DEEPSEEK_OPENAI_BASE_URL ||
        'https://portal.torouter.ai';
      const modelCandidates = uniqueValues([
        env.TOROUTER_MODEL,
        env.DEEPSEEK_MODEL,
        'deepseek-v4-flash',
        'deepseek/deepseek-v4-flash',
        'deepseek-chat',
      ]);
      const recentMessages = (body.messages || [])
        .filter((item) => item.role === 'user' || item.role === 'assistant')
        .slice(-8);

      const messages = [
        {
          role: 'system',
          content:
            'You are ProjectHub AI, a fluent and practical project operations assistant. Be concise, warm, specific, and helpful. Use the supplied dashboard context as the source of truth. Mention concrete projects, tasks, due dates, workload, blockers, and next actions when relevant. Do not invent data that is not present.',
        },
        {
          role: 'user',
          content: `Dashboard context:\n${JSON.stringify(body.context, null, 2)}`,
        },
        ...recentMessages,
        {role: 'user', content: message},
      ];
      let lastError = 'The hosted AI service could not complete the request.';

      for (const url of getChatCompletionUrls(baseUrl)) {
        for (const model of modelCandidates) {
          const aiResponse = await fetch(url, {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${apiKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              model,
              temperature: 0.45,
              max_tokens: 700,
              messages,
            }),
          });

          const data = await aiResponse.json().catch(() => ({}));

          if (aiResponse.ok) {
            sendJson(response, 200, {
              mode: 'hosted',
              provider: baseUrl.includes('torouter') ? 'torouter' : 'openai-compatible',
              model,
              reply:
                data.choices?.[0]?.message?.content ||
                'I received the request, but no response text came back.',
            });
            return;
          }

          lastError = data.error?.message || `The hosted AI service returned ${aiResponse.status}.`;
        }
      }

      sendJson(response, 200, {
        mode: 'local',
        warning: lastError,
        reply: createLocalDashboardReply(body),
      });
    } catch (error) {
      sendJson(response, 200, {
        mode: 'local',
        warning: error instanceof Error ? error.message : 'AI request failed.',
        reply: createLocalDashboardReply({}),
      });
    }
  };
}

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, '.', '');
  const dashboardAiHandler = createDashboardAiHandler(env);

  return {
    plugins: [
      {
        name: 'projecthub-dashboard-ai',
        configureServer(server) {
          server.middlewares.use('/api/ai/dashboard', dashboardAiHandler);
        },
        configurePreviewServer(server) {
          server.middlewares.use('/api/ai/dashboard', dashboardAiHandler);
        },
      },
      react(),
      tailwindcss(),
    ],
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
