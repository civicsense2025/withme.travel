#!/bin/bash

# Update direct AuthContext imports
find . -type f -name "*.tsx" -o -name "*.ts" | grep -v "lib/hooks/use-auth.ts" | xargs sed -i '' -e 's/import { AuthContext } from "@\/components\/auth-provider"/import { AuthContext } from "@\/lib\/hooks\/use-auth"/g'
find . -type f -name "*.tsx" -o -name "*.ts" | grep -v "lib/hooks/use-auth.ts" | xargs sed -i '' -e 's/import { AuthContext, AuthContextType } from "@\/components\/auth-provider"/import { AuthContext, AuthContextType } from "@\/lib\/hooks\/use-auth"/g'

echo "AuthContext import paths updated successfully!" 