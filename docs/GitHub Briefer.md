# Git Essentials for Design-Engineers: A Friendly Guide

## Introduction

Hey there! Welcome to your comprehensive guide to Git - the tool that's going to become your best friend (and occasionally, your biggest frustration) as you navigate the world of collaborative development. As a design-engineer, you're in a unique position where you need to understand both the creative and technical aspects of version control. This guide is written specifically for you - no patronizing simplifications, just clear explanations with the right amount of detail.

## Setting Up Git

### Installation & Configuration

Before diving into commands, let's make sure Git is properly set up on your machine:

1. **Install Git**:
   - **macOS**: `brew install git` (using Homebrew) or download from [git-scm.com](https://git-scm.com)
   - **Windows**: Download from [git-scm.com](https://git-scm.com)
   - **Linux**: `sudo apt install git` (Ubuntu/Debian) or `sudo yum install git` (Fedora)

2. **Configure your identity**:
   ```bash
   git config --global user.name "Your Name"
   git config --global user.email "your.email@example.com"
   ```

> **Aside**: Your Git identity is crucial! These details will be attached to every commit you make. For work projects, use your work email. This helps with attribution and builds your contribution history that's visible to the whole team.

3. **Set up authentication**:
   - For GitHub: Set up SSH keys or use GitHub CLI
   - For other services: Follow their specific authentication guides

## Core Git Concepts

Before we dive into commands, let's understand a few key concepts:

### Repository (Repo)

A repository is essentially a project folder that Git tracks. It contains all your project files and the entire history of changes made to those files.

### Working Directory, Staging Area, and Repository

Git has three main areas:
- **Working Directory**: Where you actually work on your files
- **Staging Area (Index)**: A middle ground where you prepare changes for committing
- **Repository**: Where Git permanently stores changes as commits

> **Aside**: Think of the staging area like a photography studio where you arrange your subjects (changes) before taking the picture (commit). You can rearrange, add, or remove subjects until you're happy with the composition. This gives you fine-grained control over exactly what goes into each commit.

### Commits

A commit is a snapshot of your project at a specific point in time. Each commit has:
- A unique identifier (hash)
- A message describing what changed
- Author information
- Timestamp
- Reference to parent commit(s)

### Branches

Branches are lightweight movable pointers to commits. They allow you to develop features, fix bugs, or experiment without affecting the main codebase.

## Essential Git Operations

Now let's get into the actual commands you'll use daily:

### Creating & Cloning Repositories

**Creating a new repository**:
```bash
# Initialize a new repo in your current directory
git init

# Create a new directory, initialize it as a Git repo
git init my-new-project
cd my-new-project
```

**Cloning an existing repository**:
```bash
# Clone a repo from GitHub/GitLab/etc.
git clone https://github.com/username/repository.git

# Clone to a specific folder
git clone https://github.com/username/repository.git my-folder
```

> **Aside**: When cloning, Git automatically sets up a remote called "origin" pointing to the original repository. This is important for later pushing and pulling changes.

### Basic Workflow: Add, Commit, Push

The fundamental Git workflow looks like this:

1. **Make changes** to files in your working directory
2. **Add changes** to the staging area
3. **Commit changes** to the local repository
4. **Push changes** to the remote repository

Here are the commands:

```bash
# Check status of your working directory
git status

# Add specific files to staging area
git add filename.ext another-file.ext

# Add all changed files
git add .

# Commit staged changes
git commit -m "Clear description of the changes made"

# Push commits to remote repository
git push origin branch-name
```

> **Aside**: A good commit message is like a good design annotation - it should clearly explain the "what" and ideally the "why" of a change. Future you (and your teammates) will thank you for descriptive commit messages when trying to understand code months later.

### Branching & Merging

Branches are essential for collaborative development:

```bash
# List all branches
git branch

# Create a new branch
git branch feature-name

# Switch to a branch
git checkout feature-name

# Create and switch to a new branch (shorthand)
git checkout -b feature-name

# Merge a branch into your current branch
git merge source-branch
```

> **Aside**: As a design-engineer, branches can be particularly useful for experimental design implementations. Create a branch for each significant design exploration, so you can easily switch between different approaches without losing work.

### Fetching & Pulling

To get updates from the remote repository:

```bash
# Fetch updates from remote but don't integrate them
git fetch origin

# Pull updates from remote AND integrate them into your current branch
git pull origin branch-name
```

> **Aside**: The difference between fetch and pull is important: `fetch` just downloads the changes but doesn't apply them, while `pull` is essentially `fetch` + `merge`. Use `fetch` when you want to see what's changed before integrating.

### Resolving Merge Conflicts

Merge conflicts occur when Git can't automatically merge changes:

```bash
# After a conflict appears
# 1. Open the conflicted files and resolve the conflicts
# 2. Add the resolved files
git add resolved-file.ext

# 3. Complete the merge
git commit
```

Conflicts in files will be marked like this:
```
<<<<<<< HEAD
Your changes
=======
Their changes
>>>>>>> branch-name
```

> **Aside**: As a design-engineer, you'll likely face conflicts in CSS, HTML, or component files. Having a good code editor with Git conflict resolution features (like VS Code) makes this process much more visual and easier to handle.

## Intermediate Git Techniques

### Stashing Changes

Need to switch branches but don't want to commit your current work?

```bash
# Stash your changes
git stash save "Work in progress on feature X"

# List stashes
git stash list

# Apply the most recent stash and keep it in your stash list
git stash apply

# Apply a specific stash
git stash apply stash@{2}

# Apply and remove the most recent stash
git stash pop

# Remove a stash
git stash drop stash@{0}
```

### Viewing History

```bash
# View commit history
git log

# View abbreviated history (one line per commit)
git log --oneline

# View history with a graph of branches
git log --graph --oneline --all

# View changes in a commit
git show commit-hash
```

> **Aside**: For visual learners, GUI tools like GitKraken, Sourcetree, or GitHub Desktop can make history visualization much easier to understand than command-line output.

### Remote Repository Operations

```bash
# View remote repositories
git remote -v

# Add a remote
git remote add name url

# Remove a remote
git remote remove name

# Rename a remote
git remote rename old-name new-name
```

## Design-Engineer Specific Workflows

### Working with Design Assets

For design files and assets:

1. **Consider Git LFS (Large File Storage)** for binary files like PSD, AI, or large images
2. **Use .gitignore** to exclude auto-generated files, build artifacts, and large binary files that don't need versioning
3. **Commit exported assets** (PNG, SVG, etc.) along with source files for easy reference

Example `.gitignore` for design work:
```
# Design software files
*.psd
*.ai
*.xd
*.fig

# Generated files
node_modules/
dist/
build/

# Only if using Git LFS
# !*.psd
```

> **Aside**: Git wasn't originally designed for binary files like design assets. For collaborative design work, consider specialized tools like Abstract, Figma, or Sketch Cloud alongside Git for the code.

### Feature Branch Workflow for Design Implementation

A common workflow for implementing designs:

1. Create a feature branch from main/development
   ```bash
   git checkout -b feature/button-redesign
   ```

2. Implement design changes in small, logical commits
   ```bash
   git add src/components/Button.jsx src/styles/button.css
   git commit -m "Update button border radius and shadow"
   ```

3. Regularly push your branch to share progress
   ```bash
   git push origin feature/button-redesign
   ```

4. When ready, create a pull request and request review
   
5. Address feedback with additional commits
   ```bash
   git add src/styles/button.css
   git commit -m "Adjust button hover state per feedback"
   git push origin feature/button-redesign
   ```

6. After approval, merge to main branch (usually done via the PR interface)

## Git Best Practices

### Commit Structure

- **Atomic commits**: Make each commit a logical, self-contained change
- **Descriptive messages**: Write clear messages with a short subject line (50-72 chars) and optional detailed body
- **Present tense**: Write commit messages in present tense ("Add feature" not "Added feature")

Example of a good commit message:
```
Add hover states to primary buttons

- Implement subtle shadow increase on hover
- Add 0.2s transition for smooth interaction
- Ensure accessibility by maintaining sufficient contrast
```

### Branching Strategy

A common branching strategy:

- **main/master**: Production code
- **develop**: Integration branch for features
- **feature/x**: Individual feature development
- **bugfix/x**: Bug fixes
- **hotfix/x**: Urgent production fixes

> **Aside**: Different teams use different branching strategies like Git Flow, GitHub Flow, or GitLab Flow. Ask your team which one they follow, as it affects how you'll use branches.

## Pull Requests: A Comprehensive Guide

Pull Requests (PRs) are one of the most important collaborative features in modern Git workflows. They serve as both a code review mechanism and a communication tool for teams.

### What Is a Pull Request?

A pull request is a way to propose changes from your branch to another branch (usually the main branch). It's called a "pull request" because you're asking the project maintainers to "pull" your changes into their branch.

> **Aside**: While GitHub calls them "Pull Requests," GitLab calls the same concept "Merge Requests." Same functionality, different name!

### Creating a Pull Request

**On GitHub**:
1. Push your branch to the remote repository:
   ```bash
   git push origin your-feature-branch
   ```
2. Navigate to the repository on GitHub
3. Click "Compare & pull request" button that appears
4. Fill out the PR template with a title and description
5. Select reviewers, assign yourself, add labels
6. Click "Create pull request"

**From the command line** (using GitHub CLI):
```bash
# Install GitHub CLI first if you haven't
# Then:
gh pr create --title "Add new button design" --body "This PR implements the new button design from Figma file XYZ"
```

### Anatomy of a Great Pull Request

A well-structured PR includes:

1. **Clear title**: Concise summary of the change
2. **Detailed description**:
   - What the PR does
   - Why it's needed
   - How to test it
   - Screenshots/videos for UI changes
   - Links to related issues, designs, or specs

3. **PR Template sections**:
   ```markdown
   ## Description
   This PR adds hover and focus states to primary buttons.

   ## Design Reference
   [Figma Link](https://figma.com/file/...)

   ## Testing Instructions
   1. Go to /components page
   2. Hover over primary buttons to see effect
   3. Tab to buttons to check focus state

   ## Screenshots
   ![Button hover state](link-to-image.png)

   ## Related Issues
   Closes #123
   ```

### The Pull Request Lifecycle

1. **Draft PR**: Create early as "Draft" to show work-in-progress
2. **Review**: Team members comment, suggest changes
3. **Revisions**: Update code based on feedback
4. **Approval**: Reviewers approve when satisfied
5. **Merge**: Incorporate changes into target branch
6. **Deletion**: Delete the source branch (optional)

> **Aside**: Starting with a draft PR is particularly valuable for design-engineers. It allows you to get early feedback on the implementation approach before investing too much time in a direction that might need adjustment.

### Pull Request Reviews

**Receiving reviews**:
- Be open to feedback
- Respond to all comments
- Explain your decisions when needed
- Make requested changes or discuss alternatives
- Use "Resolve conversation" once addressed

**Giving reviews**:
- Be constructive and specific
- Explain the "why" behind suggestions
- Ask questions rather than make demands
- Comment on both code and design aspects
- Approve when you're satisfied with the changes

### Common PR Commands

```bash
# Check out a PR locally (using GitHub CLI)
gh pr checkout 123

# Fetch and checkout a PR from a specific user (old school way)
git fetch origin pull/123/head:pr-123
git checkout pr-123

# Add more commits to an existing PR
git checkout branch-name
# Make changes
git add .
git commit -m "Address PR feedback"
git push origin branch-name
```

### Branch Protection and Required Reviews

Most teams configure repositories with branch protection rules:

- **Required reviews**: PRs need X number of approvals
- **Status checks**: CI tests must pass before merging
- **Restrict who can push**: Direct pushes to main are forbidden

> **Aside**: These protections aren't limitations but safeguards that help maintain code quality. They're especially important for design-engineers, as they ensure both the engineering and design aspects of your work are vetted before they reach production.

### Merge vs. Rebase

Two ways to integrate changes:

```bash
# Merge (creates a merge commit)
git merge feature-branch

# Rebase (replays your commits on top of the target branch)
git rebase main
```

> **Aside**: The merge vs. rebase decision is often team-dependent. Merging preserves history exactly as it happened but can create a cluttered history. Rebasing creates a cleaner, linear history but rewrites commit history. Ask your team about their preference.

## Handling Mistakes

Everyone makes mistakes! Here's how to recover:

### Undoing Changes

```bash
# Discard changes in working directory for specific file
git checkout -- filename.ext

# Discard all unstaged changes
git restore .  # (newer Git versions)
git checkout -- .  # (older Git versions)

# Unstage a file (remove from staging area)
git restore --staged filename.ext  # (newer Git versions)
git reset HEAD filename.ext  # (older Git versions)

# Amend the last commit (e.g., forgot to add a file)
git add forgotten-file.ext
git commit --amend
```

### Reverting Commits

```bash
# Create a new commit that undoes a previous commit
git revert commit-hash

# Reset to a previous state (CAUTION: rewrites history)
git reset --soft commit-hash  # Keep changes staged
git reset commit-hash         # Keep changes unstaged
git reset --hard commit-hash  # Discard changes completely
```

> **Aside**: Be extremely cautious with `git reset --hard`. It permanently discards changes with no way to recover them unless they've been pushed to a remote or stashed elsewhere.

## Advanced Git Techniques

### Interactive Rebasing

Clean up your commit history before pushing:

```bash
git rebase -i HEAD~3  # Interactive rebase of last 3 commits
```

This opens an editor where you can:
- `pick`: Keep the commit as is
- `reword`: Change the commit message
- `edit`: Pause to amend the commit
- `squash`: Combine with previous commit, keeping both messages
- `fixup`: Combine with previous commit, discarding this message
- `drop`: Remove the commit entirely

> **Aside**: Interactive rebasing is like digital clay – it lets you reshape your commit history to tell a clearer story. However, only rebase commits that haven't been pushed to a shared branch, or you'll create problems for teammates.

### Git Bisect for Debugging

When you need to find which commit introduced a bug:

```bash
# Start the bisect process
git bisect start

# Mark the current commit as bad
git bisect bad

# Mark a known good commit
git bisect good abc123

# Git will checkout commits for you to test
# After testing each commit, mark it:
git bisect good  # This commit doesn't have the bug
# or
git bisect bad   # This commit has the bug

# When finished, git will identify the first bad commit
# Return to your original branch
git bisect reset
```

> **Aside**: Git bisect is particularly valuable for design-engineers when dealing with visual regressions. It can help pinpoint exactly which commit introduced an unwanted visual change, even if it wasn't directly related to the design files themselves.

### Git Worktrees: Multiple Working Directories

Work on different branches simultaneously without switching:

```bash
# Create a new worktree
git worktree add ../path-to-worktree branch-name

# List worktrees
git worktree list

# Remove a worktree
git worktree remove ../path-to-worktree
```

This creates a separate working directory linked to your repository, allowing you to have multiple branches checked out at once.

> **Aside**: For design-engineers, worktrees are invaluable when you need to reference one design implementation while working on another, or when you need to quickly fix a bug in production while continuing to work on a feature branch.

### Git Hooks

Automate tasks with Git hooks:

- `pre-commit`: Run linters, formatters, tests before committing
- `pre-push`: Run more extensive tests before pushing
- `post-merge`: Update dependencies after pulling changes

Hooks are stored in the `.git/hooks` directory as executable scripts.

### Submodules & Subtrees

For working with nested repositories:

```bash
# Add a submodule
git submodule add https://github.com/username/repo.git path/to/submodule

# Initialize and update submodules after cloning
git submodule update --init --recursive
```

## Essential GitHub/GitLab Features & Structures

Understanding GitHub's ecosystem beyond just Git commands is crucial for effective collaboration. Here's a comprehensive look at the platform's most important features:

### Repository Structure & Special Files

**Key Special Files**:
- **README.md**: The landing page of your repository that explains what the project is, how to use it, and how to contribute
- **.gitignore**: Tells Git which files to ignore (build artifacts, dependencies, etc.)
- **LICENSE**: Defines how others can use your code
- **CONTRIBUTING.md**: Guidelines for contributing to the project
- **.github/**: Directory containing GitHub-specific configuration
  - **workflows/**: GitHub Actions workflow files
  - **ISSUE_TEMPLATE/**: Templates for different issue types
  - **PULL_REQUEST_TEMPLATE.md**: Template for pull requests

> **Aside**: As a design-engineer, you might want to add design-specific sections to these files, such as UI component guidelines in CONTRIBUTING.md or design asset organization in README.md.

### Issues & Issue Management

Issues are GitHub's ticket system for tracking work:

- **Labels**: Categorize issues (bug, enhancement, design, etc.)
- **Assignees**: Designate who's responsible
- **Milestones**: Group issues for specific releases
- **Projects**: Organize issues in kanban boards
- **Linking**: Reference other issues or PRs with #123

**Issue Templates** help standardize how work is requested:
```yaml
# .github/ISSUE_TEMPLATE/design_request.yml
name: Design Request
description: Request a new design or design changes
body:
  - type: dropdown
    id: type
    attributes:
      label: Type of design
      options:
        - New feature
        - Refinement
        - Design system update
  - type: textarea
    id: description
    attributes:
      label: Description
      description: What needs to be designed?
    validations:
      required: true
```

### GitHub Actions (CI/CD)

GitHub Actions automate workflows like testing, building, and deploying:

**Workflow file example** (.github/workflows/ci.yml):
```yaml
name: CI
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Install dependencies
        run: npm ci
      - name: Run tests
        run: npm test
      - name: Build storybook
        run: npm run build-storybook
```

**Common design-engineering workflows**:
- Automatically generate and deploy Storybook documentation
- Run visual regression tests on UI components
- Lint CSS and check for accessibility issues
- Deploy preview environments for design review

### GitHub Pages

Host documentation, portfolio, or static sites directly from your repository:

```bash
# Create a gh-pages branch
git checkout -b gh-pages

# Add your static content
# ...

# Push to GitHub
git push origin gh-pages
```

Configure in repository settings which branch to use for GitHub Pages.

### Discussions & Team Communication

**GitHub Discussions**: A forum-like feature for:
- Design critiques
- Architecture discussions
- Q&A that doesn't fit in issues
- Documentation that benefits from conversation

**GitHub Teams**: Organize collaborators into teams with specific permissions and mention them with @team-name.

### Advanced GitHub Features

**GitHub Codespaces**: Cloud development environments
- Work in a consistent environment with pre-installed tools
- Great for onboarding new team members
- Configure with .devcontainer files

**GitHub Copilot**: AI pair programming
- Suggests code as you type
- Helps with boilerplate and repetitive tasks
- Particularly useful for translating design intentions to code

**Dependency Management**:
- Dependabot alerts for security vulnerabilities
- Automatic version updates via pull requests
- Security policy (.github/SECURITY.md)

### GitHub CLI & API

**GitHub CLI** for common operations:
```bash
# Create an issue
gh issue create --title "Update button hover states" --body "The hover state needs to match the design system"

# List open pull requests assigned to you
gh pr list --assignee "@me"

# View CI status
gh pr checks

# Browse the repository on github.com
gh repo view --web
```

**GitHub API** for custom tooling and integrations:
- Create custom design review tools
- Automate release notes from PR descriptions
- Build dashboards for design and development progress

### Repository Insights & Analytics

**GitHub Insights** provide valuable metrics:
- Contribution activity
- Code frequency
- Dependency graph
- Network graph for visualizing branch history

> **Aside**: These metrics can be particularly useful for design-engineers to see how design changes impact development activity and to identify which components see the most updates over time.

### Useful Git GUI Tools

- **GitHub Desktop**: Simple, focused on GitHub workflow
- **GitKraken**: Feature-rich with visual commit graph
- **Sourcetree**: Powerful, detailed interface
- **VS Code Git Integration**: Great for handling conflicts and reviewing changes

## Troubleshooting Common Issues

### "I committed to the wrong branch!"

```bash
# 1. Create a new branch from your current state
git branch correct-branch

# 2. Move to the original branch you should have committed to
git checkout original-branch

# 3. Cherry-pick the commit
git cherry-pick commit-hash

# 4. Remove the commit from the wrong branch
git checkout wrong-branch
git reset --hard HEAD~1
```

### "I need to update my branch with main changes"

```bash
# Method 1: Merge main into your branch
git checkout your-branch
git merge main

# Method 2: Rebase your branch onto main
git checkout your-branch
git rebase main
```

### "Git says 'Your local changes would be overwritten'"

```bash
# 1. Stash your changes
git stash

# 2. Pull or checkout
git pull origin main

# 3. Reapply your changes
git stash pop
```

## Final Thoughts

Remember, Git is just a tool to help you collaborate and manage your work effectively. Like any powerful tool, it takes time to master. Don't be afraid to make mistakes – Git is designed to help you recover from most of them.

As a design-engineer, you're bridging two worlds, and version control is essential for both. Use Git to document not just the code changes, but also the design decisions and iterations that lead to your final implementation.

Happy coding (and designing)!

---

## Additional Resources

### Learning Resources
- [Git Documentation](https://git-scm.com/doc)
- [Learn Git Branching](https://learngitbranching.js.org/)
- [Oh Shit, Git!?!](https://ohshitgit.com/) - Solutions to common Git mistakes
- [GitHub Skills](https://skills.github.com/) - Interactive GitHub tutorials

### Cheat Sheets
- [Git Cheat Sheet](https://education.github.com/git-cheat-sheet-education.pdf) by GitHub Education
- [Atlassian Git Cheat Sheet](https://www.atlassian.com/git/tutorials/atlassian-git-cheatsheet)