import { GitHubIssue } from "../github-types";

export function displayIssues(container: HTMLDivElement, issues: GitHubIssue[]) {
  container.innerHTML = "";
  let delay = 0;
  const baseDelay = 125; // Base delay in milliseconds

  issues.forEach((issue, index) => {
    const issueWrapper = document.createElement("div");
    const issueElement = document.createElement("div");
    issueWrapper.classList.add("issue-element-wrapper");
    issueElement.classList.add("issue-element-inner");
    issueWrapper.classList.add("issue-fade-in");

    // Calculate the delay using an approximation of the cubic-bezier(0,1,1,1) easing function
    delay = baseDelay * ((index * index) / (issues.length - 1));

    issueElement.style.animationDelay = `${delay}ms`;

    // Parse organization name and repository name from the issue's URL

    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const mirrorUrls = issue.body.match(urlRegex);

    const urlPattern = /https:\/\/github\.com\/([^/]+)\/([^/]+)\//;
    const match = mirrorUrls?.shift()?.match(urlPattern);
    const organizationName = match?.[1];
    const repositoryName = match?.[2];

    type LabelKey = "Pricing: " | "Time: " | "Priority: ";

    const labelOrder: Record<LabelKey, number> = { "Pricing: ": 1, "Time: ": 2, "Priority: ": 3 };

    issue.labels.sort((a, b) => {
      const matchA = a.name.match(/^(Pricing|Time|Priority): /)?.[0] as LabelKey | undefined;
      const matchB = b.name.match(/^(Pricing|Time|Priority): /)?.[0] as LabelKey | undefined;
      const orderA = matchA ? labelOrder[matchA] : 0;
      const orderB = matchB ? labelOrder[matchB] : 0;
      return orderA - orderB;
    });

    // Filter labels that begin with specific prefixes
    const filteredLabels = issue.labels.filter((label) => {
      return label.name.startsWith("Time: ") || label.name.startsWith("Pricing: ") || label.name.startsWith("Priority: ");
    });

    // Map the filtered labels to HTML elements
    const labels = filteredLabels.map((label) => {
      // Remove the prefix from the label name
      const name = label.name.replace(/(Time|Pricing|Priority): /, "");

      return `<div class="label">${name}</div>`;
    });

    issueElement.innerHTML = `
        <h3>${issue.title}</h3>
        <div class="partner"><p class="organization-name">${organizationName}</p><p class="repository-name">${repositoryName}</p></div>
        <div class="labels">${labels.join("")}</div>
      `;

    issueElement.addEventListener("click", () => {
      console.log(issue);

      //   console.log(foundUrls);
      //   window.open(foundUrls?.shift(), "_blank");
    });

    issueWrapper.appendChild(issueElement);

    // Append the issue element after the delay
    setTimeout(() => {
      container.appendChild(issueWrapper);
      // Trigger the animation by adding the 'visible' class
      issueElement.classList.add("visible");
    }, delay);
  });
}
