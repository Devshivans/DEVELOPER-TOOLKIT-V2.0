// ============================================================
//  DEV-COMMAND NAVIGATOR — DATA.JS
// ============================================================

const COMMANDS = [
  // ── GIT ──────────────────────────────────────────────────
  {
    id: "g01", cat: "git",
    name: "Undo Last Commit",
    cmd: "git reset --soft HEAD~1",
    desc: "Reverts the most recent commit while keeping all your changes staged and ready. Perfect for fixing typos or restructuring commits before pushing to the remote.",
    note: { type: "warning", text: "⚠️ Does not touch your files — changes stay staged. Safe to use before push." }
  },
  {
    id: "g02", cat: "git",
    name: "Stash Changes (Pop)",
    cmd: "git stash pop",
    desc: "Brings your temporarily saved work back AND <em>deletes</em> the saved copy. Like grabbing a sticky note from the drawer and throwing the drawer away.",
    note: { type: "danger", text: "⚠️ pop = restore + delete the stash. If something goes wrong, the stash is gone." }
  },
  {
    id: "g03", cat: "git",
    name: "Stash Changes (Apply)",
    cmd: "git stash apply",
    desc: "Brings back your temporarily saved work and <em>keeps</em> the saved copy too. Like photocopying a sticky note before putting it back.",
    note: { type: "tip", text: "✓ apply = restore + keep the stash. Safer than pop — reuse it later." }
  },
  {
    id: "g04", cat: "git",
    name: "New Branch",
    cmd: "git branch <name>",
    cmdHasVar: true,
    desc: "Creates a new local branch at the current HEAD pointer. You still need to switch to it with checkout.",
  },
  {
    id: "g05", cat: "git",
    name: "Checkout New Branch",
    cmd: "git checkout -b <branch-name>",
    cmdHasVar: true,
    desc: "Creates a new branch and immediately switches to it. One command instead of two.",
    note: { type: "tip", text: "✓ Shorthand for: git branch + git checkout combined." }
  },
  {
    id: "g06", cat: "git",
    name: "Delete Remote Branch",
    cmd: "git push origin --delete <name>",
    cmdHasVar: true,
    desc: "Permanently removes a branch from the remote origin server. Your local branch still exists until you delete it separately.",
    note: { type: "danger", text: "⚠️ This deletes the branch for EVERYONE on the team. Communicate first." }
  },
  {
    id: "g07", cat: "git",
    name: "Log Graph",
    cmd: "git log --oneline --graph",
    desc: "Displays the current history with a text-based ASCII graph of branches and merges. Great for visualizing the commit tree.",
  },
  {
    id: "g08", cat: "git",
    name: "Force Push",
    cmd: "git push --force",
    desc: "Overwrites the remote history with your local state. Used after a rebase but extremely risky on shared branches.",
    note: { type: "danger", text: "⚠️ NEVER use on main/master. Destroys teammates' history." }
  },
  {
    id: "g09", cat: "git",
    name: "Amend Commit",
    cmd: "git commit --amend",
    desc: "Adds new changes to the previous commit or edits its message. Rewrites the last commit instead of creating a new one.",
    note: { type: "warning", text: "⚠️ Don't amend already-pushed commits. Creates diverged history." }
  },
  {
    id: "g10", cat: "git",
    name: "Cherry Pick",
    cmd: "git cherry-pick <hash>",
    cmdHasVar: true,
    desc: "Applies the changes introduced by some existing commit from any branch onto your current branch.",
  },
  {
    id: "g11", cat: "git",
    name: "Fetch All",
    cmd: "git fetch --all",
    desc: "Downloads all objects and references from every remote without merging anything into your local branches.",
    note: { type: "tip", text: "✓ Safe — never modifies your local work. Always fetch before a rebase." }
  },
  {
    id: "g12", cat: "git",
    name: "Rebase on Main",
    cmd: "git rebase main",
    desc: "Replays your commits on top of the latest main branch. Makes history look linear — like you started work today.",
    note: { type: "danger", text: "⚠️ NEVER rebase public/shared branches. Only on your own local branches." }
  },
  {
    id: "g13", cat: "git",
    name: "Stage All Changes",
    cmd: "git add .",
    desc: "Adds all modified and new files in the current directory to the staging area for the next commit.",
    note: { type: "warning", text: "⚠️ Stages everything including accidental changes. Review with git diff first." }
  },
  {
    id: "g14", cat: "git",
    name: "Hard Reset",
    cmd: "git reset --hard HEAD~1",
    desc: "Completely wipes the last commit AND all its file changes. Like shredding a letter — gone forever.",
    note: { type: "danger", text: "⚠️ DANGER: file changes are permanently lost. Run git reflog first as backup." }
  },

  // ── LINUX ─────────────────────────────────────────────────
  {
    id: "l01", cat: "linux",
    name: "Make File Executable",
    cmd: "chmod +x filename.sh",
    cmdHasVar: true,
    desc: "Gives a file 'execute' permission — makes a script actually <em>runnable</em>. Without this, Linux refuses to run it.",
  },
  {
    id: "l02", cat: "linux",
    name: "Recursive Search",
    cmd: "grep -r 'search_text' /path/",
    cmdHasVar: true,
    desc: "Searches inside all files in a folder and its subfolders for a specific word or phrase. Like Ctrl+F for your entire filesystem.",
    note: { type: "tip", text: "✓ grep = search file CONTENTS. Use 'find' to search by filename instead." }
  },
  {
    id: "l03", cat: "linux",
    name: "Find Files by Name",
    cmd: `find . -name "*.log"`,
    desc: "Hunts for files matching a pattern starting from current directory. Searches filenames, not file contents.",
    note: { type: "warning", text: "⚠️ find searches filenames. grep searches file contents. Common confusion!" }
  },
  {
    id: "l04", cat: "linux",
    name: "Find Process by Name",
    cmd: "ps aux | grep <process>",
    cmdHasVar: true,
    desc: "Lists all running processes and filters them by the specified string using the pipe utility.",
  },
  {
    id: "l05", cat: "linux",
    name: "Kill Process Forcefully",
    cmd: "kill -9 <PID>",
    cmdHasVar: true,
    desc: "Force-terminates a process by its ID immediately, no questions asked. The '-9' means no mercy — the OS sends SIGKILL.",
    note: { type: "danger", text: "⚠️ Always try 'kill PID' first. -9 skips cleanup and may corrupt data." }
  },
  {
    id: "l06", cat: "linux",
    name: "Watch Live Logs",
    cmd: "tail -f /var/log/app.log",
    cmdHasVar: true,
    desc: "Watches a log file in real-time as new lines appear. The '-f' flag means 'follow'. Essential for debugging a live server.",
  },
  {
    id: "l07", cat: "linux",
    name: "Check Disk Space",
    cmd: "df -h",
    desc: "Shows how much disk space is used and available on all mounted drives. The '-h' means human-readable (GB instead of raw bytes).",
  },
  {
    id: "l08", cat: "linux",
    name: "POST Request via cURL",
    cmd: `curl -X POST -H "Content-Type: application/json" -d '{"key":"val"}' https://api.example.com`,
    desc: "Sends an HTTP POST request directly from the terminal. Invaluable for testing APIs without Postman or a browser.",
  },
  {
    id: "l09", cat: "linux",
    name: "Create Symbolic Link",
    cmd: "ln -s /original/path /link/path",
    desc: "Creates a symbolic link — a shortcut that points to another file or folder. Editing through the link edits the original.",
  },
  {
    id: "l10", cat: "linux",
    name: "Find Port in Use",
    cmd: "lsof -i :<port>",
    cmdHasVar: true,
    desc: "Shows which process is occupying a specific port. Run this when you get 'port already in use' errors.",
    note: { type: "tip", text: "✓ Follow up with 'kill -9 PID' to free the port." }
  },
  {
    id: "l11", cat: "linux",
    name: "Monitor CPU & Memory",
    cmd: "htop",
    desc: "An interactive, color-coded process monitor showing CPU, memory, and swap usage in real time. Press 'q' to exit.",
  },
  {
    id: "l12", cat: "linux",
    name: "Clean Working Directory",
    cmd: "git clean -fd",
    desc: "Removes all untracked files and directories from the current working tree. Leaves tracked files alone.",
    note: { type: "danger", text: "⚠️ Permanent. Untracked files are deleted — not sent to trash." }
  },
  {
    id: "l13", cat: "linux",
    name: "Check Memory Usage",
    cmd: "free -h",
    desc: "Displays total, used, and free memory in human-readable format. Quick way to check if your server is running low on RAM.",
  },
  {
    id: "l14", cat: "linux",
    name: "SSH Into Server",
    cmd: "ssh user@<host>",
    cmdHasVar: true,
    desc: "Opens a secure shell session to a remote server. Replace 'user' with your username and 'host' with the server IP or domain.",
  },

  // ── DOCKER ────────────────────────────────────────────────
  {
    id: "d01", cat: "docker",
    name: "Run Container (Detached)",
    cmd: "docker run -d -p <host>:<container> <image>",
    cmdHasVar: true,
    desc: "Starts a container in the <em>background</em> (detached mode). The '-p' flag maps your machine's port to the container's port.",
  },
  {
    id: "d02", cat: "docker",
    name: "Open Shell in Container",
    cmd: "docker exec -it <container_name> bash",
    cmdHasVar: true,
    desc: "Opens an interactive terminal inside a running container. Like SSH-ing into a mini computer that lives inside Docker.",
  },
  {
    id: "d03", cat: "docker",
    name: "Stream Container Logs",
    cmd: "docker logs -f <container_name>",
    cmdHasVar: true,
    desc: "Streams live log output from a container. The '-f' flag means follow — keeps watching like tail -f for containers.",
  },
  {
    id: "d04", cat: "docker",
    name: "Build Without Cache",
    cmd: "docker build --no-cache -t <image-name> .",
    cmdHasVar: true,
    desc: "Builds a Docker image from scratch, ignoring any cached layers. Use when a dependency change isn't being picked up.",
    note: { type: "warning", text: "⚠️ Slower than regular build. Only use when cache causes stale builds." }
  },
  {
    id: "d05", cat: "docker",
    name: "Compose Up with Build",
    cmd: "docker-compose up --build",
    desc: "Starts all services in docker-compose.yml AND rebuilds images first. Use after any Dockerfile change.",
    note: { type: "tip", text: "✓ vs 'docker-compose up' which uses cached images. Use --build after Dockerfile edits." }
  },
  {
    id: "d06", cat: "docker",
    name: "System Cleanup",
    cmd: "docker system prune -a",
    desc: "Deletes ALL stopped containers, dangling images, and unused networks. Great for reclaiming disk space on your dev machine.",
    note: { type: "danger", text: "⚠️ -a also removes unused images, not just dangling ones. Completely irreversible." }
  },
  {
    id: "d07", cat: "docker",
    name: "Copy File from Container",
    cmd: "docker cp <container>:/path/file.txt ./local/",
    cmdHasVar: true,
    desc: "Copies a file from inside a container to your host machine. Useful for extracting logs, configs, or build outputs.",
  },
  {
    id: "d08", cat: "docker",
    name: "Inspect Container Details",
    cmd: "docker inspect <container_name>",
    cmdHasVar: true,
    desc: "Dumps all metadata about a container — IP addresses, mounts, env vars, network settings. The full diagnostic report.",
  },
  {
    id: "d09", cat: "docker",
    name: "Live Container Stats",
    cmd: "docker stats",
    desc: "Live dashboard showing CPU, memory, network, and disk I/O for all running containers. Your container performance monitor.",
  },
  {
    id: "d10", cat: "docker",
    name: "List Volumes",
    cmd: "docker volume ls",
    desc: "Lists all named Docker volumes — the persistent storage that survives container restarts. Reveals orphaned volumes wasting space.",
  },
  {
    id: "d11", cat: "docker",
    name: "Remove All Containers",
    cmd: "docker rm -f $(docker ps -aq)",
    desc: "Forcefully removes all Docker containers currently present on the system, regardless of state.",
    note: { type: "danger", text: "⚠️ Removes running containers too. All running processes are killed instantly." }
  },
  {
    id: "d12", cat: "docker",
    name: "Check Running Containers",
    cmd: "docker ps",
    desc: "Lists all currently running containers with their IDs, image names, status, and port mappings. Your first diagnostic command.",
  },
  {
    id: "d13", cat: "docker",
    name: "Pull Latest Image",
    cmd: "docker pull <image>:latest",
    cmdHasVar: true,
    desc: "Downloads the latest version of an image from Docker Hub or your configured registry.",
    note: { type: "tip", text: "✓ Always pull before running in production to ensure you have the latest patches." }
  },
  {
    id: "d14", cat: "docker",
    name: "Compose Down",
    cmd: "docker-compose down",
    desc: "Stops and removes all containers, networks, and the default network created by docker-compose up.",
    note: { type: "tip", text: "✓ Add --volumes to also remove named volumes. Use -v flag carefully in production." }
  },
];

