#!/bin/bash

# Update useAuth imports in components directory
find ./components -type f -name "*.tsx" | xargs sed -i '' -e 's/import { useAuth } from "@\/components\/auth-provider"/import { useAuth } from "@\/lib\/hooks\/use-auth"/g'
find ./components -type f -name "*.tsx" | xargs sed -i '' -e 's/import { useAuth } from ".\/auth-provider"/import { useAuth } from "@\/lib\/hooks\/use-auth"/g'

# Update useAuth imports in hooks directory
find ./hooks -type f -name "*.ts" | xargs sed -i '' -e 's/import { useAuth } from "@\/components\/auth-provider"/import { useAuth } from "@\/lib\/hooks\/use-auth"/g'

# Update useAuth imports in app directory
find ./app -type f -name "*.tsx" | xargs sed -i '' -e 's/import { useAuth } from "@\/components\/auth-provider"/import { useAuth } from "@\/lib\/hooks\/use-auth"/g'

# Update type imports for AuthContextType
find . -type f -name "*.tsx" -o -name "*.ts" | grep -v "lib/hooks/use-auth.ts" | xargs sed -i '' -e 's/import type { AuthContextType } from "@\/components\/auth-provider"/import type { AuthContextType } from "@\/lib\/hooks\/use-auth"/g'
find . -type f -name "*.tsx" -o -name "*.ts" | grep -v "lib/hooks/use-auth.ts" | xargs sed -i '' -e 's/import { AuthContextType } from "@\/components\/auth-provider"/import { AuthContextType } from "@\/lib\/hooks\/use-auth"/g'

echo "Import paths updated successfully!" 