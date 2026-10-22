
const OWNER = "brunoTibellio";
const REPO = "readme-turma-engenharia-de-software";

const statusElement = document.getElementById("status");
const activityList = document.getElementById("activity-list");
const refreshButton = document.getElementById("refresh-button");

function updateText(id, value) {
  document.getElementById(id).textContent = value;
}

function formatDate(dateString) {
  if (!dateString) return "Data indisponível";

  return new Date(dateString).toLocaleString("pt-BR", {
    dateStyle: "short",
    timeStyle: "short"
  });
}

async function githubRequest(endpoint) {
  const response = await fetch(
    `https://api.github.com/repos/${OWNER}/${REPO}/${endpoint}`,
    {
      headers: {
        Accept: "application/vnd.github+json"
      }
    }
  );

   if (!response.ok) {
    throw new Error(
      response.status === 403
        ? `Limite temporário da API do GitHub: ${endpoint}`
        : `Erro ${response.status} na consulta: ${endpoint || "repositório"}`
    );
  }

  return response.json();
}

function showActivity(commits) {
  activityList.replaceChildren();

  if (!commits.length) {
    activityList.textContent = "Nenhuma contribuição recente encontrada.";
    return;
  }

  commits.forEach((commit) => {
    const item = document.createElement("article");
    item.className = "activity-item";

    const icon = document.createElement("span");
    icon.className = "activity-icon";
    icon.textContent = "↗";

    const content = document.createElement("div");
    content.className = "activity-content";

    const title = document.createElement("p");
    const link = document.createElement("a");
    link.href = commit.html_url;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.textContent =
      commit.commit.message.split("\n")[0] || "Commit sem descrição";

    title.appendChild(link);

    const meta = document.createElement("div");
    meta.className = "activity-meta";

    const author =
      commit.author?.login ||
      commit.commit.author?.name ||
      "Autor não identificado";

    meta.textContent = `${author} · ${formatDate(commit.commit.author?.date)}`;

    content.append(title, meta);
    item.append(icon, content);
    activityList.appendChild(item);
  });
}

async function loadDashboard() {
  refreshButton.disabled = true;
  statusElement.textContent = "Consultando dados públicos do GitHub...";

  try {
    const [commits, pulls, repository, contributors] = await Promise.all([
      githubRequest("commits?per_page=100"),
      githubRequest("pulls?state=open&per_page=100"),
      githubRequest(""),
      githubRequest("contributors?per_page=100")
    ]);

    updateText("commit-count", commits.length);
    updateText("contributor-count", contributors.length);
    updateText("pr-count", pulls.length);
    updateText("star-count", repository.stargazers_count);

    showActivity(commits.slice(0, 8));

    statusElement.textContent =
      `Dados atualizados em ${new Date().toLocaleString("pt-BR")}.`;
  } catch (error) {
    statusElement.textContent = error.message;
    activityList.textContent =
      "Não foi possível carregar as contribuições. Confira sua conexão e tente novamente.";
  } finally {
    refreshButton.disabled = false;
  }
}

refreshButton.addEventListener("click", loadDashboard);

loadDashboard();