// ============================================================
//  ERROR LOOKUP DATABASE
// ============================================================
const ERRORS = [
  {
    id: "e01",
    keywords: ["permission denied", "permission", "denied", "publickey", "access denied"],
    title: "Permission Denied (publickey)",
    description: "SSH authentication failed. The private key file has insecure permissions or is not matching the remote host configuration.",
    fix: "chmod 400 key.pem",
    altFix: "ssh-add ~/.ssh/id_rsa",
    tags: ["Security fix", "Instant apply"]
  },
  {
    id: "e02",
    keywords: ["port already in use", "address already in use", "eaddrinuse", "bind: address already in use"],
    title: "Port Already in Use",
    description: "Another process is already listening on the port your app wants to use. You need to kill that process first.",
    fix: "lsof -i :<port> && kill -9 <PID>",
    altFix: "fuser -k 3000/tcp",
    tags: ["Port conflict", "Process kill"]
  },
  {
    id: "e03",
    keywords: ["container already in use", "container name already in use", "conflict", "container name"],
    title: "Container Name Already in Use",
    description: "Docker can't spawn the instance because a container with the same identifier is currently registered in the daemon.",
    fix: "docker rm -f <container_name>",
    altFix: "docker system prune",
    tags: ["Force removal", "Re-deploy ready"]
  },
  {
    id: "e04",
    keywords: ["no space left", "no space", "disk full", "device full", "enospc"],
    title: "No Space Left on Device",
    description: "Your disk is full. Docker images, logs, or large files have consumed all available storage.",
    fix: "docker system prune -a",
    altFix: "du -sh /* | sort -rh | head -20",
    tags: ["Cleanup", "Disk recovery"]
  },
  {
    id: "e05",
    keywords: ["command not found", "not found", "bash: command"],
    title: "Command Not Found",
    description: "The shell can't find the executable. Either it's not installed or not in your PATH environment variable.",
    fix: "export PATH=$PATH:/usr/local/bin",
    altFix: "which <command>",
    tags: ["PATH fix", "Environment"]
  },
  {
    id: "e06",
    keywords: ["merge conflict", "conflict", "automatic merge failed"],
    title: "Git Merge Conflict",
    description: "Git found overlapping changes in both branches and can't automatically decide which to keep. You need to resolve manually.",
    fix: "git mergetool",
    altFix: "git checkout --theirs <file>",
    tags: ["Manual resolve", "Use vimdiff"]
  },
  {
    id: "e07",
    keywords: ["fatal: not a git repository", "not a git repository", "fatal: not a git"],
    title: "Not a Git Repository",
    description: "You're running a git command outside of a repository folder, or the .git folder is missing.",
    fix: "git init",
    altFix: "cd /path/to/your/repo",
    tags: ["Init repo", "Navigate first"]
  },
  {
    id: "e08",
    keywords: ["connection refused", "connection timed out", "unable to connect", "econnrefused"],
    title: "Connection Refused",
    description: "The server is not running, not listening on the expected port, or a firewall is blocking the connection.",
    fix: "curl -v http://localhost:<port>",
    altFix: "netstat -tulpn | grep LISTEN",
    tags: ["Network debug", "Port check"]
  },
  {
    id: "e09",
    keywords: ["cannot find module", "module not found", "cannot find package"],
    title: "Module / Package Not Found",
    description: "Node.js or Python can't find a dependency. You likely need to install packages or your node_modules folder is missing.",
    fix: "npm install",
    altFix: "pip install -r requirements.txt",
    tags: ["Install deps", "Node / Python"]
  },
  {
    id: "e10",
    keywords: ["rejected", "failed to push", "push rejected", "non-fast-forward"],
    title: "Git Push Rejected",
    description: "The remote has changes your local branch doesn't have. You need to pull first before you can push.",
    fix: "git pull --rebase origin main",
    altFix: "git fetch && git rebase origin/main",
    tags: ["Pull first", "Rebase safe"]
  },
  {
    id: "e11",
    keywords: ["oom", "out of memory", "killed", "memory limit exceeded"],
    title: "Out of Memory (OOM Kill)",
    description: "The process was killed by the OS because it exceeded available memory. Check memory limits in Docker or your system.",
    fix: "docker stats",
    altFix: "free -h && cat /proc/meminfo",
    tags: ["Memory check", "Container limits"]
  },
  {
    id: "e12",
    keywords: ["ssl certificate", "certificate verify failed", "ssl error", "self signed"],
    title: "SSL Certificate Error",
    description: "The SSL/TLS certificate is invalid, expired, or self-signed and the client is refusing to connect.",
    fix: "curl -k https://your-url.com",
    altFix: "openssl s_client -connect host:443",
    tags: ["SSL bypass", "Diagnose cert"]
  },
];
